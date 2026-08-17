
// ═══ UNIFIED DATA MODEL ══════════════════════════════════════════════════════
// Companies carry the lifecycle status. Contacts are people who reference a
// company via companyId. Intake is a sub-object on a company that GRADUATES
// (marked, never deleted) rather than living in a parallel dataset.
//
// Phase 1 complete: there is no compatibility layer. No mirror fields, no
// projection, no derivation from a legacy shape — every view reads this model.
//
// No module system: the codebase is deliberately flat-global (see PLAN.md), so
// "public" below means documented intent, enforced by review rather than syntax.
//
//   STATE      companies, contacts
//   QUERIES    liveCompanies, companiesByLifecycle, pastCompanies, intakeQueue,
//              networkContacts, trashedCompanies, getCompany, getCompanyByName,
//              companyOfContact, contactsOfCompany, primaryContactOf,
//              commentsOfCompany, activeEngagements, suggestsDormant,
//              companyColor, companyMatches, contactMatches
//   MUTATIONS  setLifecycle, setIntakeStage, graduateIntake, confirmIntakeService,
//              assignIntakeOwner, toggleIntakeChecklist, moveContactToCompany,
//              ensureCompany, setCompanyColor, setCompanyNotes, saveCompanies
//
// Loads after intake.js (needs svcById / CHECKLIST_ITEMS) and before boot.js.

var companies=[];

function newCoId(){ return 'co_'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4); }
function newEngId(){ return 'eng_'+Math.random().toString(36).slice(2,8); }
function autoColor(name){var h=0;name=name||'';for(var i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))%CO_COLORS.length;return CO_COLORS[h];}

// ── factories (internal — views build records through ensureCompany) ─────────
function makeCompany(o){
  return {
    id:o.id||newCoId(), name:o.name||'', isSolo:!!o.isSolo,
    handle:o.handle||'', website:o.website||'', color:o.color||'', notes:o.notes||'',
    lifecycle:o.lifecycle||'network', intake:o.intake||null,
    engagements:o.engagements||[], owner:o.owner||null,
    tags:o.tags||[], lastContact:o.lastContact||'', created:o.created||Date.now(),
    statusHistory:o.statusHistory||[],
    deletion_requested:!!o.deletion_requested, deletion_requested_by:o.deletion_requested_by||null
  };
}
function makeIntake(o){
  return {
    stage:o.stage||'new',            // new | confirmed | assigned | onboarding
    lane:o.lane||'booking',          // booking | application | enquiry
    source:o.source||'pipeline',     // pipeline | website-form
    requested:o.requested||null, service:o.service||null,
    message:o.message||'', receivedAt:o.receivedAt||Date.now(), startedAt:o.startedAt||null,
    formType:o.formType||null, answers:o.answers||null,
    checklist:o.checklist||{}, containers:o.containers||{},
    graduated:!!o.graduated, graduatedAt:o.graduatedAt||null
  };
}
function makeEngagement(o){
  return {
    id:o.id||newEngId(), serviceId:o.serviceId||null, name:o.name||'', lane:o.lane||null,
    status:o.status||'active',       // proposed | active | completed | paused
    price:o.price||'', manager:o.manager||null,
    startedAt:o.startedAt||null, completedAt:o.completedAt||null
  };
}

// ── load / persist ──────────────────────────────────────────────────────────
function saveCompanies(){ ls.set(UCK,companies); }
function saveContacts(){ ls.set(CK,contacts); }

function loadUnifiedModel(){
  var storedCo=ls.get(UCK);
  if(storedCo&&storedCo.length){ companies=storedCo; return false; }
  // fresh install — seed both sides of the unified model
  companies=SEED_COMPANIES.map(makeCompany);
  contacts=SEED_CONTACTS.slice();
  saveCompanies(); saveContacts();
  return true;
}

// ═══ QUERIES ═════════════════════════════════════════════════════════════════
function getCompany(id){ return companies.find(function(co){return co.id===id;})||null; }
function getCompanyByName(n){ return companies.find(function(co){return co.name===n;})||null; }
function companyOfContact(c){ return c&&c.companyId?getCompany(c.companyId):null; }
function contactsOfCompany(id){ return contacts.filter(function(c){return c.companyId===id;}); }
function primaryContactOf(id){
  var m=contactsOfCompany(id);
  return m.find(function(c){return c.role==='primary';})||m[0]||null;
}
function liveCompanies(){ return companies.filter(function(co){return!co.deletion_requested;}); }
function trashedCompanies(){ return companies.filter(function(co){return!!co.deletion_requested;}); }
function companiesByLifecycle(s){ return liveCompanies().filter(function(co){return co.lifecycle===s;}); }
// Past carries both terminal states: nothing is lifecycle 'former' in the demo
// data (DJI is dormant), and Dormant is the re-engagement pool.
function pastCompanies(){ return liveCompanies().filter(function(co){return co.lifecycle==='former'||co.lifecycle==='dormant';}); }
function networkContacts(){ return liveContacts().filter(function(c){return c.role==='network';}); }
// A company still in intake: Lead/Prospect with a non-graduated intake object.
function intakeQueue(){
  return liveCompanies().filter(function(co){
    return co.intake&&!co.intake.graduated&&['lead','prospect'].indexOf(co.lifecycle)>-1;
  });
}
// Comments stay on the person; a company aggregates its people's comments.
function commentsOfCompany(id){
  var out=[];
  contactsOfCompany(id).forEach(function(c){
    (c.comments||[]).forEach(function(cm){ out.push({contactId:c.id,contactName:c.first+' '+c.last,comment:cm}); });
  });
  return out.sort(function(a,b){return(a.comment.ts||0)-(b.comment.ts||0);});
}
function activeEngagements(co){ return(co.engagements||[]).filter(function(e){return e.status==='active';}); }
// Dormant is stored, not derived — but suggest it when the shape fits.
function suggestsDormant(co){
  return co.lifecycle==='active'&&(co.engagements||[]).length>0&&
         activeEngagements(co).length===0&&
         co.engagements.some(function(e){return e.status==='completed';});
}
function companyColor(co){ return co&&co.color?co.color:autoColor(co?co.name:''); }

