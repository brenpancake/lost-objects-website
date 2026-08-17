
// ═══ INTAKE → ASSIGNMENT COMMAND CENTER ══════════════════════════════════════
// DEMO ONLY: state lives in a plain in-memory variable — no backend, no network,
// no localStorage. Reloading the page resets the queue to the seed below.
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
var INTAKE_LANE_LBL={booking:'Booking request',application:'Application'};
var INTAKE_STAGES=['New','Confirmed','Assigned','Onboarding','Active'];
var INTAKE_MANAGERS=['Brendan','Kyra','Julia'];
function svcById(id){var all=INTAKE_SERVICES.booking.concat(INTAKE_SERVICES.application);for(var i=0;i<all.length;i++)if(all[i].id===id)return all[i];return null;}

// Seed ~6 fictional leads across both lanes, every stage, several bookings + 2 applications.
var _im=60000,_h=3600000,_d=86400000,_t0=Date.now();
var intakeLeads=[
  {id:'lead1',name:'Meridian Reef',handle:'@meridianreef',contact:'Dana Okafor',email:'dana@meridianreef.co',lane:'booking',requested:'premium-audit',service:null,manager:null,stage:'New',receivedAt:_t0-12*_im,
   message:'Coastal skincare brand, ~18k on Instagram. Growth stalled since January and we’re posting into the void. Want a proper read on what’s working before we commit to a bigger engagement.'},
  {id:'lead2',name:'Nocturne Pictures',handle:'@nocturnepics',contact:'Elias Vane',email:'elias@nocturnepictures.film',lane:'application',requested:'full-management',service:null,manager:null,stage:'New',receivedAt:_t0-38*_im,
   message:'Indie horror production house with two features in festival circuit. We need someone to own social end-to-end through our next release. Applying for full management — open to a scoping call.'},
  {id:'lead3',name:'Jonah Vance',handle:'@thekelpforest',contact:'Jonah Vance',email:'jonah@thekelpforest.com',lane:'booking',requested:'basic-strategy',service:'basic-strategy',manager:null,stage:'Confirmed',receivedAt:_t0-2*_h,
   message:'Ocean documentary creator, 42k on YouTube. Confirmed I want a strategy session to map out a Shorts cadence for the next doc drop. Flexible on timing this week.'},
  {id:'lead4',name:'Sable & Vane',handle:'@sableandvane',contact:'Priscilla Sable',email:'hello@sableandvane.com',lane:'booking',requested:'premium-strategy',service:'premium-strategy',manager:'Kyra',stage:'Assigned',receivedAt:_t0-1*_d-3*_h,
   message:'Luxury slow-fashion label launching a capsule in the fall. Booked the premium strategy session — want a full channel + campaign plan around the drop. Kyra, looking forward to it.'},
  {id:'lead5',name:'Priya Anand',handle:'@runwildmedia',contact:'Priya Anand',email:'priya@runwildmedia.co',lane:'booking',requested:'basic-audit',service:'basic-audit',manager:'Julia',stage:'Onboarding',receivedAt:_t0-3*_d,startedAt:_t0-3*_d,
   message:'Adventure / outdoor creator, 65k across TikTok + IG. Audit is booked and I’ve sent over my logins. Ready to get started whenever Julia is.',
   checklist:{assets:true,delivered:false},
   containers:{agreement:'Signed · Jul 5',assets:'Logins received · 4 items',invoices:'Paid in full · $500',activity:'Audit kickoff scheduled'}},
  {id:'lead6',name:'Halcyon Studios',handle:'@halcyongames',contact:'Rowan Ito',email:'rowan@halcyonstudios.gg',lane:'application',requested:'full-management',service:'full-management',manager:'Brendan',stage:'Active',receivedAt:_t0-6*_d,startedAt:_t0-6*_d,
   message:'Indie game studio, first title shipping this quarter. Approved for full management — Brendan’s team is running our whole launch calendar. Kickoff is done, we’re live.',
   checklist:{agreement:true,assets:true,kickoff:true},
   containers:{agreement:'Signed · Jun 24',assets:'12 files · brand kit + logins',invoices:'Deposit paid · $2,400 of $6,000',project:'8 tasks · 3 in progress',activity:'Kickoff call logged'}}
];
var selectedLeadId=intakeLeads[0].id;

function intakeAgo(ts){
  var s=Math.max(0,Math.floor((Date.now()-ts)/1000));
  if(s<60)return 'just now';
  var m=Math.floor(s/60);if(m<60)return m+'m ago';
  var h=Math.floor(m/60);if(h<24)return h+'h ago';
  var d=Math.floor(h/24);return d+'d ago';
}
function stageCls(stage){return 'st-'+stage.toLowerCase();}

