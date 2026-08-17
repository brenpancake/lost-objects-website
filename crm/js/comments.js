var mentHL=0;
function handleCmtInput(ta){
  var before=ta.value.slice(0,ta.selectionStart);var match=before.match(/@(\w*)$/);
  if(match){var q=match[1].toLowerCase();var opts=Object.keys(getAllUsers()).filter(function(k){return k!==currentUser&&(k.startsWith(q)||(getAllUsers()[k].displayName||'').toLowerCase().startsWith(q));}).map(function(k){var u=getAllUsers()[k];return{key:k,displayName:u.displayName,role:u.role,emoji:u.emoji};});if(opts.length){showMentPop(opts);return;}}
  hideMentPop();
}
function showMentPop(opts){mentHL=0;var p=document.getElementById('ment-pop');p.style.display='block';p.innerHTML=opts.map(function(o,i){var av=o.emoji?o.emoji:o.displayName[0].toUpperCase();return '<div class="ment-opt'+(i===0?' hl':'')+'" data-key="'+o.key+'" onclick="insertMention(\''+o.key+'\')"><div class="m-av '+(o.key==='kyra'?'kyra':'')+' '+(o.emoji?'':'ti')+'" style="'+(o.emoji?'background:#222;font-size:14px;':'')+'">'+av+'</div><div><div class="m-name">'+esc(o.displayName)+'</div><div class="m-role">'+(o.role||'')+'</div></div></div>';}).join('');}
function hideMentPop(){var p=document.getElementById('ment-pop');if(p)p.style.display='none';}
function insertMention(key){var ta=document.getElementById('cmt-inp');if(!ta)return;var val=ta.value,cur=ta.selectionStart;var nb=val.slice(0,cur).replace(/@(\w*)$/,'@'+key+' ');ta.value=nb+val.slice(cur);ta.focus();ta.setSelectionRange(nb.length,nb.length);hideMentPop();}
function handleCmtKD(e){
  var p=document.getElementById('ment-pop');
  if(p&&p.style.display!=='none'){
    var items=p.querySelectorAll('.ment-opt');
    if(e.key==='ArrowDown'){e.preventDefault();mentHL=Math.min(mentHL+1,items.length-1);}
    if(e.key==='ArrowUp'){e.preventDefault();mentHL=Math.max(mentHL-1,0);}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){items.forEach(function(el,i){el.classList.toggle('hl',i===mentHL);});return;}
    if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();var hi=p.querySelector('.hl');if(hi)insertMention(hi.dataset.key);return;}
    if(e.key==='Escape'){hideMentPop();return;}
  }
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitCmt();}
}
function submitCmt(){
  var inp=document.getElementById('cmt-inp');var text=inp.value.trim();if(!text)return;hideMentPop();
  var c=contacts.find(function(x){return x.id===detailId;});if(!c)return;if(!c.comments)c.comments=[];
  var def=getUserDef(currentUser);var auth=def?def.displayName:currentUser;
  c.comments.push({author:auth,text:text,ts:Date.now(),likes:[]});
  detectMentions(text).forEach(function(m){addNotif(m,'<strong>'+auth+'</strong> mentioned you on '+c.first+' '+c.last,c.id);});
  logAct({type:'comment',ts:Date.now(),text:'Commented on '+c.first+' '+c.last});
  feedComment(c.id,auth,c.first+' '+c.last,text);
  ls.set(CK,contacts);inp.value='';document.getElementById('cmts-list').innerHTML=renderCmts(c);renderMain();updateNotifBadge();
}
function toggleLike(cid,idx){
  var c=contacts.find(function(x){return x.id===cid;});if(!c||!c.comments[idx])return;var cm=c.comments[idx];if(!cm.likes)cm.likes=[];
  var i=cm.likes.indexOf(currentUser);if(i>-1)cm.likes.splice(i,1);else cm.likes.push(currentUser);
  logAct({type:'like',ts:Date.now(),text:'Liked a comment on '+c.first+' '+c.last});
  ls.set(CK,contacts);document.getElementById('cmts-list').innerHTML=renderCmts(c);
}
function closeDet(){document.getElementById('det-ov').classList.remove('open');detailId=null;detailCompanyId=null;}
function handleDetOvClick(e){if(e.target===document.getElementById('det-ov'))closeDet();}
