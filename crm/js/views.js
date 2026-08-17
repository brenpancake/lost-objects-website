
// ═══ COMPANIES VIEW ══════════════════════════════════════════════════════════
// Reads the unified companies array directly. Keyed on company id, not name —
// name-keying silently orphaned a company's colour and notes on rename.
var expandedCos=new Set(),openColorPop=null,dragContactId=null;

function matchesTagFilters(rec){
  if(!activeFilters.size)return true;
  return [...activeFilters].some(function(f){return(rec.tags||[]).indexOf(f)>-1;});
}

function renderCompanies(){
  var q=document.getElementById('search-input').value.toLowerCase();
  var list=liveCompanies().filter(function(co){
    return companyMatches(co,q)&&matchesTagFilters(co);
  }).sort(function(a,b){return a.name.localeCompare(b.name);});
  if(!list.length){document.getElementById('main-content').innerHTML='<div class="empty-state">No companies found</div>';return;}
  document.getElementById('main-content').innerHTML='<div class="companies-view">'+list.map(function(co){
    var members=contactsOfCompany(co.id).filter(function(c){return!c.deletion_requested;});
    var col=companyColor(co);var isExp=expandedCos.has(co.id);
    var eng=activeEngagements(co);
    return '<div class="co-group'+(isExp?' expanded':'')+'" id="cog-'+co.id+'" ondragover="coDragOver(event,\''+co.id+'\')" ondrop="coDrop(event,\''+co.id+'\')" ondragleave="coDragLeave(event)">'
      +'<div class="co-hdr" onclick="toggleCoGroup(\''+co.id+'\')">'
      +'<div class="co-swatch-wrap"><button class="co-swatch-btn" style="background:'+col+'" onclick="event.stopPropagation();toggleColorPop(\''+co.id+'\')" title="Change color"></button>'
      +'<div class="color-pop" id="cpop-'+co.id+'" onclick="event.stopPropagation()">'
      +'<div class="cp-title">Company Color</div>'
      +'<div class="cp-wheel">'+CO_COLORS.map(function(cc){return '<div class="cp-dot'+(cc===col?' active':'')+'" style="background:'+cc+'" onclick="pickColor(\''+co.id+'\',\''+cc+'\')"></div>';}).join('')+'</div>'
      +'<div class="cp-hex-row"><input class="cp-hex" type="text" id="cphex-'+co.id+'" value="'+col+'" placeholder="#FF6666" maxlength="7"/><button class="cp-apply" onclick="applyHexColor(\''+co.id+'\')">Apply</button></div>'
      +'</div></div>'
      +'<div class="co-name">'+esc(co.name)+(co.isSolo?' <span class="solo-flag">solo</span>':'')+'</div>'
      +'<div class="co-meta"><span class="lc-pill lc-'+co.lifecycle+'">'+LIFECYCLE_LBL[co.lifecycle]+'</span>'
        +'<span>'+members.length+' contact'+(members.length!==1?'s':'')+'</span>'
        +(eng.length?'<span style="color:var(--pink)">&#x25CF; '+esc(eng[0].name)+'</span>':'')+'</div>'
      +'<span class="co-chevron">&#x25BA;</span>'
      +'</div>'
      +(isExp?'<div class="co-body"><div class="co-notes-area"><textarea class="co-notes-ta" placeholder="Company notes&hellip;" onchange="setCompanyNotes(getCompany(\''+co.id+'\'),this.value)" onclick="event.stopPropagation()">'+esc(co.notes)+'</textarea></div>'
        +'<div class="co-cards">'+(members.length?members.map(function(c){return coCardHTML(c,col);}).join(''):'<div class="co-empty">No contacts yet</div>')+'</div></div>':'')
      +'</div>';
  }).join('')+'</div>';
}

function coCardHTML(c,coColor){
  var favd=isFav(c.id);var co=companyOfContact(c);
  var tags=(c.tags||[]).slice(0,2).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join('');
  return '<div class="cc co-card-drag" draggable="true" data-cid="'+c.id+'" ondragstart="cDragStart(event,\''+c.id+'\')" ondragend="cDragEnd(event)" onclick="openDet(\''+c.id+'\')">'
    +'<div class="cc-stripe" style="background:'+coColor+'"></div>'
    +'<div class="cc-hdr"><div class="cc-av-wrap"><div class="cc-av" style="background:'+coColor+'">'+ini(c)+'</div>'+(favd?'<div class="fav-pip">&#x2605;</div>':'')+'</div>'
    +'<div class="cc-hdr-r">'+(!isGuest()?'<button class="ib '+(favd?'fav-on':'')+'" onclick="event.stopPropagation();toggleFav(\''+c.id+'\')" title="Favorite">&#x2605;</button>':'')+(canDo('canEdit')?'<button class="ib" onclick="event.stopPropagation();openEditModal(\''+c.id+'\')">⋯</button>':'')+'</div></div>'
    +'<div class="cc-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
    +'<div class="cc-role">'+esc(c.title||(co?co.name:''))+'</div>'
    +(c.email?'<div class="cc-info">'+mailSvg()+esc(c.email)+'</div>':'')
    +'<div class="cc-tags">'+tags+'</div>'
    +(c.notes?'<div class="cc-preview">'+esc(c.notes)+'</div>':'')
    +'</div>';
}

