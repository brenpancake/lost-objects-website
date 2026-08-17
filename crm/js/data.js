
// ═══ UNIFIED DATA MODEL ══════════════════════════════════════════════════════
// Companies carry the lifecycle status. Contacts are people who reference a
// company via companyId. Intake is a sub-object on a company that GRADUATES
// (marked, never deleted) rather than living in a parallel dataset.
//
// STEP 1 OF THE UNIFICATION. This file builds and persists the model, and then
// installs a compatibility layer so every existing view keeps reading exactly
// what it read before. No view is rewired today — that is step 2. Because of
// that, contact.cat / contact.company / contact.service are kept alive as
// derived mirror fields; they are removed once the views read the model.
//
// Loads after intake.js (needs svcById/CHECKLIST_ITEMS) and before boot.js.

var companies = [];

function newCoId(){ return 'co_' + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4); }
function newEngId(){ return 'eng_' + Math.random().toString(36).slice(2,8); }

// ── company factory ─────────────────────────────────────────────────────────
function makeCompany(o){
  return {
    id:            o.id || newCoId(),
    name:          o.name || '',
    isSolo:        !!o.isSolo,
    handle:        o.handle || '',
    website:       o.website || '',
    color:         o.color || '',
    notes:         o.notes || '',

    lifecycle:     o.lifecycle || 'network',
    intake:        o.intake || null,
    engagements:   o.engagements || [],
    owner:         o.owner || null,

    tags:          o.tags || [],
    lastContact:   o.lastContact || '',
    created:       o.created || Date.now(),
    statusHistory: o.statusHistory || [],

    deletion_requested:    !!o.deletion_requested,
    deletion_requested_by: o.deletion_requested_by || null
  };
}

// ── intake sub-object factory ───────────────────────────────────────────────
// source: 'pipeline'  = arrived through the intake command centre
//         'website-form' = arrived through the homepage form (the older model)
function makeIntake(o){
  return {
    stage:      o.stage || 'new',        // new | confirmed | assigned | onboarding
    lane:       o.lane || 'booking',     // booking | application | enquiry
    source:     o.source || 'pipeline',
    requested:  o.requested || null,
    service:    o.service || null,       // confirmed service id
    message:    o.message || '',
    receivedAt: o.receivedAt || Date.now(),
    startedAt:  o.startedAt || null,
    formType:   o.formType || null,
    answers:    o.answers || null,
    checklist:  o.checklist || {},
    containers: o.containers || {},
    graduated:  !!o.graduated,
    graduatedAt:o.graduatedAt || null
  };
}

function makeEngagement(o){
  return {
    id:          o.id || newEngId(),
    serviceId:   o.serviceId || null,
    name:        o.name || '',
    lane:        o.lane || null,
    status:      o.status || 'active',   // proposed | active | completed | paused
    price:       o.price || '',
    manager:     o.manager || null,
    startedAt:   o.startedAt || null,
    completedAt: o.completedAt || null
  };
}

// ═══ MIGRATION ═══════════════════════════════════════════════════════════════
// Runs once. Existing contact ids are preserved verbatim — favorites bins,
// notifications, feed items and already-distributed share.html links all
// reference them, and three of those four fail silently if ids move.

