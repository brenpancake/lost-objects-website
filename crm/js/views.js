
// ═══ COMPANIES VIEW ══════════════════════════════════════════════════════════
var expandedCos=new Set(),openColorPop=null,dragContactId=null;

function renderCompanies(){
  var q=document.getElementById('search-input').value.toLowerCase();
  var coMap={};
  liveContacts().forEach(function(c){
    if(!c.company)return;
    var searchable=[c.first,c.last,c.company,c.title,c.email].concat(c.tags||[]).concat([c.notes]).join(' ').toLowerCase();
    if(q&&searchable.indexOf(q)===-1)return;
    if(activeFilters.size&&![...activeFilters].some(function(f){return(c.tags||[]).indexOf(f)>-1;}))return;
    if(!coMap[c.company])coMap[c.company]=[];
    coMap[c.company].push(c);
  });
  var sorted=Object.keys(coMap).sort();
  if(!sorted.length){document.getElementById('main-content').innerHTML='<div class="empty-state">No companies found</div>';return;}
  document.getElementById('main-content').innerHTML='<div class="companies-view">'+sorted.map(function(name){
    var members=coMap[name];var col=getCoColor(name);var isExp=expandedCos.has(name);var notes=getCoNotes(name);
    var activeCnt=members.filter(function(c){return c.cat==='active';}).length;
    var safeId=name.replace(/[^a-z0-9]/gi,'_');
    return '<div class="co-group'+(isExp?' expanded':'')+'" id="cog-'+safeId+'" ondragover="coDragOver(event,\''+esc2(name)+'\')" ondrop="coDrop(event,\''+esc2(name)+'\')" ondragleave="coDragLeave(event)">'
      +'<div class="co-hdr" onclick="toggleCoGroup(\''+esc2(name)+'\')">'
      +'<div class="co-swatch-wrap"><button class="co-swatch-btn" style="background:'+col+'" onclick="event.stopPropagation();toggleColorPop(\''+esc2(name)+'\')" title="Change color"></button>'
      +'<div class="color-pop" id="cpop-'+safeId+'" onclick="event.stopPropagation()">'
      +'<div class="cp-title">Company Color</div>'
      +'<div class="cp-wheel">'+CO_COLORS.map(function(cc){return '<div class="cp-dot'+(cc===col?' active':'')+'" style="background:'+cc+'" onclick="pickColor(\''+esc2(name)+'\',\''+cc+'\')"></div>';}).join('')+'</div>'
      +'<div class="cp-hex-row"><input class="cp-hex" type="text" id="cphex-'+safeId+'" value="'+col+'" placeholder="#FF6666" maxlength="7"/><button class="cp-apply" onclick="applyHexColor(\''+esc2(name)+'\',\''+safeId+'\')">Apply</button></div>'
      +'</div></div>'
      +'<div class="co-name">'+esc(name)+'</div>'
      +'<div class="co-meta"><span>'+members.length+' contact'+(members.length!==1?'s':'')+'</span>'+(activeCnt?'<span style="color:var(--pink)">&#x25CF; '+activeCnt+' active</span>':'')+'</div>'
      +'<span class="co-chevron">&#x25BA;</span>'
      +'</div>'
      +(isExp?'<div class="co-body"><div class="co-notes-area"><textarea class="co-notes-ta" placeholder="Company notes\u2026" onchange="setCoNotes(\''+esc2(name)+'\',this.value)" onclick="event.stopPropagation()">'+esc(notes)+'</textarea></div><div class="co-cards">'+members.map(function(c){return coCardHTML(c,col);}).join('')+'</div></div>':'')
      +'</div>';
  }).join('')+'</div>';
}

function coCardHTML(c,coColor){
  var favd=isFav(c.id);
  var tags=(c.tags||[]).slice(0,2).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join('');
  return '<div class="cc co-card-drag" draggable="true" data-cid="'+c.id+'" ondragstart="cDragStart(event,\''+c.id+'\')" ondragend="cDragEnd(event)" onclick="openDet(\''+c.id+'\')">'
    +'<div class="cc-stripe" style="background:'+coColor+'"></div>'
    +'<div class="cc-hdr"><div class="cc-av-wrap"><div class="cc-av" style="background:'+coColor+'">'+ini(c)+'</div>'+(favd?'<div class="fav-pip">&#x2605;</div>':'')+'</div>'
    +'<div class="cc-hdr-r">'+(!isGuest()?'<button class="ib '+(favd?'fav-on':'')+'" onclick="event.stopPropagation();toggleFav(\''+c.id+'\')" title="Favorite">&#x2605;</button>':'')+(canDo('canEdit')?'<button class="ib" onclick="event.stopPropagation();openEditModal(\''+c.id+'\')">\u22EF</button>':'')+'</div></div>'
    +'<div class="cc-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
    +'<div class="cc-role">'+esc(c.title||c.company||'')+'</div>'
    +(c.email?'<div class="cc-info">'+mailSvg()+esc(c.email)+'</div>':'')
    +'<div class="cc-tags">'+tags+'</div>'
    +(c.notes?'<div class="cc-preview">'+esc(c.notes)+'</div>':'')
    +'</div>';
}

function toggleCoGroup(name){
  if(expandedCos.has(name))expandedCos.delete(name);else expandedCos.add(name);
  if(openColorPop){var el=document.getElementById(openColorPop);if(el)el.classList.remove('open');openColorPop=null;}
  renderCompanies();
}

