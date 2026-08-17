
// ── DASH EDIT POPOUT ────────────────────────────────────────────────────────
var dashEditId=null;
function openDashEdit(id){
  var c=contacts.find(function(x){return x.id===id;});if(!c)return;dashEditId=id;
  var dco=companyOfContact(c);
  var avBg=dco?companyColor(dco):(AV_BG[c.role]||'#444');
  document.getElementById('de-av').textContent=ini(c);document.getElementById('de-av').style.background=avBg;
  document.getElementById('de-name').textContent=c.first+' '+c.last;
  document.getElementById('de-co').textContent=(c.title?c.title+' \u00B7 ':'')+(dco?dco.name:'');
  var tags=(c.tags||[]).map(function(t){return '<span class="de-tag">'+(TAG_MAP[t]||t)+'</span>';}).join('');
  var h='';
  // Contact info
  if(c.email||c.phone||c.website){
    h+='<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:12px">';
    if(c.email)h+='<span>&#x2709; '+esc(c.email)+'</span>';
    if(c.phone)h+='<span>&#x260E; '+esc(c.phone)+'</span>';
    if(c.website)h+='<span>&#x1F517; '+esc(c.website)+'</span>';
    h+='</div>';
  }
  // Inquiry data
  var iqc=(dco&&dco.intake)?dco.intake.answers:null;
  if(iqc){
    var inq=iqc;
    h+='<div style="background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:8px 10px;font-size:11px;line-height:1.6">';
    h+='<div style="font-size:9px;color:var(--pink);font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">&#x1F4E8; '+esc(inq.formType||(dco.intake.formType)||'Inquiry')+'</div>';
    if(inq.presence)h+='<div><strong style="color:var(--muted)">Presence:</strong> '+esc(inq.presence)+'</div>';
    if(inq.serviceInterest)h+='<div><strong style="color:var(--muted)">Service:</strong> '+esc(inq.serviceInterest)+'</div>';
    if(inq.budget)h+='<div><strong style="color:var(--muted)">Budget:</strong> '+esc(inq.budget)+'</div>';
    if(inq.goal)h+='<div><strong style="color:var(--muted)">Goal:</strong> '+esc(inq.goal)+'</div>';
    if(inq.challenges&&inq.challenges.length)h+='<div><strong style="color:var(--muted)">Challenges:</strong> '+esc(inq.challenges.join(', '))+'</div>';
    if(inq.message)h+='<div><strong style="color:var(--muted)">Message:</strong> '+esc(inq.message)+'</div>';
    h+='</div>';
  }
  // Tags
  if(tags)h+='<div class="de-field"><span class="de-label">Tags</span><div class="de-tags">'+tags+'</div></div>';
  // Editable fields
  h+='<div class="de-row">';
  h+='<div class="de-field"><span class="de-label">Company lifecycle</span><div>'+(dco?'<span class="lc-pill lc-'+dco.lifecycle+'">'+LIFECYCLE_LBL[dco.lifecycle]+'</span> <a href="#" style="font-size:11px;color:var(--muted)" onclick="event.preventDefault();closeDashEdit();openCompanyDet(\''+dco.id+'\')">open company &#x2197;</a>':'<span style="font-size:12px;color:var(--muted)">No company</span>')+'</div></div>';
  h+='<div class="de-field"><label class="de-label">Last Contact</label><input type="date" class="de-input" id="de-lastcontact" value="'+(c.lastContact||'')+'"/></div>';
  h+='</div>';
  h+='<div class="de-row">';
  h+='<div class="de-field"><label class="de-label">Service</label><input type="text" class="de-input" id="de-service" value="'+esc(c.service||'')+'" placeholder="e.g. Marketing Retainer"/></div>';
  h+='<div class="de-field"><label class="de-label">Website / Social</label><input type="text" class="de-input" id="de-website" value="'+esc(c.website||'')+'" placeholder="@handle or URL"/></div>';
  h+='</div>';
  h+='<div class="de-field"><label class="de-label">Notes</label><textarea class="de-input" id="de-notes" rows="3">'+esc(c.notes||'')+'</textarea></div>';
  // Comments
  var cmts=(c.comments||[]);
  h+='<div class="de-field"><span class="de-label">Comments ('+cmts.length+')</span>';
  if(cmts.length){
    h+='<div style="max-height:150px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-top:4px">';
    cmts.slice(-5).forEach(function(cm){
      h+='<div style="font-size:11px;line-height:1.5;padding:6px 8px;background:var(--s2);border-radius:var(--r)"><strong style="color:var(--pink)">'+esc(cm.author)+'</strong> <span style="color:var(--muted);font-size:9px">'+fmt(cm.ts)+'</span><br>'+esc(cm.text)+'</div>';
    });
    h+='</div>';
  }
  if(canDo('canComment')){
    h+='<div style="display:flex;gap:6px;margin-top:4px"><textarea class="de-input" id="de-comment" rows="1" placeholder="Add a comment\u2026" style="min-height:32px"></textarea><button class="btn-p" style="padding:6px 10px;font-size:9px" onclick="submitDashComment()">Post</button></div>';
  }
  h+='</div>';
  document.getElementById('de-body').innerHTML=h;
  document.getElementById('de-ov').classList.add('open');
}
function closeDashEdit(){document.getElementById('de-ov').classList.remove('open');dashEditId=null;}
function saveDashEdit(){
  if(!dashEditId)return;var c=contacts.find(function(x){return x.id===dashEditId;});if(!c)return;
  c.lastContact=document.getElementById('de-lastcontact').value;
  c.service=document.getElementById('de-service').value.trim();
  c.website=document.getElementById('de-website').value.trim();
  c.notes=document.getElementById('de-notes').value.trim();
  ls.set(CK,contacts);
  var def=getUserDef(currentUser);
  feedActivity('<strong>'+esc(def?def.displayName:currentUser)+'</strong> updated '+esc(c.first)+' '+esc(c.last),c.id);
  closeDashEdit();updateCounts();
  if(currentTab==='feed')renderDashboard();else{renderMain();renderStats();}
  toast('Saved.');
}
function submitDashComment(){
  var inp=document.getElementById('de-comment');if(!inp)return;var text=inp.value.trim();if(!text)return;
  var c=contacts.find(function(x){return x.id===dashEditId;});if(!c)return;
  if(!c.comments)c.comments=[];
  var def=getUserDef(currentUser),auth=def?def.displayName:currentUser;
  c.comments.push({author:auth,text:text,ts:Date.now(),likes:[]});
  feedComment(c.id,auth,c.first+' '+c.last,text);
  ls.set(CK,contacts);openDashEdit(dashEditId);
}
