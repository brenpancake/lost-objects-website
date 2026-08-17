
// ═══ WEBSITE INQUIRY RENDERER ════════════════════════════════════════════════
function renderInquiry(c){
  // questionnaire answers live on the company's intake sub-object now
  var ico=companyOfContact(c);var inq=(ico&&ico.intake)?ico.intake.answers:null;if(!inq)return '';
  var h='<div class="det-slbl" style="color:var(--pink)">&#x1F4E8; Website Inquiry</div>';
  h+='<div class="det-inq" style="background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.7;">';
  h+='<div style="font-size:10px;color:var(--muted);margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase;">'+esc(inq.formType||(ico.intake.formType||'Inquiry'))+' &middot; '+new Date(inq.submitted||ico.intake.receivedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+'</div>';
  if(inq.presence)h+='<div><strong style="color:var(--muted)">Social Presence:</strong> '+esc(inq.presence)+'</div>';
  if(inq.challenges&&inq.challenges.length)h+='<div><strong style="color:var(--muted)">Challenges:</strong> '+esc(inq.challenges.join(', '))+'</div>';
  if(inq.platforms&&inq.platforms.length)h+='<div><strong style="color:var(--muted)">Platforms:</strong> '+esc(inq.platforms.join(', '))+'</div>';
  if(inq.serviceInterest)h+='<div><strong style="color:var(--muted)">Service Interest:</strong> '+esc(inq.serviceInterest)+'</div>';
  if(inq.budget)h+='<div><strong style="color:var(--muted)">Budget:</strong> '+esc(inq.budget)+'</div>';
  if(inq.goal)h+='<div style="margin-top:6px"><strong style="color:var(--muted)">Goal:</strong> '+esc(inq.goal)+'</div>';
  if(inq.igHandle)h+='<div><strong style="color:var(--muted)">Instagram:</strong> '+esc(inq.igHandle)+'</div>';
  if(inq.igUrl)h+='<div><strong style="color:var(--muted)">IG URL:</strong> '+esc(inq.igUrl)+'</div>';
  if(inq.otherHandle)h+='<div><strong style="color:var(--muted)">Other Handle:</strong> '+esc(inq.otherHandle)+'</div>';
  if(inq.websiteUrl)h+='<div><strong style="color:var(--muted)">Website:</strong> '+esc(inq.websiteUrl)+'</div>';
  if(inq.message)h+='<div style="margin-top:6px"><strong style="color:var(--muted)">Message:</strong><br>'+esc(inq.message).replace(/\n/g,'<br>')+'</div>';
  if(inq.additional)h+='<div style="margin-top:6px"><strong style="color:var(--muted)">Additional:</strong><br>'+esc(inq.additional).replace(/\n/g,'<br>')+'</div>';
  h+='</div>';
  return h;
}

// ═══ DETAIL PANEL ════════════════════════════════════════════════════════════
function openDet(id){
  var c=contacts.find(function(x){return x.id===id;});if(!c)return;detailId=id;
  var labels={contacts:'General Contact',active:'Active Client',prospects:'Prospect',former:'Former Client'};
  var dco=companyOfContact(c);
  document.getElementById('det-cat-lbl').textContent=dco?(LIFECYCLE_LBL[dco.lifecycle]||''):'Contact';
  detailCompanyId=null;
  var dfb=document.getElementById('det-fav-btn');if(dfb)dfb.style.display='';
  renderDetBody(c);renderDetFavBtn();document.getElementById('det-ov').classList.add('open');
}
function renderDetBody(c){
  var tags=(c.tags||[]).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join(' ');
  var co=companyOfContact(c);
  var avBg=co?companyColor(co):(AV_BG[c.role]||'#444');
  var act=co?activeEngagements(co):[];
  var badge='';
  if(co&&co.lifecycle==='active'&&act.length)badge='<div class="svc-badge" style="margin-bottom:7px"><span class="pls"></span>'+esc(act[0].name)+'</div>';
  else if(co&&(co.lifecycle==='former'||co.lifecycle==='dormant'))badge='<div class="old-badge" style="margin-bottom:7px">'+LIFECYCLE_LBL[co.lifecycle]+((co.engagements||[]).length?' &mdash; '+esc(co.engagements[0].name):'')+'</div>';
  var reqDelBtn=(canDo('canEdit')&&!canDo('canDelete'))?'<button class="req-del-btn" onclick="requestDeletion(\''+c.id+'\')">&#x1F5D1; Request Deletion</button>':'';
  var editBtns=canDo('canEdit')?'<div class="det-acts"><button class="db" onclick="closeDet();openEditModal(\''+c.id+'\')">'+editSvg()+' Edit</button><button class="db" onclick="copyContactTxt(\''+c.id+'\')">'+copySvg()+' Copy</button><button class="db" onclick="openShare(\''+c.id+'\')">'+shareSvg()+' Share</button></div>'+reqDelBtn:'<div class="det-acts"><button class="db" onclick="copyContactTxt(\''+c.id+'\')">'+copySvg()+' Copy Info</button></div>';
  document.getElementById('det-body').innerHTML=''
    +'<div class="det-av" style="background:'+avBg+'">'+ini(c)+'</div>'
    +'<div class="det-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
    +'<div class="det-co">'+esc(c.title||'')+(co?(c.title?' &middot; ':'')+'<a href="#" onclick="event.preventDefault();openCompanyDet(\''+co.id+'\')">'+esc(co.name)+'</a>':'')+'</div>'
    +badge
    +(c.lastContact?'<div class="lc">'+calSvg()+' Last contact: '+c.lastContact+'</div>':'')
    +editBtns
    +((c.email||c.phone||c.website)?'<div class="det-slbl">Contact Info</div>'+(c.email?'<div class="det-info-row"><span>&#x2709;</span>'+esc(c.email)+'</div>':'')+(c.phone?'<div class="det-info-row"><span>&#x260E;</span>'+esc(c.phone)+'</div>':'')+(c.website?'<div class="det-info-row"><span>&#x1F517;</span>'+esc(c.website)+'</div>':''):'')
    +(tags?'<div class="det-slbl">Tags</div><div class="cc-tags" style="margin-bottom:0">'+tags+'</div>':'')
    +renderInquiry(c)
    +(c.notes?'<div class="det-slbl">Notes</div><div class="det-notes">'+esc(c.notes).replace(/\n/g,'<br>')+'</div>':'')
    +(canDo('canComment')?'<div class="cmts"><div class="det-slbl">Comments</div><div id="cmts-list">'+renderCmts(c)+'</div><div class="ci-wrap"><div class="ment-pop" id="ment-pop"></div><textarea id="cmt-inp" placeholder="Comment\u2026 type @ to mention" rows="1" oninput="handleCmtInput(this)" onkeydown="handleCmtKD(event)"></textarea><button class="ci-send" onclick="submitCmt()"><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7.5 2l4 4-4 4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="ci-hint">@ to mention &middot; Enter to post</div></div>':'');
}
function renderCmts(c){
  if(!(c.comments||[]).length)return'<div style="font-size:12px;color:var(--muted);margin-bottom:9px">No comments yet.</div>';
  return c.comments.map(function(cm,i){
    var uk=(cm.author||'').toLowerCase();var ud=getUserDef(uk);var em=ud?ud.emoji:null;
    var avH=em?'<div class="cmt-av" style="background:#222;font-size:13px">'+em+'</div>':'<div class="cmt-av ti '+(uk==='kyra'?'kyra':uk==='guest'?'guest':'')+'">'+cm.author[0].toUpperCase()+'</div>';
    var liked=(cm.likes||[]).indexOf(currentUser)>-1;var lc=(cm.likes||[]).length;
    return '<div class="cmt">'+avH+'<div class="cmt-body"><div class="cmt-meta"><span class="cmt-author">'+esc(cm.author)+'</span><span class="cmt-time">'+fmt(cm.ts)+'</span></div><div class="cmt-text">'+highlightMentions(cm.text)+'</div><div class="cmt-likes '+(liked?'liked':'')+'" onclick="toggleLike(\''+c.id+'\','+i+')">'+(liked?'&#x2665;':'&#x2661;')+' '+(lc?lc+' ':'')+'Like'+(lc===1?'':'s')+'</div></div></div>';
  }).join('');
}

// ═══ COMPANY DETAIL ══════════════════════════════════════════════════════════
// Companies carry lifecycle, so a company needs somewhere to be read and moved.
// Reuses the contact detail panel shell.
var detailCompanyId=null;
function openCompanyDet(id){
  var co=getCompany(id);if(!co)return;
  detailCompanyId=id;detailId=null;
  document.getElementById('det-cat-lbl').textContent=LIFECYCLE_LBL[co.lifecycle]||'Company';
  var fb=document.getElementById('det-fav-btn');if(fb)fb.style.display='none';
  renderCompanyDetBody(co);
  document.getElementById('det-ov').classList.add('open');
}
function renderCompanyDetBody(co){
  var col=companyColor(co);
  var members=contactsOfCompany(co.id).filter(function(c){return!c.deletion_requested;});
  var owner=co.owner?((getUserDef(co.owner)||{}).displayName||co.owner):null;
  var tags=(co.tags||[]).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join(' ');

  var eng=(co.engagements||[]).map(function(e){
    return '<div class="det-info-row"><span class="eng-dot eng-'+e.status+'"></span>'+esc(e.name)
      +' <span>'+esc(e.status)+(e.price?' \u00B7 '+esc(e.price):'')+'</span></div>';
  }).join('')||'<div class="det-info-row"><span>No engagements yet</span></div>';

  // Intake origin — kept forever, marked graduated once onboarding completes.
  var ik=co.intake?('<div class="det-slbl">Intake origin</div>'
    +'<div class="det-info-row"><span>Stage</span>'+cap(co.intake.stage)
      +(co.intake.graduated?' <span class="lc-pill lc-active" style="margin-left:6px">Graduated</span>':'')+'</div>'
    +'<div class="det-info-row"><span>Lane</span>'+(INTAKE_LANE_LBL[co.intake.lane]||co.intake.lane)+'</div>'
    +'<div class="det-info-row"><span>Source</span>'+esc(co.intake.source)+(co.intake.formType?' \u00B7 '+esc(co.intake.formType):'')+'</div>'
    +'<div class="det-info-row"><span>Received</span>'+fmtDate(co.intake.receivedAt)+'</div>'
    +(co.intake.graduatedAt?'<div class="det-info-row"><span>Graduated</span>'+fmtDate(co.intake.graduatedAt)+'</div>':'')
    +(co.intake.message?'<div class="ix-msg" style="margin:10px 0">'+esc(co.intake.message)+'</div>':'')):'';

  var lcBtns=canDo('canEdit')?('<div class="det-slbl">Move lifecycle</div><div class="ix-btnrow">'
    +LIFECYCLE.map(function(s){return '<button class="ix-btn'+(co.lifecycle===s?' on':'')+'" onclick="moveLifecycle(\''+co.id+'\',\''+s+'\')">'+LIFECYCLE_LBL[s]+'</button>';}).join('')
    +'</div>'):'';

  var people=members.length?members.map(function(c){
    return '<div class="dash-row" onclick="openDet(\''+c.id+'\')">'
      +'<div class="dr-av" style="background:'+col+'">'+ini(c)+'</div>'
      +'<div class="dr-body"><div class="dr-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
      +'<div class="dr-meta">'+esc(c.title||'')+(c.role?' \u00B7 '+esc(c.role):'')+'</div></div></div>';
  }).join(''):'<div class="det-info-row"><span>No contacts yet</span></div>';

  var cmts=commentsOfCompany(co.id);
  var cmtHTML=cmts.length?cmts.map(function(x){
    return '<div class="cmt"><div class="cmt-av ti">'+esc((x.comment.author||'?')[0].toUpperCase())+'</div>'
      +'<div class="cmt-body"><div class="cmt-meta"><span class="cmt-author">'+esc(x.comment.author)+'</span>'
      +'<span class="cmt-time">'+fmt(x.comment.ts)+'</span><span class="cmt-time">on '+esc(x.contactName)+'</span></div>'
      +'<div class="cmt-text">'+highlightMentions(x.comment.text)+'</div></div></div>';
  }).join(''):'<div style="font-size:12px;color:var(--muted)">No comments yet.</div>';

  var reqDel=(canDo('canEdit')&&!canDo('canDelete'))?'<button class="req-del-btn" onclick="requestCompanyDeletion(\''+co.id+'\')">&#x1F5D1; Request Deletion</button>':'';
  var del=canDo('canDelete')?'<button class="req-del-btn" onclick="requestCompanyDeletion(\''+co.id+'\')">&#x1F5D1; Move to Trash</button>':'';

  document.getElementById('det-body').innerHTML=''
    +'<div class="det-av" style="background:'+col+'">'+esc(co.name.slice(0,2).toUpperCase())+'</div>'
    +'<div class="det-name">'+esc(co.name)+(co.isSolo?' <span class="solo-flag">solo</span>':'')+'</div>'
    +'<div class="det-co"><span class="lc-pill lc-'+co.lifecycle+'">'+LIFECYCLE_LBL[co.lifecycle]+'</span>'
      +(owner?' &nbsp;Owner: <strong>'+esc(owner)+'</strong>':'')+'</div>'
    +((co.handle||co.website)?'<div class="lc">'+esc(co.handle||co.website)+'</div>':'')
    +(co.lastContact?'<div class="lc">'+calSvg()+' Last contact: '+esc(co.lastContact)+'</div>':'')
    +'<div class="det-slbl">Engagements</div>'+eng
    +ik
    +(tags?'<div class="det-slbl">Tags</div><div class="cc-tags" style="margin-bottom:0">'+tags+'</div>':'')
    +(co.notes?'<div class="det-slbl">Notes</div><div class="det-notes">'+esc(co.notes)+'</div>':'')
    +'<div class="det-slbl">Contacts ('+members.length+')</div>'+people
    +lcBtns
    +'<div class="cmts"><div class="det-slbl">Comments ('+cmts.length+')</div>'+cmtHTML+'</div>'
    +(reqDel||del);
}
function moveLifecycle(id,next){
  var co=getCompany(id);if(!co||!canDo('canEdit'))return;
  if(setLifecycle(co,next,'set from company detail')){
    var def=getUserDef(currentUser);
    feedActivity('<strong>'+esc(def?def.displayName:currentUser)+'</strong> moved '+esc(co.name)+' to '+LIFECYCLE_LBL[next]);
    toast(co.name+' \u2192 '+LIFECYCLE_LBL[next]);
  }
  renderCompanyDetBody(co);updateCounts();renderMain();renderStats();
}
