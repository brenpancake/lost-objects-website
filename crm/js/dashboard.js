
// ═══ FILTER ══════════════════════════════════════════════════════════════════
function buildFDD(){
  var live=liveContacts(),sub;
  if(currentTab==='companies')sub=liveCompanies();
  else if(currentTab==='active')sub=companiesByLifecycle('active');
  else if(currentTab==='prospects')sub=companiesByLifecycle('prospect');
  else if(currentTab==='former')sub=pastCompanies();
  else if(currentTab==='contacts')sub=networkContacts();
  else if(currentTab==='favorites')sub=live.filter(function(c){return isFav(c.id);});
  else sub=live;
  var used=new Set(sub.reduce(function(a,r){return a.concat(r.tags||[]);},[]));
  var h='';TAG_GROUPS.forEach(function(g){var gt=g.tags.filter(function(t){return used.has(t.key);});if(!gt.length)return;h+='<div class="fg"><div class="fgl">'+g.label+'</div><div class="fgc">'+gt.map(function(t){return '<button class="fchip'+(activeFilters.has(t.key)?' on':'')+'" onclick="toggleFilter(\''+t.key+'\')">'+t.label+'</button>';}).join('')+'</div></div>';});
  if(!h)h='<div style="font-size:12px;color:var(--muted)">No tags here.</div>';
  document.getElementById('fdd-body').innerHTML=h;
}
function toggleFilter(k){if(activeFilters.has(k))activeFilters.delete(k);else activeFilters.add(k);buildFDD();renderMain();updateFBtn();}
function clearFilters(){activeFilters.clear();buildFDD();renderMain();updateFBtn();}
function updateFBtn(){var c=activeFilters.size;document.getElementById('ftog-btn').classList.toggle('active',c>0);var b=document.getElementById('fbadge');b.style.display=c>0?'':'none';b.textContent=c;}
function toggleFDD(){fddOpen=!fddOpen;document.getElementById('fdd').classList.toggle('open',fddOpen);if(fddOpen)buildFDD();}
function closeFDD(){fddOpen=false;document.getElementById('fdd').classList.remove('open');}

// ═══ FEED & DASHBOARD ════════════════════════════════════════════════════════
var FEED_KEY='lo-feed-v1',CH_KEY='lo-channel-v1';
function getFeedItems(){return ls.get(FEED_KEY)||[];}
function saveFeedItems(items){ls.set(FEED_KEY,items);}
function addFeedItem(item){var items=getFeedItems();item.id=item.id||uid();item.ts=item.ts||Date.now();items.unshift(item);if(items.length>100)items=items.slice(0,100);saveFeedItems(items);}
function getOverdueCompanies(){
  var now=Date.now(),cutoff=72*3600000,overdue=[];
  liveCompanies().forEach(function(co){
    if(co.lifecycle!=='active'&&co.lifecycle!=='prospect')return;
    if(!co.lastContact)return;
    var last=new Date(co.lastContact).getTime();if(isNaN(last))return;
    var diff=now-last;if(diff<=cutoff)return;
    var recent=commentsOfCompany(co.id).some(function(x){return x.comment.ts&&(now-x.comment.ts)<cutoff;});
    if(!recent)overdue.push({company:co,daysSince:Math.floor(diff/86400000)});
  });
  return overdue.sort(function(a,b){return b.daysSince-a.daysSince;});
}
function buildFeedItems(){
  var items=getFeedItems();
  var ov=getOverdueCompanies().map(function(o){return{type:'overdue',companyId:o.company.id,text:'Follow up needed \u2014 <strong>'+esc(o.company.name)+'</strong>',detail:'Last contact '+o.daysSince+' days ago',ts:Date.now(),_generated:true};});
  return ov.concat(items.sort(function(a,b){return(b.ts||0)-(a.ts||0);}));
}
function feedIcon(type){return{intake:'\uD83D\uDCE8',overdue:'\u23F0',comment:'\uD83D\uDCAC',deletion:'\uD83D\uDDD1'}[type]||'\u26A1';}
function feedIntake(co){var p=primaryContactOf(co.id);addFeedItem({type:'intake',companyId:co.id,text:'New inquiry from <strong>'+esc(co.name)+'</strong>',detail:(p?esc((p.first+' '+p.last).trim())+' \u00B7 ':'')+((co.engagements[0]&&co.engagements[0].name)||(co.intake&&co.intake.formType)||'General inquiry')});}
function feedComment(contactId,author,contactName,commentText){var p=commentText.length>60?commentText.slice(0,60)+'\u2026':commentText;addFeedItem({type:'comment',contactId:contactId,text:'<strong>'+esc(author)+'</strong> commented on '+esc(contactName),detail:'\u201C'+esc(p)+'\u201D'});}
function feedDeletion(editorName,contactId,contactName){addFeedItem({type:'deletion',contactId:contactId,text:'<strong>'+esc(editorName)+'</strong> requested deletion of '+esc(contactName)});}
function feedActivity(text,contactId){addFeedItem({type:'activity',contactId:contactId||'',text:text});}

