
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
// Loads after intake.js (it consumes the seeded intakeLeads) and before boot.js.

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
  intakeLeads.forEach(function(l){
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
// the intakeLeads projection below.

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

// ── intakeLeads projection ──────────────────────────────────────────────────
// The intake view mutates lead objects directly (l.stage=…, l.manager=…,
// l.checklist[k]=…). These are live accessors onto the company's intake
// sub-object, so those writes land on the model with the view unchanged.
//
// Only 'pipeline'-sourced intakes are exposed, which keeps the queue at the
// same 6 cards it shows today. Step 2 widens this to the full intakeQueue(),
// picking up the 4 website-form leads that are already in the model.
function leadView(co){
  var l = {};
  function prop(name, get, set){ Object.defineProperty(l, name, { get:get, set:set, enumerable:true, configurable:true }); }

  prop('id',         function(){ return co.id; });
  prop('companyId',  function(){ return co.id; });
  prop('name',       function(){ return co.name; },    function(v){ co.name = v; });
  prop('handle',     function(){ return co.handle; },  function(v){ co.handle = v; });
  prop('contact',    function(){ var p = primaryContactOf(co.id); return p ? (p.first + ' ' + p.last).trim() : ''; });
  prop('email',      function(){ var p = primaryContactOf(co.id); return p ? p.email : ''; });
  prop('lane',       function(){ return co.intake.lane; },       function(v){ co.intake.lane = v; });
  prop('requested',  function(){ return co.intake.requested; },  function(v){ co.intake.requested = v; });
  prop('message',    function(){ return co.intake.message; },    function(v){ co.intake.message = v; });
  prop('receivedAt', function(){ return co.intake.receivedAt; }, function(v){ co.intake.receivedAt = v; });
  prop('startedAt',  function(){ return co.intake.startedAt; },  function(v){ co.intake.startedAt = v; });
  prop('checklist',  function(){ return co.intake.checklist; },  function(v){ co.intake.checklist = v; saveCompanies(); });
  prop('containers', function(){ return co.intake.containers; }, function(v){ co.intake.containers = v; });

  // confirmed service also keeps the engagement row honest
  prop('service', function(){ return co.intake.service; }, function(v){
    co.intake.service = v;
    var svc = v ? svcById(v) : null;
    if(svc){
      var e = co.engagements[0];
      if(e){ e.serviceId = svc.id; e.name = svc.name; e.price = svc.price; e.lane = co.intake.lane; }
      else co.engagements.push(makeEngagement({ serviceId:svc.id, name:svc.name, price:svc.price, lane:co.intake.lane, status:'proposed' }));
    }
    saveCompanies();
  });

  // manager is a display name in the view, a user key in the model
  prop('manager', function(){ return co.owner ? (MANAGER_NAMES[co.owner] || null) : null; },
                  function(v){
                    co.owner = v ? (MANAGER_KEYS[v] || null) : null;
                    if(co.engagements[0]) co.engagements[0].manager = co.owner;
                    saveCompanies();
                  });

  // 'Active' is a lifecycle status, not an intake stage. Setting it graduates
  // the intake (marked, never deleted); setting an earlier stage un-graduates.
  prop('stage', function(){
    if(co.intake.graduated && co.lifecycle === 'active') return 'Active';
    return co.intake.stage.charAt(0).toUpperCase() + co.intake.stage.slice(1);
  }, function(v){
    var prev = co.lifecycle;
    if(v === 'Active'){
      co.intake.graduated = true;
      co.intake.graduatedAt = co.intake.graduatedAt || Date.now();
      co.lifecycle = 'active';
      (co.engagements||[]).forEach(function(e){ if(e.status === 'proposed') e.status = 'active'; });
    } else {
      co.intake.graduated = false;
      co.intake.graduatedAt = null;
      co.intake.stage = String(v).toLowerCase();
      co.lifecycle = co.intake.stage === 'new' ? 'lead' : 'prospect';
    }
    if(prev !== co.lifecycle)
      co.statusHistory.push({ from:prev, to:co.lifecycle, ts:Date.now(), by:(typeof currentUser!=='undefined'?currentUser:null), reason:'intake stage set to '+v });
    // keep the mirror on this company's people so the other views agree
    contactsOfCompany(co.id).forEach(function(c){ c.cat = LIFECYCLE_TO_CAT[co.lifecycle] || c.cat; });
    ls.set(CK, contacts);
    saveCompanies();
  });

  return l;
}

function buildIntakeProjection(){
  return liveCompanies()
    .filter(function(co){ return co.intake && co.intake.source === 'pipeline'; })
    .sort(function(a,b){ return (b.intake.receivedAt||0) - (a.intake.receivedAt||0); })
    .map(leadView);
}

// ═══ RUN ═════════════════════════════════════════════════════════════════════
migrateUnifiedModel();
relinkContacts();
// swap the seeded array for the live projection, then re-point the selection
intakeLeads = buildIntakeProjection();
if(intakeLeads.length) selectedLeadId = intakeLeads[0].id;