function buildUnifiedModel(){
  var out = [], byName = {};

  // ── 1. group existing contacts by their company string ────────────────────
  contacts.forEach(function(c){
    var key = c.company || ('__solo__' + c.id);
    if(!byName[key]) byName[key] = [];
    byName[key].push(c);
  });

  Object.keys(byName).forEach(function(key){
    var members = byName[key];
    var solo    = key.indexOf('__solo__') === 0;
    var name    = solo ? (members[0].first + ' ' + members[0].last) : key;

    // lifecycle from the highest-ranked cat present, then any human override
    var best = null;
    members.forEach(function(c){
      if(!best || (CAT_RANK[c.cat]||0) > (CAT_RANK[best]||0)) best = c.cat;
    });
    var lifecycle = LIFECYCLE_OVERRIDES[name] || CAT_TO_LIFECYCLE[best] || 'network';

    // a website-form inquiry means this company is still in intake
    var inqC = members.find(function(c){ return c.inquiry; });
    var intake = null;
    if(inqC){
      lifecycle = 'lead';
      intake = makeIntake({
        stage:'new', source:'website-form',
        lane: inqC.inquiry.formType === 'Just Talk to Us' ? 'enquiry'
            : (inqC.service === 'Full Social Media Management' ? 'application' : 'booking'),
        message: inqC.inquiry.message || inqC.inquiry.goal || '',
        receivedAt: inqC.created || Date.now(),
        formType: inqC.inquiry.formType,
        answers: inqC.inquiry
      });
    }

    // engagements from the free-text service strings on this company's people
    var engagements = [];
    var svcs = [];
    members.forEach(function(c){ if(c.service && svcs.indexOf(c.service) === -1) svcs.push(c.service); });
    svcs.forEach(function(s){
      engagements.push(makeEngagement({
        name: s,
        status: lifecycle === 'active' ? 'active' : (lifecycle === 'dormant' || lifecycle === 'former' ? 'completed' : 'proposed'),
        startedAt: lifecycle === 'active' ? (members[0].created || null) : null
      }));
    });
    // a dormant company completed work but may carry its reason on a former contact
    if(lifecycle === 'dormant' && !engagements.length){
      var fc = members.find(function(c){ return c.cat === 'former'; });
      engagements.push(makeEngagement({ name: (fc && fc.formerReason) ? fc.formerReason : 'Completed engagement', status:'completed' }));
    }

    var latest = '';
    members.forEach(function(c){ if(c.lastContact && c.lastContact > latest) latest = c.lastContact; });
    var tags = [];
    members.forEach(function(c){ (c.tags||[]).forEach(function(t){ if(tags.indexOf(t) === -1) tags.push(t); }); });

    var co = makeCompany({
      name: name,
      isSolo: solo || members.length === 1 && name === (members[0].first + ' ' + members[0].last),
      handle: (members[0].website && members[0].website.charAt(0) === '@') ? members[0].website : '',
      website: (members[0].website && members[0].website.charAt(0) !== '@') ? members[0].website : '',
      color: solo ? '' : getCoColor(name),
      notes: solo ? '' : getCoNotes(name),
      lifecycle: lifecycle,
      intake: intake,
      engagements: engagements,
      tags: tags,
      lastContact: latest,
      created: Math.min.apply(null, members.map(function(c){ return c.created || Date.now(); }))
    });

    // link the people to it
    members.forEach(function(c, i){
      c.companyId = co.id;
      c.role = c.cat === 'contacts' ? 'network' : (i === 0 ? 'primary' : 'stakeholder');
    });
    out.push(co);
  });

  // ── 2. the intake pipeline leads become companies + contacts ──────────────
  // Halcyon Studios is the proof case: ONE record, lifecycle active, intake
  // present and marked graduated. Nothing is duplicated, nothing is thrown away.
  INTAKE_SEED.forEach(function(l){
    var isGraduated = l.stage === 'Active';
    var stage = isGraduated ? 'onboarding' : String(l.stage||'new').toLowerCase();
    var solo  = l.name === l.contact;
    var svc   = l.service ? svcById(l.service) : null;

    var co = makeCompany({
      name: l.name,
      isSolo: solo,
      handle: l.handle || '',
      lifecycle: isGraduated ? 'active' : (stage === 'new' ? 'lead' : 'prospect'),
      owner: l.manager ? (MANAGER_KEYS[l.manager] || null) : null,
      created: l.receivedAt,
      lastContact: new Date(l.receivedAt).toISOString().slice(0,10),
      intake: makeIntake({
        stage: stage, lane: l.lane, source:'pipeline',
        requested: l.requested, service: l.service, message: l.message,
        receivedAt: l.receivedAt, startedAt: l.startedAt || null,
        checklist: l.checklist || {}, containers: l.containers || {},
        graduated: isGraduated,
        graduatedAt: isGraduated ? (l.startedAt || l.receivedAt) : null
      }),
      engagements: svc ? [makeEngagement({
        serviceId: svc.id, name: svc.name, lane: l.lane, price: svc.price,
        status: isGraduated ? 'active' : (stage === 'onboarding' ? 'active' : 'proposed'),
        manager: l.manager ? (MANAGER_KEYS[l.manager]||null) : null,
        startedAt: l.startedAt || null
      })] : []
    });

    // the person who made contact becomes this company's primary contact
    var parts = String(l.contact||'').split(' ');
    contacts.push({
      id: uid(),
      companyId: co.id,
      role: 'primary',
      first: parts[0] || l.contact || '',
      last:  parts.slice(1).join(' ') || '',
      company: l.name,                                   // mirror, for the current views
      title: '',
      email: l.email || '',
      phone: '',
      website: l.handle || '',
      cat: LIFECYCLE_TO_CAT[co.lifecycle] || 'prospects', // mirror
      service: svc ? svc.name : '',                       // mirror
      formerReason: '',
      tags: [],
      lastContact: new Date(l.receivedAt).toISOString().slice(0,10),
      notes: l.message || '',
      comments: [],
      created: l.receivedAt
    });
    out.push(co);
  });

  return out;
}