// Client-record config. Onboarding checklist is lane-dependent: full management runs
// the whole checklist; a booking runs a lighter "collect assets, then deliver".
var CHECKLIST_ITEMS={
  application:[{key:'agreement',label:'Agreement sent & signed'},{key:'assets',label:'Brand assets & logins collected'},{key:'kickoff',label:'Kickoff prep complete'}],
  booking:[{key:'assets',label:'Brand assets & logins collected'},{key:'delivered',label:'Delivered'}]
};
// Five containers; Project work (Notion) is full-management only — a one-off booking needs no post board.
var CONTAINER_META=[
  {key:'agreement',label:'Agreement',tool:'DocuSign'},
  {key:'assets',label:'Assets',tool:'Google Drive'},
  {key:'invoices',label:'Invoices',tool:'QuickBooks'},
  {key:'project',label:'Project work',tool:'Notion',fullOnly:true},
  {key:'activity',label:'Activity',tool:'Slack'}
];

function renderIntake(){
  document.getElementById('main-content').innerHTML=
    '<div class="intake">'
    +'<div class="ix-panel">'
      +'<div class="ix-phdr"><span class="ix-ptitle">Inbound Queue</span><span class="ix-pcount">'+intakeLeads.length+'</span></div>'
      +'<div class="ix-queue" id="ix-queue">'+intakeLeads.map(intakeRowHTML).join('')+'</div>'
    +'</div>'
    +'<div class="ix-panel ix-detail" id="ix-detail">'+intakeDetailHTML()+'</div>'
    +'</div>';
}
function intakeRowHTML(l){
  var svc=svcById(l.requested);
  return '<div class="iq-row'+(l.id===selectedLeadId?' sel':'')+'" onclick="selectLead(\''+l.id+'\')">'
    +'<div class="iq-top"><span class="iq-name">'+esc(l.name)+'</span><span class="iq-ago">'+intakeAgo(l.receivedAt)+'</span></div>'
    +'<div class="iq-svc">'+esc(svc?svc.name:'—')+'</div>'
    +'<div class="iq-tags"><span class="lane-tag lane-'+l.lane+'">'+INTAKE_LANE_LBL[l.lane]+'</span><span class="stage-pill '+stageCls(l.stage)+'">'+l.stage+'</span></div>'
    +'</div>';
}
// STAGE-AWARE DETAIL — one view, not two layouts. The pinned top (identity + Set Stage) is
// identical for every stage; only the body below changes. Lane flex preserved throughout.
function intakeDetailHTML(){
  var l=_curLead();
  if(!l)return '<div class="ix-empty"><span class="ix-empty-mark">Inbound</span><div>Select a lead from the queue to review the intake and route it.</div></div>';
  return '<div class="ix-dbody">'+ixTopHTML(l)+'<div class="ix-scrollbody">'+ixBodyHTML(l)+'</div></div>';
}
// Pinned header — back affordance, identity, stage pill + owner, then Set Stage. Same for all stages.
function ixTopHTML(l){
  var curIdx=INTAKE_STAGES.indexOf(l.stage);
  var stageRow='<div class="ix-stages">'+INTAKE_STAGES.map(function(st,i){var cls=i===curIdx?'on':(i<curIdx?'done':'');return '<button class="ix-stage '+cls+'" onclick="setLeadStage(\''+st+'\')">'+st+'</button>';}).join('')+'</div>';
  return '<div class="ix-top">'
    +'<button class="cr-back" onclick="backToQueue()"><span class="cr-arrow">&#x2190;</span> Inbound Queue</button>'
    +'<div class="ix-dhead"><div><div class="ix-dname">'+esc(l.name)+'</div>'
      +'<div class="ix-dsub">'+esc(l.contact)+' &middot; '+esc(l.handle)+' &middot; <a href="mailto:'+esc(l.email)+'">'+esc(l.email)+'</a></div></div>'
      +'<span class="lane-tag lane-'+l.lane+'">'+INTAKE_LANE_LBL[l.lane]+'</span></div>'
    +'<div class="cr-badges"><span class="stage-pill '+stageCls(l.stage)+'">'+l.stage+'</span><span class="cr-owner">Owner: <strong>'+(l.manager||'Unassigned')+'</strong></span></div>'
    +'<div class="ix-albl" style="margin-bottom:6px">Set stage</div>'+stageRow
    +'</div>';
}
// Stage-aware body: two decisions (New/Confirmed/Assigned), setup (Onboarding), operating dashboard (Active).
function ixBodyHTML(l){
  if(l.stage==='Onboarding'||l.stage==='Active')return recordBodyHTML(l);
  return deciderBodyHTML(l);
}
function deciderBodyHTML(l){
  var reqSvc=svcById(l.requested),confSvc=l.service?svcById(l.service):null;
  // service menu, grouped by the two live-site lanes
  function optHTML(s){
    var on=l.service===s.id,isReq=l.requested===s.id;
    return '<button class="ix-opt'+(on?' on':'')+'" onclick="confirmService(\''+s.id+'\')">'
      +'<span>'+esc(s.name)+(isReq?'<span class="req-flag">Requested</span>':'')+'</span>'
      +'<span class="ix-opt-price">'+esc(s.price)+'</span>'
      +'</button>';
  }
  var svcMenu='<div class="ix-lane-lbl">Booking request</div><div class="ix-opts">'+INTAKE_SERVICES.booking.map(optHTML).join('')+'</div>'
    +'<div class="ix-lane-lbl">Application</div><div class="ix-opts">'+INTAKE_SERVICES.application.map(optHTML).join('')+'</div>';
  var mgrRow='<div class="ix-btnrow">'+INTAKE_MANAGERS.map(function(m){return '<button class="ix-btn'+(l.manager===m?' on':'')+'" onclick="assignManager(\''+m+'\')">'+m+'</button>';}).join('')+'</div>';

  // "Still deciding" body = intake context + the two decisions. Set Stage now lives in the pinned header.
  return '<div class="ix-meta">'
      +'<div class="ix-mcell"><div class="ix-mlbl">Received</div><div class="ix-mval">'+intakeAgo(l.receivedAt)+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Lane</div><div class="ix-mval">'+INTAKE_LANE_LBL[l.lane]+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Service requested</div><div class="ix-mval">'+esc(reqSvc?reqSvc.name:'—')+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Starting point</div><div class="ix-mval"><span class="from">'+esc(reqSvc?reqSvc.price:'—')+'</span></div></div>'
    +'</div>'
    +'<div class="ix-msg">'+esc(l.message)+'</div>'
    +'<div class="ix-act"><div class="ix-albl">1 · Confirm service</div><div class="ix-ahint">'
      +(confSvc?('Confirmed as <strong style="color:var(--pink)">'+esc(confSvc.name)+'</strong> — pricing is a starting point, final quote after scoping.'):'Awaiting confirmation. Pricing is a starting point, not a closed number.')
      +'</div>'+svcMenu+'</div>'
    +'<div class="ix-act"><div class="ix-albl">2 · Assign manager</div><div class="ix-ahint">Route this lead to a team member.</div>'+mgrRow+'</div>'
    +'<div class="ix-note">Demo data — every lead is a request awaiting confirmation. Changes live in memory only and reset on reload.</div>';
}