// ── DASHBOARD RENDERER ──────────────────────────────────────────────────────
function renderFeed(){renderDashboard();}

function renderDashboard(){
  var live=liveContacts(),overdue=getOverdueCompanies();
  var intakes=intakeQueue().slice().sort(function(a,b){return(b.intake.receivedAt||0)-(a.intake.receivedAt||0);});
  var stale=liveCompanies().filter(function(co){return co.lastContact;}).sort(function(a,b){return new Date(a.lastContact)-new Date(b.lastContact);}).slice(0,15);
  var feedItems=buildFeedItems().slice(0,20);
  var h='<div class="dash">';
  h+=renderWelcomeBar(overdue,intakes);
  h+='<div class="dash-panel" style="grid-row:span 2"><div class="dash-panel-hdr"><span class="dp-title" style="color:#e07840">&#x26A0; Needs Attention</span><span class="dp-count urgent">'+(overdue.length+intakes.length)+'</span></div><div class="dash-panel-body dash-scroll">';
  h+=renderOverduePanel(overdue);
  h+=renderIntakePanel(intakes);
  h+=renderStalePanel(stale);
  h+='</div></div>';
  h+='<div class="dash-panel" style="grid-row:span 2"><div class="dash-panel-hdr"><span class="dp-title">&#x26A1; Activity</span><span class="dp-count">'+feedItems.length+'</span></div><div class="dash-panel-body dash-scroll">';
  h+=renderDashFeed(feedItems);
  h+='</div></div>';
  h+='<div class="dash-panel" style="grid-row:span 2"><div class="dash-panel-hdr" style="padding:0"><div class="tc-tabs"><button class="tc-tab active" onclick="switchCommsTab(\'channel\',this)">&#x1F4E2; Channel</button><button class="tc-tab" onclick="switchCommsTab(\'dms\',this)">&#x2709; DMs'+(getUnreadDMCount()>0?'<span class="tc-badge">'+getUnreadDMCount()+'</span>':'')+'</button></div></div><div class="dash-panel-body" style="display:flex;flex-direction:column" id="comms-body">';
  h+=renderTeamChannel();
  h+='</div></div>';
  h+=renderQuickStats(live,overdue);
  h+='</div>';
  document.getElementById('main-content').innerHTML=h;
  var chScroll=document.getElementById('ch-msgs');if(chScroll)chScroll.scrollTop=chScroll.scrollHeight;
}