// ── persistence ─────────────────────────────────────────────────────────────
function saveCompanies(){ ls.set(UCK, companies); }

function migrateUnifiedModel(){
  var stored = ls.get(UCK);
  if(stored && stored.length){
    companies = stored;
    relinkContacts();
    return false;                 // already migrated
  }
  // keep a rollback copy of the pre-migration contact store, once
  if(!ls.get(PREMIGRATION_KEY)) ls.set(PREMIGRATION_KEY, contacts);
  companies = buildUnifiedModel();
  saveCompanies();
  ls.set(CK, contacts);           // persists companyId/role + the new lead contacts
  return true;                    // fresh migration ran
}

// Reattach contacts to companies after a reload (companyId is persisted, but a
// contact added by the old add-form has none — fall back to matching by name).
function relinkContacts(){
  var byId = {}, byName = {};
  companies.forEach(function(co){ byId[co.id] = co; byName[co.name] = co; });
  contacts.forEach(function(c){
    if(c.companyId && byId[c.companyId]) return;
    if(c.company && byName[c.company]){ c.companyId = byName[c.company].id; return; }
    c.companyId = c.companyId || null;
  });
}

// Keep the model in step with writes the old views still make against
// `contacts`. Called from updateCounts(), which every mutation path runs.
function syncUnifiedModel(){
  if(!companies.length) return;
  var byId = {}, byName = {};
  companies.forEach(function(co){ byId[co.id] = co; byName[co.name] = co; });

  contacts.forEach(function(c){
    // a contact moved to a company that has no record yet (add-form, drag-drop)
    if(c.company && !byName[c.company]){
      var co = makeCompany({ name:c.company, lifecycle: CAT_TO_LIFECYCLE[c.cat] || 'network',
                             color:getCoColor(c.company), notes:getCoNotes(c.company) });
      companies.push(co); byName[c.company] = co; byId[co.id] = co;
    }
    if(c.company && byName[c.company]) c.companyId = byName[c.company].id;
  });

  // refresh derived company fields from their people, without touching
  // intake / engagements / owner / statusHistory
  companies.forEach(function(co){
    var members = contactsOfCompany(co.id);
    if(!members.length) return;
    var best = null;
    members.forEach(function(c){ if(!best || (CAT_RANK[c.cat]||0) > (CAT_RANK[best]||0)) best = c.cat; });
    var derived = LIFECYCLE_OVERRIDES[co.name] || CAT_TO_LIFECYCLE[best] || 'network';
    // never let a mirror-derived value clobber a real lifecycle decision
    if(!co.intake && co.lifecycle !== derived && ['active','prospect','former','network'].indexOf(co.lifecycle) > -1){
      co.statusHistory.push({ from:co.lifecycle, to:derived, ts:Date.now(), by:(typeof currentUser!=='undefined'?currentUser:null), reason:'derived from contact category' });
      co.lifecycle = derived;
    }
    var latest = '';
    members.forEach(function(c){ if(c.lastContact && c.lastContact > latest) latest = c.lastContact; });
    co.lastContact = latest;
    if(!co.isSolo){ co.color = getCoColor(co.name); co.notes = getCoNotes(co.name); }
  });
  saveCompanies();
}

// ═══ COMPATIBILITY READ LAYER ════════════════════════════════════════════════
// Accessors the views will move onto in step 2. Nothing reads these yet except
// nothing else.

