
// ═══ RAIL ════════════════════════════════════════════════════════════════════
var railOpen=false,currentRailView='profile';
function openRail(view){railOpen=true;document.getElementById('rail-ov').classList.add('open');document.getElementById('rail-btn').classList.add('rail-open');switchRailView(view||currentRailView);}
function closeRail(){railOpen=false;document.getElementById('rail-ov').classList.remove('open');document.getElementById('rail-btn').classList.remove('rail-open');pmStopLoop();pmOpen=false;}
function toggleRail(){if(railOpen)closeRail();else openRail('profile');}
function handleRailOv(e){if(e.target===document.getElementById('rail-ov'))closeRail();}
function switchRailView(view){
  currentRailView=view;
  document.querySelectorAll('.rview').forEach(function(el){el.classList.remove('active');});
  document.querySelectorAll('.rnb').forEach(function(el){el.classList.remove('active');});
  var ve=document.getElementById('view-'+view);if(ve)ve.classList.add('active');
  var nb=document.querySelector('.rnb[data-view="'+view+'"]');if(nb)nb.classList.add('active');
  if(view==='profile')updateProfileView();
  if(view==='dm')renderDMView();
  if(view==='favorites')renderFavsRail();
  if(view==='team')renderTeamList();
}
function updateProfileView(){
  var def=getUserDef(currentUser);if(!def)return;
  var p=ls.get(PK)||{},up=p[currentUser]||{};var theme=up.theme||'dark',font=up.font||'default';
  var av=document.getElementById('prof-av');
  if(def.emoji){av.textContent=def.emoji;av.className='pav';av.style.background='#222';}
  else{av.textContent=def.displayName[0].toUpperCase();av.className='pav ti '+(def.avatarClass||'');av.style.background='';}
  document.getElementById('prof-display-name').textContent=def.displayName;
  document.getElementById('prof-role-txt').textContent=cap(def.role||'viewer');
  document.getElementById('prof-bio-txt').textContent=def.bio||'';
  var grid=document.getElementById('emoji-grid');if(grid)grid.innerHTML=EMOJIS.map(function(e){return '<button class="emj-btn'+(def.emoji===e?' active':'')+'" onclick="setEmoji(\''+e+'\')">'+e+'</button>';}).join('');
  var ni=document.getElementById('prof-name-input');if(ni)ni.value=def.displayName;
  var bi=document.getElementById('prof-bio-input');if(bi)bi.value=def.bio||'';
  var ei=document.getElementById('prof-email-input');if(ei)ei.value=def.email||'';
  document.querySelectorAll('.th-btn').forEach(function(b){b.classList.remove('active');});var thEl=document.getElementById(theme==='light'?'th-light':'th-dark');if(thEl)thEl.classList.add('active');
  document.querySelectorAll('.fn-btn').forEach(function(b){b.classList.remove('active');});var fnEl=document.getElementById('fn-'+(font||'default'));if(fnEl)fnEl.classList.add('active');
  var acts=((p[currentUser]||{}).activity||[]).slice(0,6);
  var al=document.getElementById('act-list');if(al)al.innerHTML=acts.length?acts.map(function(a){return '<div class="act-item"><div class="act-dot '+(a.type==='add'?'pk':a.type==='like'?'yl':'')+'"></div><div><div style="font-size:12px">'+esc(a.text)+'</div><div style="font-size:10px;color:var(--muted)">'+fmt(a.ts)+'</div></div></div>';}).join(''):'<div style="font-size:12px;color:var(--muted)">No activity yet.</div>';
}