function renderWelcomeBar(overdue,intakes){
  var def=getUserDef(currentUser),name=def?def.displayName.split(' ')[0]:'there';
  var hr=new Date().getHours(),greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  var unreadDM=getUnreadDMCount();
  var dateStr=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  return '<div class="dash-welcome"><div class="dw-left"><div class="dw-greeting">'+greet+', <em>'+esc(name)+'</em></div><div class="dw-summary">'
    +(overdue.length?'<span class="dw-chip"><span class="dot" style="background:#e07840"></span>'+overdue.length+' overdue</span>':'')
    +(intakes.length?'<span class="dw-chip"><span class="dot" style="background:var(--pink)"></span>'+intakes.length+' new intake</span>':'')
    +(unreadDM?'<span class="dw-chip"><span class="dot" style="background:var(--blue)"></span>'+unreadDM+' unread DM'+(unreadDM>1?'s':'')+'</span>':'')
    +(!overdue.length&&!intakes.length&&!unreadDM?'<span style="color:var(--green)">&#x2713; All caught up</span>':'')
    +'</div></div><div class="dw-date">'+dateStr+'</div></div>';
}

function renderOverduePanel(overdue){
  var h='<div class="dp-sub"><span class="dp-sub-title red"><span class="overdue-dot"></span>Overdue Follow-ups</span><div class="dp-sub-line"></div></div>';
  if(!overdue.length)return h+'<div style="padding:8px 14px;font-size:11px;color:var(--muted)">No overdue clients</div>';
  overdue.forEach(function(o){var co=o.company;
    h+='<div class="dash-row" onclick="openCompanyDet(\''+co.id+'\')">'
      +'<div class="dr-av" style="background:'+companyColor(co)+'">'+esc(co.name.slice(0,2).toUpperCase())+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(co.name)+'</div><div class="dr-meta">'+LIFECYCLE_LBL[co.lifecycle]+'</div></div>'
      +'<span class="dr-badge overdue">'+o.daysSince+'d</span>'
      +'<button class="dr-action" onclick="event.stopPropagation();markContacted(\''+co.id+'\')">&#x2713; Contacted</button>'
      +'</div>';
  });
  return h;
}

function renderIntakePanel(intakes){
  var h='<div class="dp-sub"><span class="dp-sub-title pink">&#x1F4E8; New Intake</span><div class="dp-sub-line"></div></div>';
  if(!intakes.length)return h+'<div style="padding:8px 14px;font-size:11px;color:var(--muted)">No new inquiries</div>';
  intakes.forEach(function(co){
    var svc=svcById(co.intake.requested);
    h+='<div class="dash-row" onclick="switchTab(\'intake\');selectLead(\''+co.id+'\')">'
      +'<div class="dr-av" style="background:var(--pink)">'+esc(co.name.slice(0,2).toUpperCase())+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(co.name)+'</div><div class="dr-meta">'+cap(co.intake.stage)+(svc?' \u00B7 '+esc(svc.name):'')+'</div></div>'
      +'<span class="dr-badge new">'+fmt(co.intake.receivedAt)+'</span>'
      +'</div>';
  });
  return h;
}

var dashStaleExpanded=false;
function renderStalePanel(stale){
  var h='<div class="dp-sub"><span class="dp-sub-title muted">&#x1F4C5; Oldest Contact</span><div class="dp-sub-line"></div></div>';
  if(!stale.length)return h+'<div style="padding:8px 14px;font-size:11px;color:var(--muted)">All clients are fresh</div>';
  var show=dashStaleExpanded?stale:stale.slice(0,8);
  var now=Date.now();
  show.forEach(function(co){
    var days=Math.floor((now-new Date(co.lastContact).getTime())/86400000);
    h+='<div class="dash-row" onclick="openCompanyDet(\''+co.id+'\')">'
      +'<div class="dr-av" style="background:'+companyColor(co)+'">'+esc(co.name.slice(0,2).toUpperCase())+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(co.name)+'</div><div class="dr-meta">'+LIFECYCLE_LBL[co.lifecycle]+'</div></div>'
      +'<span class="dr-badge stale">'+days+'d ago</span>'
      +'</div>';
  });
  if(stale.length>8&&!dashStaleExpanded)h+='<button class="dash-show-more" onclick="dashStaleExpanded=true;renderDashboard()">Show '+(stale.length-8)+' more \u2193</button>';
  return h;
}

