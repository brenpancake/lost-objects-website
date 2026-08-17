
// ═══ AUTH ════════════════════════════════════════════════════════════════════
var currentUser=null;
function tryLogin(){
  var u=document.getElementById('login-user').value.trim().toLowerCase();
  var p=document.getElementById('login-pass').value;
  var def=getAllUsers()[u];
  if(def&&def.pass===p){
    sessionStorage.setItem('lo-auth',u);
    document.getElementById('login-err').textContent='';
    // Remember me — persist the USERNAME ONLY (never the password) for next-visit prefill
    var rm=document.getElementById('remember-me');
    if(rm&&rm.checked)ls.set('lo-remember',u);else localStorage.removeItem('lo-remember');
    // Credentials OK → hand off to the two-factor step (demo auto-passes; wired to backend later)
    showTwoFactor(u);
  }
  else{document.getElementById('login-err').textContent='Incorrect username or password.';document.getElementById('login-pass').value='';}
}
// ═══ TWO-FACTOR (visual placeholder — demo auto-passes; real verification arrives with the backend) ═══
var pendingUser=null;
function showTwoFactor(u){
  pendingUser=u;
  var card=document.querySelector('.login-box:not(#forgot-box)');if(card)card.style.display='none';
  document.getElementById('forgot-box').style.display='none';
  var box=document.getElementById('twofa-box');box.style.display='';
  box.querySelectorAll('.tf-digit').forEach(function(d){d.value='';});
  var f=box.querySelector('.tf-digit');if(f)f.focus();
}
function twoFactorPass(){
  document.getElementById('twofa-box').style.display='none';
  var u=pendingUser;pendingUser=null;
  if(u)bootApp(u);
}
function twoFactorBack(){
  document.getElementById('twofa-box').style.display='none';
  var card=document.querySelector('.login-box:not(#forgot-box)');if(card)card.style.display='';
  pendingUser=null;
}
function tfAdvance(el){
  el.value=el.value.replace(/\D/g,'').slice(0,1);
  if(el.value&&el.nextElementSibling&&el.nextElementSibling.classList.contains('tf-digit'))el.nextElementSibling.focus();
  var done=true;document.querySelectorAll('#twofa-box .tf-digit').forEach(function(d){if(!d.value)done=false;});
  if(done)setTimeout(twoFactorPass,260);
}
function tfKey(e,el){
  if(e.key==='Backspace'&&!el.value&&el.previousElementSibling&&el.previousElementSibling.classList.contains('tf-digit')){el.previousElementSibling.focus();e.preventDefault();}
}
function logout(){clearPresence();sessionStorage.removeItem('lo-auth');currentUser=null;document.getElementById('login-screen').classList.remove('hidden');document.getElementById('app').classList.remove('visible');document.getElementById('login-user').value='';document.getElementById('login-pass').value='';closeRail();hideForgot();}