function cDragStart(e,cid){dragContactId=cid;e.currentTarget.classList.add('dragging');e.dataTransfer.setData('text/plain',cid);e.dataTransfer.effectAllowed='move';}
function cDragEnd(e){e.currentTarget.classList.remove('dragging');dragContactId=null;document.querySelectorAll('.co-group.drag-over').forEach(function(el){el.classList.remove('drag-over');});}
function coDragOver(e,name){e.preventDefault();e.dataTransfer.dropEffect='move';var safeId=name.replace(/[^a-z0-9]/gi,'_');var el=document.getElementById('cog-'+safeId);if(el)el.classList.add('drag-over');}
function coDragLeave(e){e.currentTarget.classList.remove('drag-over');}
function coDrop(e,name){
  e.preventDefault();e.currentTarget.classList.remove('drag-over');
  var cid=e.dataTransfer.getData('text/plain')||dragContactId;if(!cid)return;
  var c=contacts.find(function(x){return x.id===cid;});if(!c||c.company===name)return;
  var fromCo=c.company;c.company=name;ls.set(CK,contacts);
  expandedCos.add(name);if(fromCo)expandedCos.add(fromCo);
  renderCompanies();toast('Moved to '+name+'.');
}

function toggleColorPop(name){
  var safeId=name.replace(/[^a-z0-9]/gi,'_');var key='cpop-'+safeId;
  if(openColorPop&&openColorPop!==key){var prev=document.getElementById(openColorPop);if(prev)prev.classList.remove('open');openColorPop=null;}
  var el=document.getElementById(key);if(!el)return;
  var isOpen=el.classList.contains('open');
  if(isOpen){el.classList.remove('open');openColorPop=null;}else{el.classList.add('open');openColorPop=key;}
}
function pickColor(name,color){
  setCoColor(name,color);var safeId=name.replace(/[^a-z0-9]/gi,'_');
  var hexEl=document.getElementById('cphex-'+safeId);if(hexEl)hexEl.value=color;
  if(openColorPop){var el=document.getElementById(openColorPop);if(el)el.classList.remove('open');openColorPop=null;}
  if(!expandedCos.has(name))expandedCos.add(name);
  renderCompanies();
}
function applyHexColor(name,safeId){
  var hexEl=document.getElementById('cphex-'+safeId);if(!hexEl)return;
  var val=hexEl.value.trim();if(val[0]!=='#')val='#'+val;
  if(!/^#[0-9A-Fa-f]{6}$/.test(val)){toast('Enter a valid 6-digit hex color.');return;}
  pickColor(name,val);
}

// ═══ REGULAR CARDS ═══════════════════════════════════════════════════════════
function sortContacts(arr){
  var s=document.getElementById('sort-sel').value;
  return arr.slice().sort(function(a,b){
    if(s==='name')return(a.first+a.last).localeCompare(b.first+b.last);
    if(s==='name-desc')return(b.first+b.last).localeCompare(a.first+a.last);
    if(s==='recent')return(b.created||0)-(a.created||0);
    if(s==='company')return(a.company||'').localeCompare(b.company||'');
    return 0;
  });
}

function renderCards(sub,showPill){
  if(!sub.length)return'<div class="empty-state"><p>No contacts found</p></div>';
  return sub.map(function(c){
    var tags=(c.tags||[]).slice(0,3).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join('');
    var favd=isFav(c.id);var coColor=c.company?getCoColor(c.company):null;
    var avBg=coColor||AV_BG[c.cat]||'#444';
    var badge='';
    if(c.cat==='active'&&c.service)badge='<div class="svc-badge"><span class="pls"></span>'+esc(c.service)+'</div>';
    if(c.cat==='former'&&c.formerReason)badge='<div class="old-badge">'+esc(c.formerReason)+'</div>';
    var pill=showPill?'<div class="cat-pill '+(PILL_CLS[c.cat]||'')+'">'+(PILL_LBL[c.cat]||'')+'</div>':'';
    var cc=(c.comments||[]).length;
    return '<div class="cc" onclick="openDet(\''+c.id+'\')">'
      +'<div class="cc-stripe" style="background:'+avBg+'"></div>'
      +'<div class="cc-hdr"><div class="cc-av-wrap"><div class="cc-av" style="background:'+avBg+'">'+ini(c)+'</div>'+(favd?'<div class="fav-pip">&#x2605;</div>':'')+'</div>'
      +'<div class="cc-hdr-r">'+(!isGuest()?'<button class="ib '+(favd?'fav-on':'')+'" onclick="event.stopPropagation();toggleFav(\''+c.id+'\')" title="Favorite">&#x2605;</button>':'')+(canDo('canEdit')?'<button class="ib" onclick="event.stopPropagation();openEditModal(\''+c.id+'\')">\u22EF</button>':'')+'</div></div>'
      +pill+badge
      +'<div class="cc-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
      +'<div class="cc-role">'+esc(c.title||c.company||'')+'</div>'
      +(c.email?'<div class="cc-info">'+mailSvg()+esc(c.email)+'</div>':'')
      +(c.phone?'<div class="cc-info">'+phoneSvg()+esc(c.phone)+'</div>':'')
      +'<div class="cc-tags">'+tags+'</div>'
      +(c.notes?'<div class="cc-preview">'+esc(c.notes)+'</div>':'')
      +(cc?'<div class="cc-meta">'+bubSvg()+cc+' comment'+(cc>1?'s':'')+'</div>':'')
      +'</div>';
  }).join('');
}