function renderDashFeed(items){
  if(!items.length)return '<div class="feed-empty">No activity yet</div>';
  var h='';
  items.forEach(function(item){
    var cid=item.contactId||'';
    var click=item.companyId?' onclick="openCompanyDet(\''+item.companyId+'\')"':(cid?' onclick="openDashEdit(\''+cid+'\')"':'');
    h+='<div class="feed-card type-'+(item.type||'activity')+'"'+click+'><div class="feed-top"><div class="feed-icon">'+feedIcon(item.type)+'</div><div class="feed-body"><div class="feed-hl">'+(item.type==='overdue'?'<span class="overdue-dot"></span>':'')+item.text+'</div>'+(item.detail?'<div class="feed-detail">'+item.detail+'</div>':'')+'</div><div class="feed-time">'+fmt(item.ts)+'</div></div></div>';
  });
  return h;
}

// ── TEAM CHANNEL ────────────────────────────────────────────────────────────
function getChannelMsgs(){return ls.get(CH_KEY)||[];}
function saveChannelMsgs(msgs){ls.set(CH_KEY,msgs);}
function renderTeamChannel(){
  var msgs=getChannelMsgs();
  var h='<div id="ch-msgs" class="ch-msgs" style="flex:1;overflow-y:auto;max-height:calc(100vh - 340px)">';
  if(!msgs.length)h+='<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">No messages yet</div>';
  msgs.forEach(function(m){
    var avCls=m.user==='kyra'?'kyra':'';
    h+='<div class="ch-msg"><div class="ch-av '+avCls+'">'+esc((m.displayName||'?')[0])+'</div><div class="ch-bubble"><div class="ch-author">'+esc(m.displayName)+'<span>'+fmt(m.ts)+'</span></div><div class="ch-text">'+esc(m.text)+'</div></div></div>';
  });
  h+='</div>';
  h+='<div class="ch-input-row"><textarea class="ch-input" id="ch-input" rows="1" placeholder="Message the team\u2026" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendChannelMsg();}"></textarea><button class="ch-send" onclick="sendChannelMsg()"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7.5 2l4 4-4 4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg></button></div>';
  return h;
}
function sendChannelMsg(){
  var inp=document.getElementById('ch-input');if(!inp)return;var text=inp.value.trim();if(!text)return;
  var def=getUserDef(currentUser);var msgs=getChannelMsgs();
  msgs.push({id:uid(),user:currentUser,displayName:def?def.displayName:currentUser,text:text,ts:Date.now()});
  saveChannelMsgs(msgs);inp.value='';
  feedActivity('<strong>'+esc(def?def.displayName:currentUser)+'</strong> posted in Team Channel');
  renderDashboard();
}
function switchCommsTab(tab,btn){
  document.querySelectorAll('.tc-tab').forEach(function(t){t.classList.remove('active');});
  btn.classList.add('active');
  var body=document.getElementById('comms-body');
  if(tab==='channel'){body.innerHTML=renderTeamChannel();var s=document.getElementById('ch-msgs');if(s)s.scrollTop=s.scrollHeight;}
  else body.innerHTML=renderDashDMs();
}

