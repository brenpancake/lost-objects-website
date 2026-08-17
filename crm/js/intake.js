
// ═══ INTAKE → ASSIGNMENT COMMAND CENTER ══════════════════════════════════════
// Reads the unified model: companies in Lead/Prospect lifecycle that still carry
// a non-graduated intake sub-object. Stage actions write to the company's intake
// via the data.js mutation helpers; completing onboarding graduates the record,
// flipping lifecycle to Active and dropping the card out of this queue.
// The service menu mirrors the live marketing site exactly, in two lanes.
var INTAKE_SERVICES={
  booking:[
    {id:'basic-audit',name:'Basic Social Media Audit',price:'from $500'},
    {id:'premium-audit',name:'Premium Social Media Audit',price:'from $850'},
    {id:'basic-strategy',name:'Basic Strategy Session',price:'from $500'},
    {id:'premium-strategy',name:'Premium Strategy Session',price:'from $2,000'}
  ],
  application:[
    {id:'full-management',name:'Full Management',price:'Selective · custom'}
  ]
};
var INTAKE_LANE_LBL={booking:'Booking request',application:'Application',enquiry:'General enquiry'};
// FOUR stages. 'Active' used to be a fifth here, duplicating the lifecycle
// status; it is now lifecycle=active + intake.graduated.
var INTAKE_STAGES=['New','Confirmed','Assigned','Onboarding'];
var INTAKE_MANAGERS=['Brendan','Kyra','Julia'];
function svcById(id){var all=INTAKE_SERVICES.booking.concat(INTAKE_SERVICES.application);for(var i=0;i<all.length;i++)if(all[i].id===id)return all[i];return null;}

var selectedLeadId=null;

function intakeAgo(ts){
  var s=Math.max(0,Math.floor((Date.now()-ts)/1000));
  if(s<60)return 'just now';
  var m=Math.floor(s/60);if(m<60)return m+'m ago';
  var h=Math.floor(m/60);if(h<24)return h+'h ago';
  var d=Math.floor(h/24);return d+'d ago';
}
function stageCls(stage){return 'st-'+String(stage).toLowerCase();}

// Onboarding checklist is lane-dependent: full management runs the whole
// checklist; a booking runs a lighter "collect assets, then deliver".
var CHECKLIST_ITEMS={
  application:[{key:'agreement',label:'Agreement sent & signed'},{key:'assets',label:'Brand assets & logins collected'},{key:'kickoff',label:'Kickoff prep complete'}],
  booking:[{key:'assets',label:'Brand assets & logins collected'},{key:'delivered',label:'Delivered'}],
  enquiry:[{key:'assets',label:'Brand assets & logins collected'},{key:'delivered',label:'Delivered'}]
};
// Five containers; Project work (Notion) is full-management only.
var CONTAINER_META=[
  {key:'agreement',label:'Agreement',tool:'DocuSign'},
  {key:'assets',label:'Assets',tool:'Google Drive'},
  {key:'invoices',label:'Invoices',tool:'QuickBooks'},
  {key:'project',label:'Project work',tool:'Notion',fullOnly:true},
  {key:'activity',label:'Activity',tool:'Slack'}
];

// ── queue + detail ──────────────────────────────────────────────────────────
function _curLead(){
  var co=selectedLeadId?getCompany(selectedLeadId):null;
  return (co&&co.intake&&!co.intake.graduated)?co:null;
}
function _refreshDetail(){
  var el=document.getElementById('ix-detail');if(el)el.innerHTML=intakeDetailHTML();
  var q=document.getElementById('ix-queue');if(q)q.innerHTML=intakeQueue().map(intakeRowHTML).join('');
  var c=document.getElementById('ix-count');if(c)c.textContent=intakeQueue().length;
  updateCounts();
}

