
// ═══ INIT / TABS ═════════════════════════════════════════════════════════════
// Every list view reads the unified model:
//   Companies / Active / Prospects / Past  -> companies (lifecycle queries)
//   All / Contacts / Favorites             -> contacts (with company refs)
//   Intake                                 -> intakeQueue()
var currentTab='feed',activeFilters=new Set(),fddOpen=false,editingId=null,detailId=null,shareId=null;
var pastFilter='all';   // Past view sub-filter: all | former | dormant

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
  var live=liveContacts();
  document.getElementById('cnt-all').textContent=live.length;
  document.getElementById('cnt-companies').textContent=liveCompanies().length;
  document.getElementById('cnt-active').textContent=companiesByLifecycle('active').length;
  document.getElementById('cnt-prospects').textContent=companiesByLifecycle('prospect').length;
  document.getElementById('cnt-contacts').textContent=networkContacts().length;
  document.getElementById('cnt-former').textContent=pastCompanies().length;
  document.getElementById('cnt-favorites').textContent=getFavIds().filter(function(id){return live.some(function(c){return c.id===id;});}).length;
  document.getElementById('cnt-trash').textContent=trashedContacts().length+trashedCompanies().length;
  var ci=document.getElementById('cnt-intake');if(ci)ci.textContent=intakeQueue().length;
}

function renderStats(){
  if(currentTab==='feed'||currentTab==='intake'){document.getElementById('stats-bar').innerHTML='';return;}
  if(currentTab==='trash'){
    var tc=trashedContacts().length+trashedCompanies().length;
    document.getElementById('stats-bar').innerHTML='<div class="stat-card"><div class="stat-val">'+tc+'</div><div class="stat-lbl">In Trash</div></div>';return;
  }
  var n=({companies:function(){return liveCompanies().length;},
          active:function(){return companiesByLifecycle('active').length;},
          prospects:function(){return companiesByLifecycle('prospect').length;},
          former:function(){return pastCompanies().length;},
          contacts:function(){return networkContacts().length;},
          favorites:function(){return liveContacts().filter(function(c){return isFav(c.id);}).length;},
          all:function(){return liveContacts().length;}}[currentTab]||function(){return 0;})();
  var h='<div class="stat-card"><div class="stat-val">'+n+'</div><div class="stat-lbl">'+(CAT_LABELS[currentTab]||'')+'</div></div>';
  var act=companiesByLifecycle('active');
  var sr=act.filter(function(co){return(co.tags||[]).indexOf('social-retainer')>-1;}).length;
  var mr=act.filter(function(co){return(co.tags||[]).indexOf('marketing-retainer')>-1;}).length;
  if(currentTab==='all'||currentTab==='companies')h+='<div class="stat-card"><div class="stat-val">'+act.length+'</div><div class="stat-lbl">Active Clients</div></div>';
  h+='<div class="stat-card"><div class="stat-val">'+sr+'</div><div class="stat-lbl">Social Retainer</div></div>';
  h+='<div class="stat-card"><div class="stat-val">'+mr+'</div><div class="stat-lbl">Mktg Retainer</div></div>';
  document.getElementById('stats-bar').innerHTML=h;
}

// Past = both terminal states. Nothing is lifecycle 'former' in the demo data
// (DJI is dormant), so a Former-only tab would render empty.
function setPastFilter(f){pastFilter=f;renderMain();}
function pastChipsHTML(){
  var all=pastCompanies();
  var counts={all:all.length,
              former:all.filter(function(co){return co.lifecycle==='former';}).length,
              dormant:all.filter(function(co){return co.lifecycle==='dormant';}).length};
  return '<div class="past-chips">'+['all','former','dormant'].map(function(f){
    return '<button class="past-chip'+(pastFilter===f?' on':'')+'" onclick="setPastFilter(\''+f+'\')">'
      +(f==='all'?'All':LIFECYCLE_LBL[f])+' <span>'+counts[f]+'</span></button>';
  }).join('')+'</div>';
}

function renderMain(){
  var q=document.getElementById('search-input').value.toLowerCase();
  if(currentTab==='intake'){renderIntake();return;}
  if(currentTab==='feed'){renderFeed();return;}
  if(currentTab==='trash'){renderTrash();return;}
  if(currentTab==='companies'){renderCompanies();return;}

  // ── company-backed lifecycle tabs ──
  if(currentTab==='active'||currentTab==='prospects'||currentTab==='former'){
    var cos;
    if(currentTab==='active')cos=companiesByLifecycle('active');
    else if(currentTab==='prospects')cos=companiesByLifecycle('prospect');
    else cos=pastFilter==='all'?pastCompanies():companiesByLifecycle(pastFilter);
    cos=cos.filter(function(co){return companyMatches(co,q)&&matchesTagFilters(co);});
    cos=sortCompanies(cos);
    document.getElementById('main-content').innerHTML=
      (currentTab==='former'?pastChipsHTML():'')+'<div class="cg">'+renderCompanyCards(cos)+'</div>';
    return;
  }

  // ── contact-backed tabs ──
  var live=liveContacts();
  var sub=currentTab==='favorites'?live.filter(function(c){return isFav(c.id);})
        :currentTab==='contacts'?networkContacts()
        :live;
  if(q)sub=sub.filter(function(c){return contactMatches(c,q);});
  if(activeFilters.size)sub=sub.filter(matchesTagFilters);
  sub=sortContacts(sub);
  var showPill=currentTab==='all'||currentTab==='favorites';
  document.getElementById('main-content').innerHTML='<div class="cg">'+renderCards(sub,showPill)+'</div>';
}
