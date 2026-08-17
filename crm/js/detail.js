
// ═══ WEBSITE INQUIRY RENDERER ════════════════════════════════════════════════
function renderInquiry(c){
  var inq=c.inquiry;if(!inq)return '';
  var h='<div class="det-slbl" style="color:var(--pink)">&#x1F4E8; Website Inquiry</div>';
  h+='<div class="det-inq" style="background:var(--s2);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.7;">';
  h+='<div style="font-size:10px;color:var(--muted);margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase;">'+esc(inq.formType)+' &middot; '+new Date(inq.submitted).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+'</div>';
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
  document.getElementById('det-cat-lbl').textContent=labels[c.cat]||'';
  renderDetBody(c);renderDetFavBtn();document.getElementById('det-ov').classList.add('open');
}
function renderDetBody(c){
  var tags=(c.tags||[]).map(function(t){return '<span class="tag tag-'+t+'">'+(TAG_MAP[t]||t)+'</span>';}).join(' ');
  var coColor=c.company?getCoColor(c.company):null;var avBg=coColor||AV_BG[c.cat]||'#444';
  var badge='';
  if(c.cat==='active'&&c.service)badge='<div class="svc-badge" style="margin-bottom:7px"><span class="pls"></span>'+esc(c.service)+'</div>';
  if(c.cat==='former')badge='<div class="old-badge" style="margin-bottom:7px">Former &mdash; '+esc(c.formerReason||'Inactive')+'</div>';
  var reqDelBtn=(canDo('canEdit')&&!canDo('canDelete'))?'<button class="req-del-btn" onclick="requestDeletion(\''+c.id+'\')">&#x1F5D1; Request Deletion</button>':'';
  var editBtns=canDo('canEdit')?'<div class="det-acts"><button class="db" onclick="closeDet();openEditModal(\''+c.id+'\')">'+editSvg()+' Edit</button><button class="db" onclick="copyContactTxt(\''+c.id+'\')">'+copySvg()+' Copy</button><button class="db" onclick="openShare(\''+c.id+'\')">'+shareSvg()+' Share</button></div>'+reqDelBtn:'<div class="det-acts"><button class="db" onclick="copyContactTxt(\''+c.id+'\')">'+copySvg()+' Copy Info</button></div>';
  document.getElementById('det-body').innerHTML=''
    +'<div class="det-av" style="background:'+avBg+'">'+ini(c)+'</div>'
    +'<div class="det-name">'+esc(c.first)+' '+esc(c.last)+'</div>'
    +'<div class="det-co">'+esc(c.title?c.title+' &middot; '+c.company:c.company||'')+'</div>'
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