function renderIntake(){
  var queue=intakeQueue();
  if(!selectedLeadId||!_curLead())selectedLeadId=queue.length?queue[0].id:null;
  document.getElementById('main-content').innerHTML=
    '<div class="intake">'
    +'<div class="ix-panel">'
      +'<div class="ix-phdr"><span class="ix-ptitle">Inbound Queue</span><span class="ix-pcount" id="ix-count">'+queue.length+'</span></div>'
      +'<div class="ix-queue" id="ix-queue">'+(queue.length?queue.map(intakeRowHTML).join(''):'<div class="co-empty">Queue is clear</div>')+'</div>'
    +'</div>'
    +'<div class="ix-panel ix-detail" id="ix-detail">'+intakeDetailHTML()+'</div>'
    +'</div>';
}
function intakeRowHTML(co){
  var svc=svcById(co.intake.requested);
  var stage=co.intake.stage;
  return '<div class="iq-row'+(co.id===selectedLeadId?' sel':'')+'" onclick="selectLead(\''+co.id+'\')">'
    +'<div class="iq-top"><span class="iq-name">'+esc(co.name)+'</span><span class="iq-ago">'+intakeAgo(co.intake.receivedAt)+'</span></div>'
    +'<div class="iq-svc">'+esc(svc?svc.name:(co.intake.formType||'—'))+'</div>'
    +'<div class="iq-tags"><span class="lane-tag lane-'+co.intake.lane+'">'+(INTAKE_LANE_LBL[co.intake.lane]||co.intake.lane)+'</span>'
      +'<span class="stage-pill '+stageCls(stage)+'">'+cap(stage)+'</span>'
      +(co.isSolo?'<span class="solo-flag">solo</span>':'')+'</div>'
    +'</div>';
}
function intakeDetailHTML(){
  var co=_curLead();
  if(!co)return '<div class="ix-empty"><span class="ix-empty-mark">Inbound</span><div>Select a lead from the queue to review the intake and route it.</div></div>';
  return '<div class="ix-dbody">'+ixTopHTML(co)+'<div class="ix-scrollbody">'+ixBodyHTML(co)+'</div></div>';
}
function ixTopHTML(co){
  var stage=co.intake.stage;
  var curIdx=INTAKE_STAGES.map(function(s){return s.toLowerCase();}).indexOf(stage);
  var stageRow='<div class="ix-stages">'+INTAKE_STAGES.map(function(st,i){
    var cls=i===curIdx?'on':(i<curIdx?'done':'');
    return '<button class="ix-stage '+cls+'" onclick="setLeadStage(\''+st.toLowerCase()+'\')">'+st+'</button>';
  }).join('')+'</div>';
  var primary=primaryContactOf(co.id);
  var owner=co.owner?((getUserDef(co.owner)||{}).displayName||MANAGER_NAMES[co.owner]||co.owner):'Unassigned';
  return '<div class="ix-top">'
    +'<button class="cr-back" onclick="backToQueue()"><span class="cr-arrow">&#x2190;</span> Inbound Queue</button>'
    +'<div class="ix-dhead"><div><div class="ix-dname">'+esc(co.name)+'</div>'
      +'<div class="ix-dsub">'+esc(primary?(primary.first+' '+primary.last).trim():'—')+(co.handle?' &middot; '+esc(co.handle):'')
      +(primary&&primary.email?' &middot; <a href="mailto:'+esc(primary.email)+'">'+esc(primary.email)+'</a>':'')+'</div></div>'
      +'<span class="lane-tag lane-'+co.intake.lane+'">'+(INTAKE_LANE_LBL[co.intake.lane]||co.intake.lane)+'</span></div>'
    +'<div class="cr-badges"><span class="stage-pill '+stageCls(co.intake.stage)+'">'+cap(co.intake.stage)+'</span>'
      +'<span class="lc-pill lc-'+co.lifecycle+'">'+LIFECYCLE_LBL[co.lifecycle]+'</span>'
      +'<span class="cr-owner">Owner: <strong>'+esc(owner)+'</strong></span></div>'
    +'<div class="ix-albl" style="margin-bottom:6px">Set stage</div>'+stageRow
    +'</div>';
}
function ixBodyHTML(co){
  if(co.intake.stage==='onboarding')return recordBodyHTML(co);
  return deciderBodyHTML(co);
}
function deciderBodyHTML(co){
  var ik=co.intake;
  var reqSvc=svcById(ik.requested),confSvc=ik.service?svcById(ik.service):null;
  function optHTML(s){
    var on=ik.service===s.id,isReq=ik.requested===s.id;
    return '<button class="ix-opt'+(on?' on':'')+'" onclick="confirmService(\''+s.id+'\')">'
      +'<span>'+esc(s.name)+(isReq?'<span class="req-flag">Requested</span>':'')+'</span>'
      +'<span class="ix-opt-price">'+esc(s.price)+'</span>'
      +'</button>';
  }
  var svcMenu='<div class="ix-lane-lbl">Booking request</div><div class="ix-opts">'+INTAKE_SERVICES.booking.map(optHTML).join('')+'</div>'
    +'<div class="ix-lane-lbl">Application</div><div class="ix-opts">'+INTAKE_SERVICES.application.map(optHTML).join('')+'</div>';
  var mgrRow='<div class="ix-btnrow">'+INTAKE_MANAGERS.map(function(m){
    var key=MANAGER_KEYS[m];
    return '<button class="ix-btn'+(co.owner===key?' on':'')+'" onclick="assignManager(\''+m+'\')">'+m+'</button>';
  }).join('')+'</div>';

  // website-form intakes carry the questionnaire answers
  var answers='';
  if(ik.answers){
    var a=ik.answers,rows=[];
    if(a.presence)rows.push(['Social presence',a.presence]);
    if(a.serviceInterest)rows.push(['Service interest',a.serviceInterest]);
    if(a.budget)rows.push(['Budget',a.budget]);
    if(a.challenges&&a.challenges.length)rows.push(['Challenges',a.challenges.join(', ')]);
    if(a.platforms&&a.platforms.length)rows.push(['Platforms',a.platforms.join(', ')]);
    if(a.websiteUrl)rows.push(['Website',a.websiteUrl]);
    if(rows.length)answers='<div class="ix-act"><div class="ix-albl">'+esc(ik.formType||'Form answers')+'</div><div class="ix-meta">'
      +rows.map(function(r){return '<div class="ix-mcell"><div class="ix-mlbl">'+esc(r[0])+'</div><div class="ix-mval">'+esc(r[1])+'</div></div>';}).join('')
      +'</div></div>';
  }

  return '<div class="ix-meta">'
      +'<div class="ix-mcell"><div class="ix-mlbl">Received</div><div class="ix-mval">'+intakeAgo(ik.receivedAt)+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Lane</div><div class="ix-mval">'+(INTAKE_LANE_LBL[ik.lane]||ik.lane)+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Service requested</div><div class="ix-mval">'+esc(reqSvc?reqSvc.name:'—')+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Starting point</div><div class="ix-mval"><span class="from">'+esc(reqSvc?reqSvc.price:'—')+'</span></div></div>'
    +'</div>'
    +(ik.message?'<div class="ix-msg">'+esc(ik.message)+'</div>':'')
    +answers
    +'<div class="ix-act"><div class="ix-albl">1 · Confirm service</div><div class="ix-ahint">'
      +(confSvc?('Confirmed as <strong style="color:var(--pink)">'+esc(confSvc.name)+'</strong> — pricing is a starting point, final quote after scoping.'):'Awaiting confirmation. Pricing is a starting point, not a closed number.')
      +'</div>'+svcMenu+'</div>'
    +'<div class="ix-act"><div class="ix-albl">2 · Assign manager</div><div class="ix-ahint">Route this lead to a team member.</div>'+mgrRow+'</div>'
    +'<div class="ix-note">Demo data — this record lives in the unified model and persists across reloads.</div>';
}