function toggleCoGroup(id){
  if(expandedCos.has(id))expandedCos.delete(id);else expandedCos.add(id);
  if(openColorPop){var el=document.getElementById(openColorPop);if(el)el.classList.remove('open');openColorPop=null;}
  renderCompanies();
}

function cDragStart(e,cid){dragContactId=cid;e.currentTarget.classList.add('dragging');e.dataTransfer.setData('text/plain',cid);e.dataTransfer.effectAllowed='move';}
function cDragEnd(e){e.currentTarget.classList.remove('dragging');dragContactId=null;document.querySelectorAll('.co-group.drag-over').forEach(function(el){el.classList.remove('drag-over');});}
function coDragOver(e,id){e.preventDefault();e.dataTransfer.dropEffect='move';var el=document.getElementById('cog-'+id);if(el)el.classList.add('drag-over');}
function coDragLeave(e){e.currentTarget.classList.remove('drag-over');}
function coDrop(e,id){
  e.preventDefault();e.currentTarget.classList.remove('drag-over');
  var cid=e.dataTransfer.getData('text/plain')||dragContactId;if(!cid)return;
  var c=contacts.find(function(x){return x.id===cid;});if(!c)return;
  var from=c.companyId;var co=getCompany(id);if(!co||from===id)return;
  moveContactToCompany(cid,id);
  expandedCos.add(id);if(from)expandedCos.add(from);
  updateCounts();renderCompanies();toast('Moved to '+co.name+'.');
}