function getCompany(id){ return companies.find(function(co){ return co.id === id; }) || null; }
function getCompanyByName(n){ return companies.find(function(co){ return co.name === n; }) || null; }
function companyOfContact(c){ return c && c.companyId ? getCompany(c.companyId) : null; }
function contactsOfCompany(id){ return contacts.filter(function(c){ return c.companyId === id; }); }
function primaryContactOf(id){
  var m = contactsOfCompany(id);
  return m.find(function(c){ return c.role === 'primary'; }) || m[0] || null;
}
function liveCompanies(){ return companies.filter(function(co){ return !co.deletion_requested; }); }
function companiesByLifecycle(s){ return liveCompanies().filter(function(co){ return co.lifecycle === s; }); }
function intakeQueue(){
  return liveCompanies().filter(function(co){
    return co.intake && ['lead','prospect'].indexOf(co.lifecycle) > -1;
  });
}
// All comments for a company, aggregated from its people (comments stay on the
// person — moving them would risk the ids that favorites/notifs/feed depend on).
function commentsOfCompany(id){
  var out = [];
  contactsOfCompany(id).forEach(function(c){
    (c.comments||[]).forEach(function(cm){ out.push({ contactId:c.id, contactName:c.first+' '+c.last, comment:cm }); });
  });
  return out.sort(function(a,b){ return (a.comment.ts||0) - (b.comment.ts||0); });
}
function activeEngagements(co){ return (co.engagements||[]).filter(function(e){ return e.status === 'active'; }); }
// Dormant is stored, not derived — but suggest it when the shape fits.
function suggestsDormant(co){
  return co.lifecycle === 'active' && (co.engagements||[]).length > 0 &&
         activeEngagements(co).length === 0 &&
         co.engagements.some(function(e){ return e.status === 'completed'; });
}

// ═══ RUN ═════════════════════════════════════════════════════════════════════
migrateUnifiedModel();
relinkContacts();

// ═══ PUBLIC API ══════════════════════════════════════════════════════════════
// Everything below is what views are allowed to touch. Everything above is
// internal (factories, migration, reconciliation) — views have no business
// calling makeCompany/buildUnifiedModel/relinkContacts directly.
//
// No module system: the codebase is deliberately flat-global (see PLAN.md), so
// "public" here means documented intent, enforced by review rather than syntax.
//
//   STATE      companies, contacts
//   QUERIES    liveCompanies, companiesByLifecycle, pastCompanies, intakeQueue,
//              networkContacts, getCompany, getCompanyByName, companyOfContact,
//              contactsOfCompany, primaryContactOf, commentsOfCompany,
//              activeEngagements, suggestsDormant, companyMatches, contactMatches
//   MUTATIONS  setLifecycle, setIntakeStage, graduateIntake, confirmIntakeService,
//              assignIntakeOwner, toggleIntakeChecklist, moveContactToCompany,
//              ensureCompany, setCompanyColor, setCompanyNotes, saveCompanies

// ── queries ─────────────────────────────────────────────────────────────────
// The Past view carries both terminal states: nothing is lifecycle 'former'
// today (DJI is dormant), and Dormant is the re-engagement pool.
function pastCompanies(){
  return liveCompanies().filter(function(co){ return co.lifecycle === 'former' || co.lifecycle === 'dormant'; });
}
function networkContacts(){
  return liveContacts().filter(function(c){ return c.role === 'network'; });
}
function trashedCompanies(){
  return companies.filter(function(co){ return !!co.deletion_requested; });
}
// A company's colour: stored on the record, seeded from its name so a company
// with no explicit colour still looks the same as it did before.
function companyColor(co){ return co && co.color ? co.color : autoColor(co ? co.name : ''); }
function setCompanyColor(co, hex){ if(!co) return; co.color = hex; saveCompanies(); }
function setCompanyNotes(co, notes){ if(!co) return; co.notes = notes; saveCompanies(); }

