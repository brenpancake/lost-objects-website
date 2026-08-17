
// ═══ PREFS ═══════════════════════════════════════════════════════════════════
function applyPrefs(){
  var p=ls.get(PK)||{},u=p[currentUser]||{};
  document.body.classList.toggle('light',u.theme==='light');
  document.body.className=document.body.className.replace(/font-\S+/g,'').trim();
  if(u.font&&u.font!=='default')document.body.classList.add('font-'+u.font);
}
function setTheme(t){var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};p[currentUser].theme=t;ls.set(PK,p);applyPrefs();updateProfileView();}
function setFont(f){var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};p[currentUser].font=f;ls.set(PK,p);applyPrefs();updateProfileView();}
function setEmoji(e){var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};p[currentUser].emoji=e;ls.set(PK,p);updateHeaderUser();updateProfileView();}
function saveUserField(field,val){var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};p[currentUser][field]=val;ls.set(PK,p);if(field==='displayName'){updateHeaderUser();document.getElementById('prof-display-name').textContent=val;}if(field==='bio')document.getElementById('prof-bio-txt').textContent=val;}
function changePw(){var np=document.getElementById('prof-pass-input').value.trim();if(!np||np.length<6){toast('Minimum 6 characters.');return;}var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};p[currentUser].pass=np;ls.set(PK,p);document.getElementById('prof-pass-input').value='';toast('Password updated!');}

// ═══ TEAM ════════════════════════════════════════════════════════════════════
function renderTeamList(){
  var users=getAllUsers();
  document.getElementById('team-list').innerHTML=Object.keys(users).map(function(key){
    var u=users[key];var av=u.emoji?u.emoji:u.displayName[0].toUpperCase();var ac=u.emoji?'':(key==='kyra'?'kyra':'ti');var bi=!!BASE_USERS[key];
    return '<div class="tm-member"><div class="tmav '+ac+'" style="'+(u.emoji?'background:#222;font-size:16px;':'')+'">'+av+'</div><div class="tm-info"><div class="tm-name">'+esc(u.displayName)+'</div><div class="tm-meta">@'+key+(u.email?' &middot; '+esc(u.email):'')+'</div></div><span class="rbadge r-'+(u.role||'viewer')+'">'+cap(u.role||'viewer')+'</span><div class="tm-acts"><button class="tm-act" onclick="openEU(\''+key+'\')">Edit</button>'+((!bi&&canDo('canManageTeam'))?'<button class="tm-act" style="color:#ff5050;border-color:rgba(255,80,80,.3)" onclick="removeUser(\''+key+'\')">&#x2715;</button>':'')+'</div></div>';
  }).join('');
}
function createTeamMember(){
  var first=document.getElementById('nu-first').value.trim(),username=document.getElementById('nu-user').value.trim().toLowerCase(),pass=document.getElementById('nu-pass').value.trim();
  if(!first||!username||!pass){toast('Name, username and password required.');return;}
  if(pass.length<6){toast('Password min 6 chars.');return;}
  if(getAllUsers()[username]){toast('Username taken.');return;}
  var c=ls.get(UK)||{};var last=document.getElementById('nu-last').value.trim();
  c[username]={displayName:first+(last?' '+last:''),pass:pass,role:document.getElementById('nu-role').value,email:document.getElementById('nu-email').value.trim(),emoji:null,bio:'',avatarClass:''};
  ls.set(UK,c);['nu-first','nu-last','nu-user','nu-pass','nu-email'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('auf-wrap').style.display='none';document.getElementById('add-user-btn').style.display='';renderTeamList();toast('@'+username+' created!');
}
var euKey=null;
function openEU(key){
  euKey=key;var u=getAllUsers()[key];var bi=!!BASE_USERS[key];
  document.getElementById('eu-body').innerHTML='<div class="fgsm"><label>Display Name</label><input type="text" id="eu-name" value="'+esc(u.displayName)+'"/></div><div class="fgsm"><label>Email</label><input type="email" id="eu-email" value="'+esc(u.email||'')+'"/></div>'+(!bi?'<div class="fgsm"><label>Role</label><select class="role-sel" id="eu-role"><option value="owner"'+(u.role==='owner'?' selected':'')+'>Owner</option><option value="editor"'+(u.role==='editor'?' selected':'')+'>Editor</option><option value="commentor"'+(u.role==='commentor'?' selected':'')+'>Commentor</option><option value="viewer"'+(u.role==='viewer'?' selected':'')+'>Viewer</option></select></div>':'')+'<div class="fgsm"><label>New Password</label><input type="password" id="eu-pass" placeholder="Leave blank to keep"/></div><div class="modal-acts"><button class="btn-s" onclick="closeEU()">Cancel</button><button class="btn-p" onclick="saveEU()">Save</button></div>';
  document.getElementById('eu-ov').classList.add('open');
}
function saveEU(){
  if(!euKey)return;var bi=!!BASE_USERS[euKey];var name=document.getElementById('eu-name').value.trim(),email=document.getElementById('eu-email').value.trim(),np=document.getElementById('eu-pass').value.trim();
  if(bi){var p=ls.get(PK)||{};if(!p[euKey])p[euKey]={};if(name)p[euKey].displayName=name;if(email)p[euKey].email=email;if(np&&np.length>=6)p[euKey].pass=np;ls.set(PK,p);}
  else{var c=ls.get(UK)||{};var role=(document.getElementById('eu-role')||{}).value||c[euKey].role;if(name)c[euKey].displayName=name;if(email)c[euKey].email=email;c[euKey].role=role;if(np&&np.length>=6)c[euKey].pass=np;ls.set(UK,c);}
  renderTeamList();closeEU();updateHeaderUser();toast('User updated!');
}
function closeEU(){document.getElementById('eu-ov').classList.remove('open');euKey=null;}
function removeUser(key){if(!confirm('Remove @'+key+'?'))return;var c=ls.get(UK)||{};delete c[key];ls.set(UK,c);renderTeamList();toast('User removed.');}

// ═══ EMAIL ═══════════════════════════════════════════════════════════════════
function loadEmailCfgUI(){var ec=ls.get(ECK)||{};if(ec.s)document.getElementById('ejs-svc').value=ec.s;if(ec.t)document.getElementById('ejs-tmpl').value=ec.t;if(ec.p)document.getElementById('ejs-pub').value=ec.p;updateEmailStatus();}
function saveEmailCfg(){ls.set(ECK,{s:document.getElementById('ejs-svc').value.trim(),t:document.getElementById('ejs-tmpl').value.trim(),p:document.getElementById('ejs-pub').value.trim()});updateEmailStatus();}
function updateEmailStatus(){var ec=ls.get(ECK)||{};var ok=ec.s&&ec.t&&ec.p;document.getElementById('email-dot').className='asd'+(ok?' on':'');document.getElementById('email-txt').textContent=ok?'Keys saved — ready to connect':'Not connected';}
function testEmailCfg(){var ec=ls.get(ECK)||{};if(!ec.s||!ec.t||!ec.p){toast('Fill all three fields first.');return;}document.getElementById('email-dot').className='asd';document.getElementById('email-txt').textContent='Demo mode — add EmailJS SDK to activate';toast('EmailJS shell ready.');}
function togES(key,el){el.classList.toggle('on');}