// ── CLIENT RECORD BODY — lane-flexed; Onboarding = setup, Active = operating dashboard ──
function recordBodyHTML(l){
  var conf=l.service?svcById(l.service):svcById(l.requested);
  // Scoped price: never a closed number — "To be quoted" for full management, starting-point price for bookings.
  var priceTxt=l.lane==='application'?'To be quoted':(conf?conf.price:'—');
  var engHTML='<div class="ix-act"><div class="ix-albl">Engagement</div><div class="cr-eng">'
      +'<div class="ix-mcell"><div class="ix-mlbl">Confirmed service</div><div class="ix-mval">'+esc(conf?conf.name:'—')+'</div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Scoped price</div><div class="ix-mval"><span class="from">'+esc(priceTxt)+'</span></div></div>'
      +'<div class="ix-mcell"><div class="ix-mlbl">Started</div><div class="ix-mval">'+(l.startedAt?fmtDate(l.startedAt):'—')+'</div></div>'
    +'</div></div>';
  var items=CHECKLIST_ITEMS[l.lane],ck=l.checklist||{};
  var doneCount=items.filter(function(it){return !!ck[it.key];}).length;
  var allDone=doneCount===items.length;

  if(l.stage==='Active'){
    // Operating dashboard: onboarding collapses to one quiet line; workspace foregrounded, ops-priority order.
    var doneLine='<div class="cr-done-line">'+checkSvg('#50b880')+'<span>Onboarding '+(allDone?'complete — all steps done':'· '+doneCount+' of '+items.length+' steps done')+'</span></div>';
    var workspace='<div class="ix-act"><div class="ix-albl">Workspace</div><div class="ix-ahint">Live client workspace — stubbed; each opens its sub-view later.</div>'+containersHTML(l,true)+'</div>';
    return doneLine+workspace+engHTML+'<div class="ix-note">Demo data — in memory only, resets on reload.</div>';
  }
  // Onboarding (setup): engagement, the active checklist, then the containers.
  var onbHint=l.lane==='application'?'Agreement, assets, and kickoff. All three complete → client goes Active.':'Collect assets, then deliver. Both complete → client goes Active.';
  var checklistHTML=allDone
    ?'<div class="cr-chk-done"><span class="cr-done-mark">'+checkSvg('#0f0e0d')+'</span><div><div class="cr-done-txt">Onboarding complete</div><div class="cr-done-sub">All steps done — client is Active.</div></div></div>'
    :'<div class="cr-chk">'+items.map(function(it){var on=!!ck[it.key];return '<div class="cr-chk-item'+(on?' on':'')+'" onclick="toggleChecklist(\''+it.key+'\')"><span class="cr-check">'+checkSvg('#0f0e0d')+'</span><span class="cr-chk-lbl">'+esc(it.label)+'</span></div>';}).join('')+'</div>';
  return engHTML
    +'<div class="ix-act"><div class="ix-albl">Onboarding</div><div class="ix-ahint">'+onbHint+'</div>'+checklistHTML+'</div>'
    +'<div class="ix-act"><div class="ix-albl">Containers</div><div class="ix-ahint">Workspaces for this client — stubbed; each opens its sub-view later.</div>'+containersHTML(l,false)+'</div>'
    +'<div class="ix-note">Demo data — in memory only, resets on reload.</div>';
}
// Container tiles. Lane flex: bookings hide Project work (Notion). Active reorders to operational priority.
function containersHTML(l,active){
  var cons=CONTAINER_META.filter(function(cm){return !(cm.fullOnly&&l.lane!=='application');});
  if(active){var order=['project','activity','invoices','agreement','assets'];cons=cons.slice().sort(function(a,b){return order.indexOf(a.key)-order.indexOf(b.key);});}
  return '<div class="cr-cons">'+cons.map(function(cm){var st=(l.containers||{})[cm.key]||'Not started';
    return '<div class="cr-con" onclick="conStub(\''+esc2(cm.label)+'\',\''+esc2(cm.tool)+'\')"><div class="cr-con-top"><span class="cr-con-name">'+cm.label+'</span><span class="cr-con-tool">'+cm.tool+'</span></div><div class="cr-con-status">'+esc(st)+'</div></div>';
  }).join('')+'</div>';
}
function toggleChecklist(key){
  var l=_curLead();if(!l)return;
  if(!l.checklist)l.checklist={};
  l.checklist[key]=!l.checklist[key];
  var items=CHECKLIST_ITEMS[l.lane];
  var allDone=items.every(function(it){return !!l.checklist[it.key];});
  var flipped=false;
  if(allDone&&l.stage!=='Active'){l.stage='Active';flipped=true;}
  _refreshDetail();
  if(flipped)toast(l.name+' is now Active — onboarding complete.');
  else{var it=items.find(function(x){return x.key===key;});toast((l.checklist[key]?'Done':'Cleared')+' · '+(it?it.label:key));}
}
function conStub(label,tool){toast(label+' → '+tool+' · connects later');}
function backToQueue(){selectedLeadId=null;_refreshDetail();}
function _curLead(){return intakeLeads.find(function(x){return x.id===selectedLeadId;});}
function _refreshDetail(){var el=document.getElementById('ix-detail');if(el)el.innerHTML=intakeDetailHTML();var q=document.getElementById('ix-queue');if(q)q.innerHTML=intakeLeads.map(intakeRowHTML).join('');}
function _advance(l,to){var from=INTAKE_STAGES.indexOf(l.stage),ti=INTAKE_STAGES.indexOf(to);if(ti>from){l.stage=to;return true;}return false;}
function selectLead(id){selectedLeadId=id;_refreshDetail();}
function confirmService(id){
  var l=_curLead();if(!l)return;var s=svcById(id);l.service=id;
  var bumped=_advance(l,'Confirmed');
  _refreshDetail();
  toast('Service confirmed — '+(s?s.name:'')+(bumped?' · moved to Confirmed':''));
}
function assignManager(m){
  var l=_curLead();if(!l)return;l.manager=m;
  var bumped=_advance(l,'Assigned');
  _refreshDetail();
  toast('Assigned to '+m+(bumped?' · moved to Assigned':''));
}
function setLeadStage(st){
  var l=_curLead();if(!l)return;l.stage=st;
  _refreshDetail();
  toast('Stage set to '+st);
}