function toggleColorPop(id){
  var key='cpop-'+id;
  if(openColorPop&&openColorPop!==key){var prev=document.getElementById(openColorPop);if(prev)prev.classList.remove('open');openColorPop=null;}
  var el=document.getElementById(key);if(!el)return;
  if(el.classList.contains('open')){el.classList.remove('open');openColorPop=null;}else{el.classList.add('open');openColorPop=key;}
}
function pickColor(id,color){
  var co=getCompany(id);if(!co)return;
  setCompanyColor(co,color);
  var hexEl=document.getElementById('cphex-'+id);if(hexEl)hexEl.value=color;
  if(openColorPop){var el=document.getElementById(openColorPop);if(el)el.classList.remove('open');openColorPop=null;}
  expandedCos.add(id);
  renderCompanies();
}
function applyHexColor(id){
  var hexEl=document.getElementById('cphex-'+id);if(!hexEl)return;
  var val=hexEl.value.trim();if(val[0]!=='#')val='#'+val;
  if(!/^#[0-9A-Fa-f]{6}$/.test(val)){toast('Enter a valid 6-digit hex color.');return;}
  pickColor(id,val);
}

// ═══ COMPANY CARDS — the lifecycle tabs (Active / Prospects / Past) ══════════
// These tabs list companies, because companies are what carry lifecycle.
function renderCompanyCards(list){
  if(!list.length)return'<div class="empty-state"><p>No companies here</p></div>';
  return list.map(function(co){
    var col=companyColor(co);
    var members=contactsOfCompany(co.id).filter(function(c){return!c.deletion_requested;});
    var eng=(co.engagements||[]),act=activeEngagements(co);
    var tags=(co.tags||[]).slice(0,3).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join('');
    var badge=act.length?'<div class="svc-badge"><span class="pls"></span>'+esc(act[0].name)+'</div>'
             :(eng.length?'<div class="old-badge">'+esc(eng[0].name)+'</div>':'');
    var owner=co.owner?((getUserDef(co.owner)||{}).displayName||co.owner):null;
    var cc=commentsOfCompany(co.id).length;
    return '<div class="cc" onclick="openCompanyDet(\''+co.id+'\')">'
      +'<div class="cc-stripe" style="background:'+col+'"></div>'
      +'<div class="cc-hdr"><div class="cc-av-wrap"><div class="cc-av" style="background:'+col+'">'+esc(co.name.slice(0,2).toUpperCase())+'</div></div>'
      +'<div class="cc-hdr-r"><span class="lc-pill lc-'+co.lifecycle+'">'+LIFECYCLE_LBL[co.lifecycle]+'</span></div></div>'
      +'<div class="cc-name">'+esc(co.name)+(co.isSolo?' <span class="solo-flag">solo</span>':'')+'</div>'
      +'<div class="cc-role">'+members.length+' contact'+(members.length!==1?'s':'')+(owner?' &middot; '+esc(owner):'')+'</div>'
      +badge
      +(co.lastContact?'<div class="cc-info">'+calSvg()+' Last contact '+esc(co.lastContact)+'</div>':'')
      +'<div class="cc-tags">'+tags+'</div>'
      +(co.notes?'<div class="cc-preview">'+esc(co.notes)+'</div>':'')
      +(cc?'<div class="cc-meta">'+bubSvg()+cc+' comment'+(cc>1?'s':'')+'</div>':'')
      +'</div>';
  }).join('');
}

function sortCompanies(arr){
  var s=document.getElementById('sort-sel').value;
  return arr.slice().sort(function(a,b){
    if(s==='name-desc')return b.name.localeCompare(a.name);
    if(s==='recent')return(b.created||0)-(a.created||0);
    return a.name.localeCompare(b.name);
  });
}

// ═══ CONTACT CARDS — All / Contacts / Favorites ═══════════════════════════════
function sortContacts(arr){
  var s=document.getElementById('sort-sel').value;
  return arr.slice().sort(function(a,b){
    if(s==='name')return(a.first+a.last).localeCompare(b.first+b.last);
    if(s==='name-desc')return(b.first+b.last).localeCompare(a.first+a.last);
    if(s==='recent')return(b.created||0)-(a.created||0);
    if(s==='company'){var ca=companyOfContact(a),cb=companyOfContact(b);return(ca?ca.name:'').localeCompare(cb?cb.name:'');}
    return 0;
  });
}

function renderCards(sub,showPill){
  if(!sub.length)return'<div class="empty-state"><p>No contacts found</p></div>';
  return sub.map(function(c){
    var co=companyOfContact(c);
    var tags=(c.tags||[]).slice(0,3).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join('');
    var favd=isFav(c.id);
    var avBg=co?companyColor(co):(AV_BG[c.role]||'#444');
    var act=co?activeEngagements(co):[];
    var badge='';
    if(co&&co.lifecycle==='active'&&act.length)badge='<div class="svc-badge"><span class="pls"></span>'+esc(act[0].name)+'</div>';
    else if(co&&(co.lifecycle==='former'||co.lifecycle==='dormant'))badge='<div class="old-badge">'+LIFECYCLE_LBL[co.lifecycle]+((co.engagements||[]).length?' &mdash; '+esc(co.engagements[0].name):'')+'</div>';
    var pill=(showPill&&co)?'<div class="cat-pill '+(PILL_CLS[co.lifecycle]||'')+'">'+(LIFECYCLE_LBL[co.lifecycle]||'')+'</div>':'';
    var cc=(c.comments||[]).length;
    return '<div class="cc" onclick="openDet(\''+c.id+'\')">'
      +'<div class="cc-stripe" style="background:'+avBg+'"></div>'
      +'<div class="cc-hdr"><div class="cc-av-wrap"><div class="cc-av" style="background:'+avBg+'">'+ini(c)+'</div>'+(favd?'<div class="fav-pip">&#x2605;</div>':'')+'</div>'
      +'<div class="cc-hdr-r">'+(!isGuest()?'<button class="ib '+(favd?'fav-on':'')+'" onclick="event.stopPropagation();toggleFav(\''+c.id+'\')" title="Favorite">&#x2605;</button>':'')+(canDo('canEdit')?'<button class="ib" onclick="event.stopPropagation();openEditModal(\''+c.id+'\')">⋯</button>':'')+'</div></div>'
      +pill+badge
      +'<div class="cc-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
      +'<div class="cc-role">'+esc(c.title||(co?co.name:''))+'</div>'
      +(c.email?'<div class="cc-info">'+mailSvg()+esc(c.email)+'</div>':'')
      +(c.phone?'<div class="cc-info">'+phoneSvg()+esc(c.phone)+'</div>':'')
      +'<div class="cc-tags">'+tags+'</div>'
      +(c.notes?'<div class="cc-preview">'+esc(c.notes)+'</div>':'')
      +(cc?'<div class="cc-meta">'+bubSvg()+cc+' comment'+(cc>1?'s':'')+'</div>':'')
      +'</div>';
  }).join('');
}
