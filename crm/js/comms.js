
// ═══ DMs ═════════════════════════════════════════════════════════════════════
var activeDMWith=null;
function getDMKey(a,b){return[a,b].sort().join('::');}
function getDMThread(w){return(ls.get(DK)||{})[getDMKey(currentUser,w)]||[];}
function sendDMMsg(to,text){
  if(!text.trim())return;
  var dms=ls.get(DK)||{};var key=getDMKey(currentUser,to);if(!dms[key])dms[key]=[];
  var def=getUserDef(currentUser);
  dms[key].push({id:uid(),from:currentUser,fromName:def?def.displayName:currentUser,text:text,ts:Date.now(),read:false});
  ls.set(DK,dms);addNotif(to,'<strong>'+(def?def.displayName:currentUser)+'</strong> sent you a message',null,'dm',currentUser);updateDMBadge();
}
function getUnreadDMCount(){var dms=ls.get(DK)||{};var c=0;Object.keys(dms).forEach(function(k){if(k.indexOf(currentUser)>-1)dms[k].forEach(function(m){if(m.from!==currentUser&&!m.read)c++;});});return c;}
function markDMRead(w){var dms=ls.get(DK)||{};var key=getDMKey(currentUser,w);if(dms[key])dms[key].forEach(function(m){if(m.from!==currentUser)m.read=true;});ls.set(DK,dms);updateDMBadge();}
function updateDMBadge(){var c=getUnreadDMCount();['dm-badge','dm-rn-badge'].forEach(function(id){var el=document.getElementById(id);if(!el)return;el.style.display=c>0?'':'none';el.textContent=c>9?'9+':c;});}

function renderDMView(){
  var users=getAllUsers();var online=getOnline();var others=Object.keys(users).filter(function(k){return k!==currentUser;});
  document.getElementById('dm-threads').innerHTML=others.map(function(key){
    var u=users[key];var thread=getDMThread(key);var last=thread[thread.length-1];var unread=thread.filter(function(m){return m.from!==currentUser&&!m.read;}).length;
    var av=u.emoji?u.emoji:u.displayName[0].toUpperCase();var ac=u.emoji?'':(key==='kyra'?'kyra':key==='guest'?'guest':'ti');var isOn=online.indexOf(key)>-1;
    return '<div class="dm-thread'+(activeDMWith===key?' active-t':'')+'" onclick="openDMChat(\''+key+'\')">'+'<div class="dmt-av '+ac+'" style="'+(u.emoji?'background:#222;font-size:16px;':'')+'">'+av+(isOn?'<span class="on-pip"></span>':'')+'</div>'+'<div class="dmt-info"><div class="dmt-name">'+esc(u.displayName)+'</div><div class="dmt-prev">'+(last?esc(last.text.slice(0,40)):'No messages yet')+'</div></div>'+(last?'<div class="dmt-time">'+fmt(last.ts)+'</div>':'')+(unread?'<span class="dm-unread">'+unread+'</span>':'')+'</div>';
  }).join('');
}
function openDMChat(w){
  activeDMWith=w;markDMRead(w);var u=getUserDef(w);var online=getOnline();
  var av=u&&u.emoji?u.emoji:u?u.displayName[0].toUpperCase():'?';
  var avEl=document.getElementById('dm-chat-av');avEl.textContent=av;
  avEl.style.background=u&&u.emoji?'#222':(w==='kyra'?'var(--yellow)':'var(--pink)');avEl.style.color=w==='kyra'?'#333':'#fff';
  document.getElementById('dm-chat-name').textContent=u?u.displayName:w;
  document.getElementById('dm-chat-status').textContent=online.indexOf(w)>-1?'● Online':'Last seen recently';
  renderDMMsgs();
  document.getElementById('dm-threads-wrap').style.display='none';
  document.getElementById('dm-chat').classList.add('open');
}
function closeDMChat(){
  activeDMWith=null;
  document.getElementById('dm-threads-wrap').style.display='';
  document.getElementById('dm-chat').classList.remove('open');
  renderDMView();
}
function renderDMMsgs(){
  var msgs=getDMThread(activeDMWith);var c=document.getElementById('dm-msgs');
  if(!msgs.length){c.innerHTML='<div style="text-align:center;color:var(--muted);font-size:12px;margin-top:20px">No messages yet. Say hi! 👋</div>';return;}
  c.innerHTML=msgs.map(function(m){var mine=m.from===currentUser;return '<div class="dm-msg '+(mine?'mine':'theirs')+'"><div class="dm-bubble">'+esc(m.text)+'</div><div class="dm-msg-meta">'+(mine?'You &middot; ':'')+fmt(m.ts)+'</div></div>';}).join('');
  c.scrollTop=c.scrollHeight;
}
function sendDM(){var inp=document.getElementById('dm-inp');var text=inp.value.trim();if(!text||!activeDMWith)return;sendDMMsg(activeDMWith,text);inp.value='';renderDMMsgs();renderDMView();updateDMBadge();}

// ═══ PRESENCE ════════════════════════════════════════════════════════════════
var presInterval=null;
function startPresence(){updatePres();presInterval=setInterval(function(){updatePres();renderPW();},15000);}
function clearPresence(){if(presInterval){clearInterval(presInterval);presInterval=null;}}
function updatePres(){var pr=ls.get(PRK)||{};pr[currentUser]={ts:Date.now()};ls.set(PRK,pr);}
function getOnline(){var pr=ls.get(PRK)||{};var cut=Date.now()-5*60*1000;return Object.keys(pr).filter(function(k){return pr[k].ts>cut&&k!==currentUser;});}
function renderPW(){
  var online=getOnline();var users=getAllUsers();var show=[currentUser].concat(online).slice(0,3);
  document.getElementById('pw-avs').innerHTML=show.map(function(k){var u=users[k];var av=u&&u.emoji?u.emoji:u?u.displayName[0]:'?';var bc=k===currentUser?'pk':k==='kyra'?'yl':'mu';return '<div class="pw-av '+bc+'" style="'+(u&&u.emoji?'background:#222;font-size:12px;':'')+'">'+av+'</div>';}).join('');
  var tot=online.length+1;document.getElementById('pw-count').textContent=tot===1?'Just you':tot+' online';
  document.getElementById('pw-list').innerHTML=[currentUser].concat(online).map(function(k){
    var u=users[k];if(!u)return'';var av=u.emoji?u.emoji:u.displayName[0];var bc=k==='kyra'?'yl':'';var me=k===currentUser;
    return '<div class="pw-user" onclick="'+(me?"openRail('profile')":'openDMWith(\''+k+'\')')+'"><div class="pres-av '+bc+' '+(u.emoji?'':'ti')+'" style="'+(u.emoji?'background:#222;font-size:14px;':'')+'">'+av+'<span class="pres-on"></span></div><div class="pres-info"><div class="pres-name">'+esc(u.displayName)+(me?' (you)':'')+'</div><div class="pres-status">'+(u.bio||u.role||'')+'</div></div>'+(!me?'<button class="pres-dm-btn" onclick="event.stopPropagation();openDMWith(\''+k+'\')">DM</button>':'')+'</div>';
  }).join('');
}
var pwOpen=false;
function togglePW(){pwOpen=!pwOpen;document.getElementById('pw-panel').classList.toggle('open',pwOpen);}
function openDMWith(u){pwOpen=false;document.getElementById('pw-panel').classList.remove('open');openRail('dm');setTimeout(function(){openDMChat(u);},200);}
