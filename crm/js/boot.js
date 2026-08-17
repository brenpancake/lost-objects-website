
document.addEventListener('click',function(e){
  var ftog=document.getElementById('ftog-btn'),fdd=document.getElementById('fdd');
  if(fddOpen&&ftog&&fdd&&!ftog.contains(e.target)&&!fdd.contains(e.target))closeFDD();
  var pw=document.getElementById('pw');if(pwOpen&&pw&&!pw.contains(e.target)){pwOpen=false;document.getElementById('pw-panel').classList.remove('open');}
  if(openColorPop&&!e.target.closest('.co-swatch-wrap')){var el=document.getElementById(openColorPop);if(el)el.classList.remove('open');openColorPop=null;}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();closeDet();closeShare();closeRail();closeNotifPanel();closeBinAssign();closeEU();closeFDD();}});

// BOOT
var saved=sessionStorage.getItem('lo-auth');
if(saved&&getAllUsers()[saved])bootApp(saved);