// ── search ──────────────────────────────────────────────────────────────────
function companyMatches(co,q){
  if(!q)return true;
  var people=contactsOfCompany(co.id).map(function(c){return c.first+' '+c.last+' '+(c.title||'')+' '+(c.email||'');}).join(' ');
  var eng=(co.engagements||[]).map(function(e){return e.name;}).join(' ');
  return [co.name,co.handle,co.website,co.notes,LIFECYCLE_LBL[co.lifecycle],eng,people]
    .concat(co.tags||[]).join(' ').toLowerCase().indexOf(q)>-1;
}
function contactMatches(c,q){
  if(!q)return true;
  var co=companyOfContact(c);
  return [c.first,c.last,c.title,c.email,c.website,c.notes,co?co.name:'']
    .concat(c.tags||[]).join(' ').toLowerCase().indexOf(q)>-1;
}

// ═══ MUTATIONS ═══════════════════════════════════════════════════════════════
function setLifecycle(co,next,reason){
  if(!co||co.lifecycle===next)return false;
  co.statusHistory.push({from:co.lifecycle,to:next,ts:Date.now(),
                         by:(typeof currentUser!=='undefined'?currentUser:null),reason:reason||''});
  co.lifecycle=next;
  saveCompanies();
  return true;
}
function setIntakeStage(co,stage){
  if(!co||!co.intake)return false;
  co.intake.stage=stage;
  co.intake.graduated=false;
  co.intake.graduatedAt=null;
  setLifecycle(co,stage==='new'?'lead':'prospect','intake stage set to '+stage);
  saveCompanies();
  return true;
}
// Onboarding complete -> lifecycle Active, intake MARKED graduated. Never
// deleted: the intake record is the company's origin story and stays queryable.
function graduateIntake(co){
  if(!co||!co.intake)return false;
  co.intake.graduated=true;
  co.intake.graduatedAt=Date.now();
  (co.engagements||[]).forEach(function(e){ if(e.status==='proposed')e.status='active'; });
  if(!co.intake.startedAt)co.intake.startedAt=Date.now();
  setLifecycle(co,'active','onboarding complete');
  saveCompanies();
  return true;
}
function confirmIntakeService(co,svcId){
  if(!co||!co.intake)return false;
  var svc=svcById(svcId);
  co.intake.service=svcId;
  if(svc){
    var e=co.engagements[0];
    if(e){ e.serviceId=svc.id; e.name=svc.name; e.price=svc.price; e.lane=co.intake.lane; }
    else co.engagements.push(makeEngagement({serviceId:svc.id,name:svc.name,price:svc.price,lane:co.intake.lane,status:'proposed'}));
  }
  var bumped=false;
  if(co.intake.stage==='new'){ co.intake.stage='confirmed'; bumped=setLifecycle(co,'prospect','service confirmed'); }
  saveCompanies();
  return bumped;
}
function assignIntakeOwner(co,userKey){
  if(!co)return false;
  co.owner=userKey||null;
  if(co.engagements[0])co.engagements[0].manager=co.owner;
  var bumped=false;
  if(co.intake&&['new','confirmed'].indexOf(co.intake.stage)>-1){
    co.intake.stage='assigned';
    bumped=setLifecycle(co,'prospect','manager assigned');
  }
  saveCompanies();
  return bumped;
}
// Returns {allDone, graduated} so the view can report what happened.
function toggleIntakeChecklist(co,key){
  if(!co||!co.intake)return{allDone:false,graduated:false};
  if(!co.intake.checklist)co.intake.checklist={};
  co.intake.checklist[key]=!co.intake.checklist[key];
  var items=CHECKLIST_ITEMS[co.intake.lane]||CHECKLIST_ITEMS.booking;
  var allDone=items.every(function(it){return!!co.intake.checklist[it.key];});
  var graduated=false;
  if(allDone&&!co.intake.graduated){ graduateIntake(co); graduated=true; }
  saveCompanies();
  return{allDone:allDone,graduated:graduated};
}
// Find or create a company by name — used by the add/edit contact form.
function ensureCompany(name,lifecycle){
  if(!name)return null;
  var co=getCompanyByName(name);
  if(co)return co;
  co=makeCompany({name:name,lifecycle:lifecycle||'network'});
  companies.push(co);
  saveCompanies();
  return co;
}
function setCompanyColor(co,hex){ if(!co)return; co.color=hex; saveCompanies(); }
function setCompanyNotes(co,notes){ if(!co)return; co.notes=notes; saveCompanies(); }
function moveContactToCompany(contactId,companyId){
  var c=contacts.find(function(x){return x.id===contactId;});
  if(!c||c.companyId===companyId)return false;
  c.companyId=companyId;
  saveContacts();
  return true;
}

// ═══ RUN ═════════════════════════════════════════════════════════════════════
loadUnifiedModel();