// ═══ FORGOT PASSWORD (demo simulation) ═════════════════════════════════════
var resetCode='',resetUser='';
function showForgotStep(step){
  document.querySelector('.login-box:not(#forgot-box)').style.display='none';
  document.getElementById('forgot-box').style.display='';
  ['forgot-email','forgot-code','forgot-newpass'].forEach(function(id){document.getElementById(id).style.display='none';});
  document.getElementById('forgot-'+step).style.display='';
  ['forgot-err','code-err','newpass-err'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent='';});
}
function hideForgot(){
  document.querySelector('.login-box:not(#forgot-box)').style.display='';
  document.getElementById('forgot-box').style.display='none';
  resetCode='';resetUser='';
}
function sendResetCode(){
  var email=document.getElementById('forgot-email-input').value.trim();
  if(!email){document.getElementById('forgot-err').textContent='Please enter an email address.';return;}
  // Find user by email
  var users=getAllUsers(),prefs=ls.get(PK)||{};
  var foundUser=null;
  Object.keys(users).forEach(function(k){
    var u=users[k],up=prefs[k]||{};
    if((up.email||u.email||'').toLowerCase()===email.toLowerCase())foundUser=k;
  });
  if(!foundUser){document.getElementById('forgot-err').textContent='No account found with that email.';return;}
  // Generate 6-digit code
  resetCode=String(Math.floor(100000+Math.random()*900000));
  resetUser=foundUser;
  document.getElementById('forgot-sent-to').textContent=email;
  // Demo mode: show code via toast since we can't send real email
  showForgotStep('code');
  setTimeout(function(){
    var t=document.getElementById('toast');
    if(t){document.getElementById('toast-msg').textContent='Demo mode \u2014 your reset code is: '+resetCode;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},6000);}
  },500);
}
function verifyResetCode(){
  var input=document.getElementById('forgot-code-input').value.trim();
  if(!input){document.getElementById('code-err').textContent='Please enter the code.';return;}
  if(input!==resetCode){document.getElementById('code-err').textContent='Incorrect code. Please try again.';return;}
  document.getElementById('forgot-reset-user').textContent=resetUser;
  showForgotStep('newpass');
}
function completeReset(){
  var p1=document.getElementById('forgot-pass1').value,p2=document.getElementById('forgot-pass2').value;
  if(!p1||p1.length<6){document.getElementById('newpass-err').textContent='Password must be at least 6 characters.';return;}
  if(p1!==p2){document.getElementById('newpass-err').textContent='Passwords do not match.';return;}
  // Save new password
  var bi=!!BASE_USERS[resetUser];
  if(bi){var p=ls.get(PK)||{};if(!p[resetUser])p[resetUser]={};p[resetUser].pass=p1;ls.set(PK,p);}
  else{var c=ls.get(UK)||{};if(c[resetUser])c[resetUser].pass=p1;ls.set(UK,c);}
  // Return to login
  hideForgot();
  document.getElementById('login-user').value=resetUser;
  document.getElementById('login-pass').value='';
  document.getElementById('login-err').style.color='var(--green)';
  document.getElementById('login-err').textContent='Password reset! You can now sign in.';
  setTimeout(function(){document.getElementById('login-err').style.color='';},5000);
  resetCode='';resetUser='';
}

function bootApp(username){
  currentUser=username;applyPrefs();updateHeaderUser();
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.add('visible');
  document.getElementById('add-btn').style.display=canDo('canAdd')?'':'none';
  document.getElementById('team-nav-btn').style.display=canDo('canManageTeam')?'':'none';
  document.getElementById('trash-tab').style.display=canDo('canDelete')?'':'none';
  init();updateNotifBadge();updateDMBadge();startPresence();renderPW();loadEmailCfgUI();
}
function updateHeaderUser(){
  var def=getUserDef(currentUser);if(!def)return;
  document.getElementById('header-username').textContent=def.displayName;
  var av=document.getElementById('hdr-av');
  if(def.emoji){av.textContent=def.emoji;av.className='hav';av.style.background='#222';}
  else{av.textContent=def.displayName[0].toUpperCase();av.className='hav ti '+(def.avatarClass||'');av.style.background='';}
  var rav=document.getElementById('rail-av');
  if(def.emoji){rav.textContent=def.emoji;rav.className='rav';rav.style.background='#222';}
  else{rav.textContent=def.displayName[0].toUpperCase();rav.className='rav ti '+(def.avatarClass||'');rav.style.background='';}
  document.getElementById('rail-uname').textContent=def.displayName;
  document.getElementById('rail-urole').textContent=cap(def.role||'viewer');
}
document.getElementById('login-pass').addEventListener('keydown',function(e){if(e.key==='Enter')tryLogin();});
document.getElementById('login-user').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('login-pass').focus();});
// Remember me — prefill the saved username and re-check the box on load
(function(){var ru=ls.get('lo-remember');if(ru){var ui=document.getElementById('login-user');if(ui)ui.value=ru;var rm=document.getElementById('remember-me');if(rm)rm.checked=true;}})();