// ── onboarding (setup) body ─────────────────────────────────────────────────
function recordBodyHTML(co){
  var ik=co.intake;
  var conf=ik.service?svcById(ik.service):svcById(ik.requested);
  var priceTxt=ik.lane==='application'?'To be quoted':(conf?conf.price:'—');
  var engHTML='<div class="ix-act"><div class="ix-albl">Engagement</div><div class="cr-eng">'
      +'<div class="ix-mcell"><div class="ix-mlbl">Confirmed service</div><div class="ix-mval">'+esc(conf?conf.name:'—')+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Scoped price</div><div class="ix-mval"><span class="from">'+esc(priceTxt)+'</span></div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Started</div><div class="ix-mval">'+(ik.startedAt?fmtDate(ik.startedAt):'—')+'</div></div>'
    +'</div></div>';
  var items=CHECKLIST_ITEMS[ik.lane]||CHECKLIST_ITEMS.booking,ck=ik.checklist||{};
  var doneCount=items.filter(function(it){return !!ck[it.key];}).length;
  var allDone=doneCount===items.length;
  var onbHint=ik.lane==='application'?'Agreement, assets, and kickoff. All three complete → client goes Active.':'Collect assets, then deliver. Both complete → client goes Active.';
  var checklistHTML=allDone
    ?'<div class="cr-chk-done"><span class="cr-done-mark">'+checkSvg('#0f0e0d')+'</span><div><div class="cr-done-txt">Onboarding complete</div><div class="cr-done-sub">All steps done — client is Active.</div></div></div>'
    :'<div class="cr-chk">'+items.map(function(it){var on=!!ck[it.key];return '<div class="cr-chk-item'+(on?' on':'')+'" onclick="toggleChecklist(\''+it.key+'\')"><span class="cr-check">'+checkSvg('#0f0e0d')+'</span><span class="cr-chk-lbl">'+esc(it.label)+'</span></div>';}).join('')+'</div>';
  return engHTML
    +'<div class="ix-act"><div class="ix-albl">Onboarding</div><div class="ix-ahint">'+onbHint+'</div>'+checklistHTML+'</div>'
    +'<div class="ix-act"><div class="ix-albl">Containers</div><div class="ix-ahint">Workspaces for this client — stubbed; each opens its sub-view later.</div>'+containersHTML(co,false)+'</div>'
    +'<div class="ix-note">Demo data — persists in the unified model.</div>';
}
function containersHTML(co,active){
  var lane=co.intake?co.intake.lane:'booking';
  var cons=CONTAINER_META.filter(function(cm){return !(cm.fullOnly&&lane!=='application');});
  if(active){var order=['project','activity','invoices','agreement','assets'];cons=cons.slice().sort(function(a,b){return order.indexOf(a.key)-order.indexOf(b.key);});}
  var store=(co.intake&&co.intake.containers)||{};
  return '<div class="cr-cons">'+cons.map(function(cm){var st=store[cm.key]||'Not started';
    return '<div class="cr-con" onclick="conStub(\''+esc2(cm.label)+'\',\''+esc2(cm.tool)+'\')"><div class="cr-con-top"><span class="cr-con-name">'+cm.label+'</span><span class="cr-con-tool">'+cm.tool+'</span></div><div class="cr-con-status">'+esc(st)+'</div></div>';
  }).join('')+'</div>';
}

