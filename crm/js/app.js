
// ═══ INIT / TABS ═════════════════════════════════════════════════════════════
var currentTab='feed',activeFilters=new Set(),fddOpen=false,editingId=null,detailId=null,shareId=null;
function init(){seedFeed();seedChannel();seedDMs();seedNotifs();switchTab('intake');}
function switchTab(tab){
  currentTab=tab;activeFilters.clear();closeFDD();
  document.querySelectorAll('.ntab').forEach(function(el){el.classList.toggle('active',el.dataset.tab===tab);});
  // Hide toolbar on the self-contained views (dashboard, intake); show on list tabs
  var tb=document.querySelector('.toolbar');if(tb)tb.style.display=(tab==='feed'||tab==='intake')?'none':'';
  updateCounts();renderMain();renderStats();buildFDD();
}
function liveContacts(){return contacts.filter(function(c){return!c.deletion_requested;});}
function trashedContacts(){return contacts.filter(function(c){return!!c.deletion_requested;});}
function updateCounts(){
  if(typeof syncUnifiedModel==='function')syncUnifiedModel();
  var live=liveContacts();
  document.getElementById('cnt-all').textContent=live.length;
  document.getElementById('cnt-companies').textContent=[...new Set(live.map(function(c){return c.company;}).filter(Boolean))].length;
  ['contacts','active','prospects','former'].forEach(function(cat){document.getElementById('cnt-'+cat).textContent=live.filter(function(c){return c.cat===cat;}).length;});
  document.getElementById('cnt-favorites').textContent=getFavIds().filter(function(id){return live.some(function(c){return c.id===id;});}).length;
  document.getElementById('cnt-trash').textContent=trashedContacts().length;
  var ci=document.getElementById('cnt-intake');if(ci)ci.textContent=intakeLeads.length;
}
function renderStats(){
  var live=liveContacts();
  if(currentTab==='feed'||currentTab==='intake'){document.getElementById('stats-bar').innerHTML='';return;}
  if(currentTab==='trash'){var tc=trashedContacts().length;document.getElementById('stats-bar').innerHTML='<div class="stat-card"><div class="stat-val">'+tc+'</div><div class="stat-lbl">In Trash</div></div>';return;}
  var sub=currentTab==='companies'?live:currentTab==='favorites'?live.filter(function(c){return isFav(c.id);}):currentTab==='all'?live:live.filter(function(c){return c.cat===currentTab;});
  var coCount=[...new Set(live.map(function(c){return c.company;}).filter(Boolean))].length;
  var h='<div class="stat-card"><div class="stat-val">'+(currentTab==='companies'?coCount:sub.length)+'</div><div class="stat-lbl">'+(CAT_LABELS[currentTab]||'')+'</div></div>';
  var act=live.filter(function(c){return c.cat==='active';});
  var sr=act.filter(function(c){return(c.tags||[]).indexOf('social-retainer')>-1;}).length;
  var mr=act.filter(function(c){return(c.tags||[]).indexOf('marketing-retainer')>-1;}).length;
  if(currentTab==='all'||currentTab==='companies')h+='<div class="stat-card"><div class="stat-val">'+act.length+'</div><div class="stat-lbl">Active Clients</div></div>';
  h+='<div class="stat-card"><div class="stat-val">'+sr+'</div><div class="stat-lbl">Social Retainer</div></div>';
  h+='<div class="stat-card"><div class="stat-val">'+mr+'</div><div class="stat-lbl">Mktg Retainer</div></div>';
  document.getElementById('stats-bar').innerHTML=h;
}
function renderMain(){
  var q=document.getElementById('search-input').value.toLowerCase();
  if(currentTab==='intake'){renderIntake();return;}
  if(currentTab==='feed'){renderFeed();return;}
  if(currentTab==='trash'){renderTrash();return;}
  if(currentTab==='companies'){renderCompanies();return;}
  var live=liveContacts();
  var sub=currentTab==='favorites'?live.filter(function(c){return isFav(c.id);}):currentTab==='all'?live:live.filter(function(c){return c.cat===currentTab;});
  if(q)sub=sub.filter(function(c){return[c.first,c.last,c.company,c.title,c.email,c.service,c.website].concat(c.tags||[]).concat([c.notes]).join(' ').toLowerCase().indexOf(q)>-1;});
  if(activeFilters.size)sub=sub.filter(function(c){return[...activeFilters].some(function(f){return(c.tags||[]).indexOf(f)>-1;});});
  sub=sortContacts(sub);
  var showPill=currentTab==='all'||currentTab==='favorites';
  document.getElementById('main-content').innerHTML='<div class="cg">'+renderCards(sub,showPill)+'</div>';
}