// ── DASH DMs ────────────────────────────────────────────────────────────────
var dashDMWith=null;
function renderDashDMs(){
  dashDMWith=null;
  var users=getAllUsers(),online=getOnline(),others=Object.keys(users).filter(function(k){return k!==currentUser;});
  var h='<div id="ddm-list">';
  others.forEach(function(key){
    var u=users[key],thread=getDMThread(key),last=thread[thread.length-1],unread=thread.filter(function(m){return m.from!==currentUser&&!m.read;}).length;
    var av=u.emoji?u.emoji:u.displayName[0].toUpperCase();var avCls=u.emoji?'':(key==='kyra'?'kyra':'');
    h+='<div class="ddm-thread" onclick="openDashDM(\''+key+'\')">'
      +'<div class="ddm-av '+avCls+'" style="'+(u.emoji?'background:#222;font-size:14px;':'')+'">'+esc(av)+'</div>'
      +'<div class="ddm-info"><div class="ddm-name">'+esc(u.displayName)+'</div><div class="ddm-prev">'+(last?esc(last.text.slice(0,40)):'No messages yet')+'</div></div>'
      +(last?'<div class="ddm-time">'+fmt(last.ts)+'</div>':'')
      +(unread?'<span class="ddm-unread">'+unread+'</span>':'')
      +'</div>';
  });
  h+='</div>';
  return h;
}
function openDashDM(w){
  dashDMWith=w;markDMRead(w);var u=getUserDef(w);
  var body=document.getElementById('comms-body');
  var h='<div class="ddm-chat-hdr"><button class="ddm-back" onclick="switchBackToDMList()">\u2190</button><strong style="font-size:12px">'+esc(u?u.displayName:w)+'</strong></div>';
  h+='<div class="ddm-msgs" id="ddm-msgs">';
  var msgs=getDMThread(w);
  if(!msgs.length)h+='<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">Start the conversation \uD83D\uDC4B</div>';
  msgs.forEach(function(m){var mine=m.from===currentUser;h+='<div class="ddm-msg '+(mine?'mine':'theirs')+'"><div class="ddm-bub">'+esc(m.text)+'</div><div class="ddm-msg-meta">'+fmt(m.ts)+'</div></div>';});
  h+='</div>';
  h+='<div class="ch-input-row"><textarea class="ch-input" id="ddm-input" rows="1" placeholder="Message\u2026" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendDashDM();}"></textarea><button class="ch-send" onclick="sendDashDM()"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7.5 2l4 4-4 4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg></button></div>';
  body.innerHTML=h;
  var s=document.getElementById('ddm-msgs');if(s)s.scrollTop=s.scrollHeight;
}
function switchBackToDMList(){document.getElementById('comms-body').innerHTML=renderDashDMs();}
function sendDashDM(){
  var inp=document.getElementById('ddm-input');if(!inp||!dashDMWith)return;var text=inp.value.trim();if(!text)return;
  sendDMMsg(dashDMWith,text);openDashDM(dashDMWith);
}

// ── QUICK STATS ─────────────────────────────────────────────────────────────
function renderQuickStats(live,overdue){
  var act=companiesByLifecycle('active').length;
  var pros=companiesByLifecycle('prospect').length;
  var intake=intakeQueue().length;
  return '<div class="dash-stats">'
    +'<div class="ds-card"><div class="ds-val">'+act+'</div><div class="ds-lbl">Active Clients</div></div>'
    +'<div class="ds-card"><div class="ds-val">'+pros+'</div><div class="ds-lbl">Prospects</div></div>'
    +'<div class="ds-card"><div class="ds-val" style="color:#e07840">'+overdue.length+'</div><div class="ds-lbl">Overdue</div></div>'
    +'<div class="ds-card"><div class="ds-val">'+intake+'</div><div class="ds-lbl">In Intake</div></div>'
    +'<div class="ds-card"><div class="ds-val">'+liveCompanies().length+'</div><div class="ds-lbl">Companies</div></div>'
    +'</div>';
}

// ── MARK CONTACTED ──────────────────────────────────────────────────────────
function markContacted(id){
  var co=getCompany(id);if(!co)return;
  co.lastContact=new Date().toISOString().slice(0,10);
  saveCompanies();
  var def=getUserDef(currentUser);
  feedActivity('<strong>'+esc(def?def.displayName:currentUser)+'</strong> marked '+esc(co.name)+' as contacted');
  if(currentTab==='feed')renderDashboard();else{updateCounts();renderMain();renderStats();}
  toast('Marked as contacted.');
}