// ── search ──────────────────────────────────────────────────────────────────
function companyMatches(co, q){
  if(!q) return true;
  var people = contactsOfCompany(co.id).map(function(c){ return c.first + ' ' + c.last + ' ' + (c.title||'') + ' ' + (c.email||''); }).join(' ');
  var eng = (co.engagements||[]).map(function(e){ return e.name; }).join(' ');
  return [co.name, co.handle, co.website, co.notes, LIFECYCLE_LBL[co.lifecycle], eng, people]
    .concat(co.tags||[]).join(' ').toLowerCase().indexOf(q) > -1;
}
function contactMatches(c, q){
  if(!q) return true;
  var co = companyOfContact(c);
  return [c.first, c.last, c.title, c.email, c.website, c.notes, co ? co.name : '']
    .concat(c.tags||[]).join(' ').toLowerCase().indexOf(q) > -1;
}

// ── mutations ───────────────────────────────────────────────────────────────
function setLifecycle(co, next, reason){
  if(!co || co.lifecycle === next) return false;
  co.statusHistory.push({ from:co.lifecycle, to:next, ts:Date.now(),
                          by:(typeof currentUser!=='undefined'?currentUser:null), reason:reason||'' });
  co.lifecycle = next;
  saveCompanies();
  return true;
}
function setIntakeStage(co, stage){
  if(!co || !co.intake) return false;
  co.intake.stage = stage;
  co.intake.graduated = false;
  co.intake.graduatedAt = null;
  setLifecycle(co, stage === 'new' ? 'lead' : 'prospect', 'intake stage set to ' + stage);
  saveCompanies();
  return true;
}
// Onboarding complete -> lifecycle Active, intake MARKED graduated (never deleted:
// the intake record is the company's origin story and stays queryable forever).
function graduateIntake(co){
  if(!co || !co.intake) return false;
  co.intake.graduated = true;
  co.intake.graduatedAt = Date.now();
  (co.engagements||[]).forEach(function(e){ if(e.status === 'proposed') e.status = 'active'; });
  if(!co.intake.startedAt) co.intake.startedAt = Date.now();
  setLifecycle(co, 'active', 'onboarding complete');
  saveCompanies();
  return true;
}
function confirmIntakeService(co, svcId){
  if(!co || !co.intake) return false;
  var svc = svcById(svcId);
  co.intake.service = svcId;
  if(svc){
    var e = co.engagements[0];
    if(e){ e.serviceId = svc.id; e.name = svc.name; e.price = svc.price; e.lane = co.intake.lane; }
    else co.engagements.push(makeEngagement({ serviceId:svc.id, name:svc.name, price:svc.price, lane:co.intake.lane, status:'proposed' }));
  }
  var bumped = false;
  if(co.intake.stage === 'new'){ co.intake.stage = 'confirmed'; bumped = setLifecycle(co,'prospect','service confirmed'); }
  saveCompanies();
  return bumped;
}
function assignIntakeOwner(co, userKey){
  if(!co) return false;
  co.owner = userKey || null;
  if(co.engagements[0]) co.engagements[0].manager = co.owner;
  var bumped = false;
  if(co.intake && ['new','confirmed'].indexOf(co.intake.stage) > -1){
    co.intake.stage = 'assigned';
    bumped = setLifecycle(co,'prospect','manager assigned');
  }
  saveCompanies();
  return bumped;
}
// Returns {allDone, graduated} so the view can report what happened.
function toggleIntakeChecklist(co, key){
  if(!co || !co.intake) return { allDone:false, graduated:false };
  if(!co.intake.checklist) co.intake.checklist = {};
  co.intake.checklist[key] = !co.intake.checklist[key];
  var items = CHECKLIST_ITEMS[co.intake.lane] || CHECKLIST_ITEMS.booking;
  var allDone = items.every(function(it){ return !!co.intake.checklist[it.key]; });
  var graduated = false;
  if(allDone && !co.intake.graduated){ graduateIntake(co); graduated = true; }
  saveCompanies();
  return { allDone:allDone, graduated:graduated };
}
// Find or create a company by name — used by the add/edit contact form.
function ensureCompany(name, lifecycle){
  if(!name) return null;
  var co = getCompanyByName(name);
  if(co) return co;
  co = makeCompany({ name:name, lifecycle:lifecycle||'network' });
  companies.push(co);
  saveCompanies();
  return co;
}
function moveContactToCompany(contactId, companyId){
  var c = contacts.find(function(x){ return x.id === contactId; });
  if(!c || c.companyId === companyId) return false;
  c.companyId = companyId;
  ls.set(CK, contacts);
  return true;
}