// ── actions ─────────────────────────────────────────────────────────────────
function selectLead(id){selectedLeadId=id;_refreshDetail();}
function backToQueue(){selectedLeadId=null;_refreshDetail();}
function conStub(label,tool){toast(label+' → '+tool+' · connects later');}

function confirmService(id){
  var co=_curLead();if(!co)return;
  var bumped=confirmIntakeService(co,id);
  var s=svcById(id);
  _refreshDetail();
  toast('Service confirmed — '+(s?s.name:'')+(bumped?' · moved to Confirmed':''));
}
function assignManager(m){
  var co=_curLead();if(!co)return;
  var bumped=assignIntakeOwner(co,MANAGER_KEYS[m]||null);
  _refreshDetail();
  toast('Assigned to '+m+(bumped?' · moved to Assigned':''));
}
function setLeadStage(stage){
  var co=_curLead();if(!co)return;
  setIntakeStage(co,stage);
  _refreshDetail();
  toast('Stage set to '+cap(stage));
}
function toggleChecklist(key){
  var co=_curLead();if(!co)return;
  var name=co.name;
  var r=toggleIntakeChecklist(co,key);
  if(r.graduated){
    // graduated out of the queue — lifecycle is Active, intake kept as history
    selectedLeadId=null;
    renderIntake();updateCounts();
    toast(name+' is now Active — onboarding complete, moved out of the queue.');
    return;
  }
  var items=CHECKLIST_ITEMS[co.intake.lane]||CHECKLIST_ITEMS.booking;
  var it=items.find(function(x){return x.key===key;});
  _refreshDetail();
  toast((co.intake.checklist[key]?'Done':'Cleared')+' · '+(it?it.label:key));
}
