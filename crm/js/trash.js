
// ═══ TRASH / SOFT DELETE ═════════════════════════════════════════════════════
function renderTrash(){
  var trashed=trashedContacts(),tCos=trashedCompanies();
  if(!trashed.length&&!tCos.length){document.getElementById('main-content').innerHTML='<div class="empty-state"><p>Trash is empty</p></div>';return;}
  var h=trashed.map(function(c){
    var req=c.deletion_requested_by||{};var reqUser=getUserDef(req.user);var reqName=reqUser?reqUser.displayName:req.user||'Unknown';
    var reqDate=req.ts?new Date(req.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Unknown date';
    var tco=companyOfContact(c);
    var pill=tco?'<div class="cat-pill '+(PILL_CLS[tco.lifecycle]||'')+'">'+(LIFECYCLE_LBL[tco.lifecycle]||'')+'</div>':'';
    return '<div class="trash-card">'
      +'<div class="trash-hdr"><div class="trash-av" style="background:'+(tco?companyColor(tco):'#333')+'">'+ini(c)+'</div><div><div class="trash-name">'+esc(c.first)+' '+esc(c.last)+'</div><div class="trash-co">'+esc(c.title||'')+(tco?(c.title?' \u00B7 ':'')+esc(tco.name):'')+'</div></div>'+pill+'</div>'
      +'<div class="trash-meta">Requested by <strong>'+esc(reqName)+'</strong> on '+reqDate+'</div>'
      +'<div class="trash-acts"><button class="trash-btn" onclick="restoreContact(\''+c.id+'\')">&#x21A9; Restore</button><button class="trash-btn danger" onclick="permanentlyDelete(\''+c.id+'\')">&#x2715; Delete Forever</button></div>'
      +'</div>';
  }).join('');
  var coH=tCos.map(function(co){
    var req=co.deletion_requested_by||{};var ru=getUserDef(req.user);
    var rn=ru?ru.displayName:req.user||'Unknown';
    var rd=req.ts?new Date(req.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Unknown date';
    var n=contactsOfCompany(co.id).length;
    return '<div class="trash-card">'
      +'<div class="trash-hdr"><div class="trash-av" style="background:'+companyColor(co)+'">'+esc(co.name.slice(0,2).toUpperCase())+'</div>'
      +'<div><div class="trash-name">'+esc(co.name)+'</div><div class="trash-co">'+n+' contact'+(n!==1?'s':'')+'</div></div>'
      +'<div class="cat-pill '+(PILL_CLS[co.lifecycle]||'')+'">'+LIFECYCLE_LBL[co.lifecycle]+'</div></div>'
      +'<div class="trash-meta">Requested by <strong>'+esc(rn)+'</strong> on '+rd+'</div>'
      +'<div class="trash-acts"><button class="trash-btn" onclick="restoreCompany(\''+co.id+'\')">&#x21A9; Restore</button>'
      +'<button class="trash-btn danger" onclick="permanentlyDeleteCompany(\''+co.id+'\')">&#x2715; Delete Forever</button></div>'
      +'</div>';
  }).join('');
  document.getElementById('main-content').innerHTML=
    (tCos.length?'<div class="dp-sub"><span class="dp-sub-title red">Companies</span><div class="dp-sub-line"></div></div>'+coH:'')
    +(trashed.length?'<div class="dp-sub"><span class="dp-sub-title muted">Contacts</span><div class="dp-sub-line"></div></div>'+h:'');
}

// ── company soft-delete. Lifecycle lives on the company, so restoring a
//    contact cannot change any status — it returns exactly where it was.
function requestCompanyDeletion(id){
  var co=getCompany(id);if(!co)return;
  if(!confirm('Move '+co.name+' to Trash? Its contacts stay, but the company leaves every list.'))return;
  co.deletion_requested=true;
  co.deletion_requested_by={user:currentUser,ts:Date.now()};
  saveCompanies();
  var rn=(getUserDef(currentUser)||{}).displayName||currentUser;
  Object.keys(BASE_USERS).forEach(function(u){
    if(BASE_USERS[u].role==='owner')addNotif(u,'<strong>'+esc(rn)+'</strong> requested deletion of '+esc(co.name),null,'deletion');
  });
  feedDeletion(rn,null,co.name);
  closeDet();updateCounts();renderMain();renderStats();toast('Moved to Trash.');
}
function restoreCompany(id){
  var co=getCompany(id);if(!co)return;
  delete co.deletion_requested;delete co.deletion_requested_by;
  saveCompanies();updateCounts();renderMain();renderStats();
  toast(co.name+' restored to '+LIFECYCLE_LBL[co.lifecycle]+'.');
}
function permanentlyDeleteCompany(id){
  var co=getCompany(id);if(!co)return;
  var n=contactsOfCompany(co.id).length;
  if(!confirm('Permanently delete '+co.name+'?'+(n?' Its '+n+' contact'+(n!==1?'s':'')+' will be left without a company.':'')+' This cannot be undone.'))return;
  contactsOfCompany(co.id).forEach(function(c){c.companyId=null;});
  ls.set(CK,contacts);
  companies=companies.filter(function(x){return x.id!==id;});
  saveCompanies();updateCounts();renderMain();renderStats();toast('Permanently deleted.');
}
function requestDeletion(id){
  if(!confirm('Request deletion of this contact? An owner will need to approve it.'))return;
  var c=contacts.find(function(x){return x.id===id;});if(!c)return;
  c.deletion_requested=true;
  c.deletion_requested_by={user:currentUser,ts:Date.now()};
  ls.set(CK,contacts);
  var reqName=(getUserDef(currentUser)||{}).displayName||currentUser;
  var cName=c.first+' '+c.last;
  Object.keys(BASE_USERS).forEach(function(u){
    if(BASE_USERS[u].role==='owner')addNotif(u,'<strong>'+esc(reqName)+'</strong> requested deletion of '+esc(cName),c.id,'deletion');
  });
  feedDeletion(reqName,c.id,cName);
  closeDet();updateCounts();renderMain();renderStats();toast('Deletion requested.');
}
function restoreContact(id){
  var c=contacts.find(function(x){return x.id===id;});if(!c)return;
  delete c.deletion_requested;delete c.deletion_requested_by;
  ls.set(CK,contacts);updateCounts();renderMain();renderStats();toast('Restored.');
}
function permanentlyDelete(id){
  if(!confirm('Permanently delete this contact? This cannot be undone.'))return;
  contacts=contacts.filter(function(c){return c.id!==id;});
  ls.set(CK,contacts);updateCounts();renderMain();renderStats();toast('Permanently deleted.');
}
