
// ═══ TRASH / SOFT DELETE ═════════════════════════════════════════════════════
function renderTrash(){
  var trashed=trashedContacts();
  if(!trashed.length){document.getElementById('main-content').innerHTML='<div class="empty-state"><p>Trash is empty</p></div>';return;}
  var h=trashed.map(function(c){
    var req=c.deletion_requested_by||{};var reqUser=getUserDef(req.user);var reqName=reqUser?reqUser.displayName:req.user||'Unknown';
    var reqDate=req.ts?new Date(req.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'Unknown date';
    var pill='<div class="cat-pill '+(PILL_CLS[c.cat]||'')+'">'+(PILL_LBL[c.cat]||'')+'</div>';
    return '<div class="trash-card">'
      +'<div class="trash-hdr"><div class="trash-av" style="background:'+(AV_BG[c.cat]||'#444')+'">'+ini(c)+'</div><div><div class="trash-name">'+esc(c.first)+' '+esc(c.last)+'</div><div class="trash-co">'+esc(c.title?c.title+' \u00B7 '+c.company:c.company||'')+'</div></div>'+pill+'</div>'
      +'<div class="trash-meta">Requested by <strong>'+esc(reqName)+'</strong> on '+reqDate+'</div>'
      +'<div class="trash-acts"><button class="trash-btn" onclick="restoreContact(\''+c.id+'\')">&#x21A9; Restore</button><button class="trash-btn danger" onclick="permanentlyDelete(\''+c.id+'\')">&#x2715; Delete Forever</button></div>'
      +'</div>';
  }).join('');
  document.getElementById('main-content').innerHTML=h;
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
