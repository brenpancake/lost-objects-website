
// ═══ NOTIFICATIONS ═══════════════════════════════════════════════════════════
function addNotif(to,text,cid,type,fromUser){if(to===currentUser)return;var n=ls.get(NK)||{};if(!n[to])n[to]=[];var item={id:uid(),text:text,contactId:cid,type:type||'mention',ts:Date.now(),read:false};if(fromUser)item.fromUser=fromUser;n[to].unshift(item);if(n[to].length>50)n[to]=n[to].slice(0,50);ls.set(NK,n);}
function getMyNotifs(){return(ls.get(NK)||{})[currentUser]||[];}
function unreadNotifCnt(){return getMyNotifs().filter(function(n){return!n.read;}).length;}
function markNotifsRead(){var n=ls.get(NK)||{};if(!n[currentUser])return;n[currentUser].forEach(function(i){i.read=true;});ls.set(NK,n);updateNotifBadge();}
function clearNotifs(){var n=ls.get(NK)||{};n[currentUser]=[];ls.set(NK,n);renderNotifPanel();updateNotifBadge();}
function updateNotifBadge(){var c=unreadNotifCnt();var b=document.getElementById('notif-badge');b.style.display=c>0?'':'none';b.textContent=c>9?'9+':c;}
function toggleNotifPanel(){var ov=document.getElementById('notif-ov');if(ov.classList.contains('open')){closeNotifPanel();}else{renderNotifPanel();ov.classList.add('open');markNotifsRead();updateNotifBadge();}}
function closeNotifPanel(){document.getElementById('notif-ov').classList.remove('open');}
function renderNotifPanel(){
  var notifs=getMyNotifs();var list=document.getElementById('notif-list');
  if(!notifs.length){list.innerHTML='<div class="notif-empty">You\'re all caught up \u2713</div>';return;}
  list.innerHTML=notifs.map(function(n,i){
    var c=n.contactId?contacts.find(function(x){return x.id===n.contactId;}):null;
    var nm=c?c.first+' '+c.last:'';
    var icon=n.type==='dm'?'\u2709':n.type==='deletion'?'\uD83D\uDDD1':'\uD83D\uDCAC';
    return '<div class="notif-item '+(n.read?'':'unread')+'" onclick="handleNotifClick('+i+')" style="cursor:pointer">'
      +'<div class="notif-dot '+(n.read?'read':'')+'"></div>'
      +'<div style="flex:1"><div class="notif-text">'+icon+' '+n.text+'</div>'
      +'<div class="notif-meta">'+fmt(n.ts)+(nm?' \u00B7 '+esc(nm):'')+'</div></div>'
      +'<div style="font-size:10px;color:var(--muted);flex-shrink:0">\u2192</div></div>';
  }).join('');
}
function handleNotifClick(idx){
  var notifs=getMyNotifs();var n=notifs[idx];if(!n)return;
  closeNotifPanel();
  // DM notification → open DM
  if(n.type==='dm'&&n.fromUser){
    openRail('dm');
    setTimeout(function(){openDMChat(n.fromUser);},150);
    return;
  }
  // Deletion notification → switch to trash tab
  if(n.type==='deletion'){
    if(canDo('canDelete'))switchTab('trash');
    return;
  }
  // Contact-related notification → open detail popout
  if(n.companyId&&getCompany(n.companyId)){openCompanyDet(n.companyId);return;}
  if(n.contactId){
    var c=contacts.find(function(x){return x.id===n.contactId;});
    if(c){openDashEdit(n.contactId);return;}
  }
  // Fallback: try to find the contact by name from the notification text
  var nameMatch=n.text.match(/on ([A-Z][a-z]+ [A-Z][a-z]+)/);
  if(nameMatch){
    var parts=nameMatch[1].split(' ');
    var found=contacts.find(function(c){return c.first===parts[0]&&c.last===parts[1];});
    if(found){openDashEdit(found.id);return;}
  }
}
function detectMentions(text){var found=[];Object.keys(getAllUsers()).forEach(function(name){if(new RegExp('@'+name,'gi').test(text))found.push(name);});return found.filter(function(v,i,a){return a.indexOf(v)===i;});}
function highlightMentions(text){return esc(text).replace(/@(\w+)/gi,function(m,name){var u=getAllUsers()[name.toLowerCase()];return u?'<span class="mention">'+m+'</span>':m;});}
