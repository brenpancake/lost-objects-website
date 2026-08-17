
// ═══ COPY / SHARE ════════════════════════════════════════════════════════════
function copyContactTxt(id){var c=contacts.find(function(x){return x.id===id;});if(!c)return;var mco=companyOfContact(c);var lines=[c.first+' '+c.last,c.title,mco?mco.name:'',c.email?'Email: '+c.email:'',c.phone?'Phone: '+c.phone:'',c.website?'Web: '+c.website:''].filter(Boolean).join('\n');navigator.clipboard.writeText(lines).then(function(){toast('Copied!');}).catch(function(){toast('Copy failed.');});}
function openShare(id){
  shareId=id;var c=contacts.find(function(x){return x.id===id;});if(!c)return;
  var base=window.location.href.replace(/\/[^/]*$|index\.html$/,'').replace(/\/?$/,'/');var url=base+'share.html?id='+id;
  document.getElementById('share-body').innerHTML='<div style="font-size:17px;font-weight:600;margin-bottom:2px">'+esc(c.first)+' '+esc(c.last)+'</div><div style="font-size:12px;color:var(--muted);margin-bottom:10px">'+esc((function(){var sc=companyOfContact(c);return c.title?(c.title+(sc?' \u00B7 '+sc.name:'')):(sc?sc.name:'');})())+'</div>'+(c.email?'<div style="font-size:12px;margin-bottom:5px">'+mailSvg()+' '+esc(c.email)+'</div>':'')+(c.phone?'<div style="font-size:12px;margin-bottom:5px">'+phoneSvg()+' '+esc(c.phone)+'</div>':'')+'<div class="share-url-box">'+url+'</div>';
  document.getElementById('share-ov').classList.add('open');
}
function copyShareUrl(){var base=window.location.href.replace(/\/[^/]*$|index\.html$/,'').replace(/\/?$/,'/');navigator.clipboard.writeText(base+'share.html?id='+shareId).then(function(){toast('Copied!');}).catch(function(){toast('Copy failed.');});}
function openSharePage(){var base=window.location.href.replace(/\/[^/]*$|index\.html$/,'').replace(/\/?$/,'/');window.open(base+'share.html?id='+shareId,'_blank');}
function closeShare(){document.getElementById('share-ov').classList.remove('open');}

