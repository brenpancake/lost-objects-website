
// ═══ FILTER ══════════════════════════════════════════════════════════════════
function buildFDD(){
  var live=liveContacts();
  var sub=currentTab==='companies'?live:currentTab==='favorites'?live.filter(function(c){return isFav(c.id);}):currentTab==='all'?live:live.filter(function(c){return c.cat===currentTab;});
  var used=new Set(sub.reduce(function(a,c){return a.concat(c.tags||[]);},[]));
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
function getOverdueContacts(){
  var live=liveContacts(),now=Date.now(),cutoff=72*3600000,overdue=[];
  live.forEach(function(c){
    if(c.cat!=='active'&&c.cat!=='prospects')return;if(!c.lastContact)return;
    var last=new Date(c.lastContact).getTime();if(isNaN(last))return;var diff=now-last;if(diff<=cutoff)return;
    var recentCmt=false;(c.comments||[]).forEach(function(cm){if(cm.ts&&(now-cm.ts)<cutoff)recentCmt=true;});
    if(!recentCmt)overdue.push({contact:c,daysSince:Math.floor(diff/86400000)});
  });
  return overdue.sort(function(a,b){return b.daysSince-a.daysSince;});
}
function buildFeedItems(){
  var items=getFeedItems();
  var ov=getOverdueContacts().map(function(o){return{type:'overdue',contactId:o.contact.id,text:'Follow up needed \u2014 <strong>'+esc(o.contact.first)+' '+esc(o.contact.last)+'</strong>'+(o.contact.company?' at '+esc(o.contact.company):''),detail:'Last contact '+o.daysSince+' days ago',ts:Date.now(),_generated:true};});
  return ov.concat(items.sort(function(a,b){return(b.ts||0)-(a.ts||0);}));
}
function feedIcon(type){return{intake:'\uD83D\uDCE8',overdue:'\u23F0',comment:'\uD83D\uDCAC',deletion:'\uD83D\uDDD1'}[type]||'\u26A1';}
function feedIntake(c){addFeedItem({type:'intake',contactId:c.id,text:'New inquiry from <strong>'+esc(c.first)+' '+esc(c.last)+'</strong>',detail:(c.company?esc(c.company)+' \u00B7 ':'')+(c.service||'General inquiry')});}
function feedComment(contactId,author,contactName,commentText){var p=commentText.length>60?commentText.slice(0,60)+'\u2026':commentText;addFeedItem({type:'comment',contactId:contactId,text:'<strong>'+esc(author)+'</strong> commented on '+esc(contactName),detail:'\u201C'+esc(p)+'\u201D'});}
function feedDeletion(editorName,contactId,contactName){addFeedItem({type:'deletion',contactId:contactId,text:'<strong>'+esc(editorName)+'</strong> requested deletion of '+esc(contactName)});}
function feedActivity(text,contactId){addFeedItem({type:'activity',contactId:contactId||'',text:text});}

// ── DASHBOARD RENDERER ──────────────────────────────────────────────────────
function renderFeed(){renderDashboard();}

function renderDashboard(){
  var live=liveContacts(),overdue=getOverdueContacts(),intakes=live.filter(function(c){return(c.tags||[]).indexOf('website-inquiry')>-1;}).sort(function(a,b){return(b.created||0)-(a.created||0);});
  var stale=live.filter(function(c){return c.lastContact;}).sort(function(a,b){return new Date(a.lastContact)-new Date(b.lastContact);}).slice(0,15);
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
  if(!overdue.length)return h+'<div style="padding:8px 14px;font-size:11px;color:var(--muted)">No overdue contacts</div>';
  overdue.forEach(function(o){var c=o.contact;
    h+='<div class="dash-row" onclick="openDashEdit(\''+c.id+'\')">'
      +'<div class="dr-av" style="background:'+(AV_BG[c.cat]||'#444')+'">'+ini(c)+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(c.first)+' '+esc(c.last)+'</div><div class="dr-meta">'+esc(c.company||c.title||'')+'</div></div>'
      +'<span class="dr-badge overdue">'+o.daysSince+'d</span>'
      +'<button class="dr-action" onclick="event.stopPropagation();markContacted(\''+c.id+'\')">&#x2713; Contacted</button>'
      +'</div>';
  });
  return h;
}

function renderIntakePanel(intakes){
  var h='<div class="dp-sub"><span class="dp-sub-title pink">&#x1F4E8; New Intake</span><div class="dp-sub-line"></div></div>';
  if(!intakes.length)return h+'<div style="padding:8px 14px;font-size:11px;color:var(--muted)">No new inquiries</div>';
  intakes.forEach(function(c){
    h+='<div class="dash-row" onclick="openDashEdit(\''+c.id+'\')">'
      +'<div class="dr-av" style="background:var(--pink)">'+ini(c)+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(c.first)+' '+esc(c.last)+'</div><div class="dr-meta">'+esc(c.company||'')+(c.service?' \u00B7 '+esc(c.service):'')+'</div></div>'
      +'<span class="dr-badge new">'+fmt(c.created)+'</span>'
      +'</div>';
  });
  return h;
}

var dashStaleExpanded=false;
function renderStalePanel(stale){
  var h='<div class="dp-sub"><span class="dp-sub-title muted">&#x1F4C5; Oldest Contacts</span><div class="dp-sub-line"></div></div>';
  if(!stale.length)return h+'<div style="padding:8px 14px;font-size:11px;color:var(--muted)">All contacts are fresh</div>';
  var show=dashStaleExpanded?stale:stale.slice(0,8);
  var now=Date.now();
  show.forEach(function(c){
    var days=Math.floor((now-new Date(c.lastContact).getTime())/86400000);
    h+='<div class="dash-row" onclick="openDashEdit(\''+c.id+'\')">'
      +'<div class="dr-av" style="background:'+(AV_BG[c.cat]||'#444')+'">'+ini(c)+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(c.first)+' '+esc(c.last)+'</div><div class="dr-meta">'+esc(c.company||'')+'</div></div>'
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
    var click=cid?' onclick="openDashEdit(\''+cid+'\')"':'';
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
  var act=live.filter(function(c){return c.cat==='active';}).length;
  var pros=live.filter(function(c){return c.cat==='prospects';}).length;
  var intake=live.filter(function(c){return(c.tags||[]).indexOf('website-inquiry')>-1;}).length;
  return '<div class="dash-stats">'
    +'<div class="ds-card"><div class="ds-val">'+act+'</div><div class="ds-lbl">Active Clients</div></div>'
    +'<div class="ds-card"><div class="ds-val">'+pros+'</div><div class="ds-lbl">Prospects</div></div>'
    +'<div class="ds-card"><div class="ds-val" style="color:#e07840">'+overdue.length+'</div><div class="ds-lbl">Overdue</div></div>'
    +'<div class="ds-card"><div class="ds-val">'+intake+'</div><div class="ds-lbl">Website Inquiries</div></div>'
    +'<div class="ds-card"><div class="ds-val">'+live.length+'</div><div class="ds-lbl">Total Contacts</div></div>'
    +'</div>';
}

// ── MARK CONTACTED ──────────────────────────────────────────────────────────
function markContacted(id){
  var c=contacts.find(function(x){return x.id===id;});if(!c)return;
  c.lastContact=new Date().toISOString().slice(0,10);
  ls.set(CK,contacts);
  var def=getUserDef(currentUser);
  feedActivity('<strong>'+esc(def?def.displayName:currentUser)+'</strong> marked '+esc(c.first)+' '+esc(c.last)+' as contacted',c.id);
  if(currentTab==='feed')renderDashboard();else{updateCounts();renderMain();renderStats();}
  toast('Marked as contacted.');
}