// ═══ ADD / EDIT MODAL ════════════════════════════════════════════════════════
function buildTagSel(sel){document.getElementById('tag-sel').innerHTML=TAG_GROUPS.map(function(g){return '<div class="tgs"><div class="tgs-title">'+g.label+'</div><div class="tgs-row">'+g.tags.map(function(t){return '<button type="button" class="topt'+(sel.indexOf(t.key)>-1?' selected':'')+'" data-key="'+t.key+'" onclick="this.classList.toggle(\'selected\')">'+t.label+'</button>';}).join('')+'</div></div>';}).join('');}
function getSelTags(){return[].slice.call(document.querySelectorAll('#tag-sel .topt.selected')).map(function(b){return b.dataset.key;});}
function toggleCatFields(){var lc=document.getElementById('f-cat').value;document.getElementById('svc-field').style.display=(lc==='active'||lc==='prospect')?'block':'none';document.getElementById('former-field').style.display=(lc==='former'||lc==='dormant')?'block':'none';}
function openAddModal(){
  if(!canDo('canAdd'))return;editingId=null;document.getElementById('modal-title').textContent='Add Contact';document.getElementById('del-btn').style.display='none';
  ['f-first','f-last','f-company','f-title','f-email','f-phone','f-website','f-service','f-former','f-notes','f-lastcontact'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('f-cat').value=['all','favorites','companies'].indexOf(currentTab)>-1?'contacts':currentTab;
  toggleCatFields();buildTagSel([]);document.getElementById('modal-ov').classList.add('open');setTimeout(function(){document.getElementById('f-first').focus();},100);
}
function openEditModal(id){
  if(!canDo('canEdit'))return;var c=contacts.find(function(x){return x.id===id;});if(!c)return;editingId=id;
  document.getElementById('modal-title').textContent='Edit Contact';document.getElementById('del-btn').style.display=canDo('canDelete')?'inline-flex':'none';
  document.getElementById('f-first').value=c.first||'';document.getElementById('f-last').value=c.last||'';var eco=companyOfContact(c);document.getElementById('f-company').value=eco?eco.name:'';document.getElementById('f-title').value=c.title||'';document.getElementById('f-email').value=c.email||'';document.getElementById('f-phone').value=c.phone||'';document.getElementById('f-website').value=c.website||'';document.getElementById('f-cat').value=eco?eco.lifecycle:'network';document.getElementById('f-service').value=(eco&&eco.engagements[0])?eco.engagements[0].name:'';document.getElementById('f-former').value=eco?eco.notes:'';document.getElementById('f-lastcontact').value=c.lastContact||'';document.getElementById('f-notes').value=c.notes||'';
  toggleCatFields();buildTagSel(c.tags||[]);document.getElementById('modal-ov').classList.add('open');
}
function closeModal(){document.getElementById('modal-ov').classList.remove('open');editingId=null;}
function handleMoClick(e){if(e.target===document.getElementById('modal-ov'))closeModal();}
function saveContact(){
  var first=document.getElementById('f-first').value.trim(),last=document.getElementById('f-last').value.trim();
  if(!first&&!last){document.getElementById('f-first').focus();return;}
  var coName=document.getElementById('f-company').value.trim();
  var lc=document.getElementById('f-cat').value;
  var svcTxt=document.getElementById('f-service').value.trim();
  var noteTxt=document.getElementById('f-former').value.trim();
  // resolve (or create) the company, then apply the company-level fields to it
  var co=coName?ensureCompany(coName,lc):null;
  if(co){
    if(co.lifecycle!==lc)setLifecycle(co,lc,'set from contact form');
    if(svcTxt){
      if(co.engagements[0])co.engagements[0].name=svcTxt;
      else co.engagements.push(makeEngagement({name:svcTxt,status:lc==='active'?'active':'proposed'}));
    }
    if(noteTxt)co.notes=noteTxt;
    saveCompanies();
  }
  var data={first:first,last:last,companyId:co?co.id:null,
    role:lc==='network'?'network':'primary',
    title:document.getElementById('f-title').value.trim(),
    email:document.getElementById('f-email').value.trim(),
    phone:document.getElementById('f-phone').value.trim(),
    website:document.getElementById('f-website').value.trim(),
    lastContact:document.getElementById('f-lastcontact').value,
    tags:getSelTags(),notes:document.getElementById('f-notes').value.trim()};
  if(editingId){var idx=contacts.findIndex(function(c){return c.id===editingId;});if(idx>-1)Object.assign(contacts[idx],data);}
  else contacts.push({id:uid(),created:Date.now(),comments:[],...data});
  var actorName=(getUserDef(currentUser)||{}).displayName||currentUser;
  logAct({type:editingId?'edit':'add',ts:Date.now(),text:(editingId?'Edited':'Added')+' '+data.first+' '+data.last});
  if(!editingId){
    var newC=contacts[contacts.length-1];
    if(co&&co.intake&&!co.intake.graduated)feedIntake(co);
    else feedActivity('<strong>'+esc(actorName)+'</strong> added '+esc(data.first)+' '+esc(data.last)+(co?' \u2014 '+esc(co.name):''),newC.id);
  } else {
    feedActivity('<strong>'+esc(actorName)+'</strong> updated '+esc(data.first)+' '+esc(data.last),editingId);
  }
  ls.set(CK,contacts);closeModal();updateCounts();renderMain();renderStats();toast(editingId?'Updated.':'Added!');
  if(co)expandedCos.add(co.id);
}
function deleteContact(){if(!canDo('canDelete'))return;if(!confirm('Delete this contact?'))return;contacts=contacts.filter(function(c){return c.id!==editingId;});ls.set(CK,contacts);closeModal();updateCounts();renderMain();renderStats();toast('Deleted.');}
