
// ═══ FAVORITES ═══════════════════════════════════════════════════════════════
function getBins(){var p=ls.get(PK)||{};return(p[currentUser]||{}).bins||[{id:'fav-default',name:'Favorites',ids:[]}];}
function saveBins(b){var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};p[currentUser].bins=b;ls.set(PK,p);}
function getFavIds(){return getBins().reduce(function(a,b){return a.concat(b.ids);},[]);}
function isFav(id){return getFavIds().indexOf(id)>-1;}
function toggleFav(cid){
  var bins=getBins();
  if(getFavIds().indexOf(cid)>-1){bins.forEach(function(b){b.ids=b.ids.filter(function(x){return x!==cid;});});saveBins(bins);updateCounts();renderMain();toast('Removed from Favorites.');}
  else openBinAssign(cid);
}
function toggleFavFromDet(){if(!detailId)return;toggleFav(detailId);renderDetFavBtn();}
function renderDetFavBtn(){var btn=document.getElementById('det-fav-btn');if(!btn||!detailId)return;btn.classList.toggle('fav-on',isFav(detailId));}
var binAssignId=null;
function openBinAssign(cid){
  binAssignId=cid;var c=contacts.find(function(x){return x.id===cid;});var bins=getBins();
  document.getElementById('bin-assign-body').innerHTML='<p style="font-size:12px;color:var(--muted);margin-bottom:12px">Add <strong style="color:var(--text)">'+esc(c?c.first+' '+c.last:'Contact')+'</strong> to:</p>'+bins.map(function(b){return '<div class="bin-ai" onclick="addToBin(\''+b.id+'\')">&#x2B50; '+esc(b.name)+' <span style="margin-left:auto;font-size:10px;color:var(--muted)">'+b.ids.length+'</span></div>';}).join('')+'<div class="add-bin-row" style="margin-top:10px"><input class="add-bin-inp" type="text" id="bin-new-name" placeholder="New list\u2026"/><button class="btn-p" onclick="createBinAndAdd()">Create</button></div>';
  document.getElementById('bin-ov').classList.add('open');
}
function addToBin(bid){var bins=getBins();var b=bins.find(function(x){return x.id===bid;});if(b&&b.ids.indexOf(binAssignId)===-1)b.ids.push(binAssignId);saveBins(bins);closeBinAssign();updateCounts();renderMain();renderDetFavBtn();toast('Added!');}
function createBinAndAdd(){var name=document.getElementById('bin-new-name').value.trim();if(!name)return;var bins=getBins();bins.push({id:uid(),name:name,ids:[binAssignId]});saveBins(bins);closeBinAssign();updateCounts();renderMain();renderDetFavBtn();toast('Created "'+name+'"!');}
function closeBinAssign(){document.getElementById('bin-ov').classList.remove('open');binAssignId=null;}
function renderFavsRail(){
  var bins=getBins();
  document.getElementById('bins-rail').innerHTML=bins.map(function(b){var members=contacts.filter(function(c){return b.ids.indexOf(c.id)>-1;});return '<div class="bin-card" onclick="switchTab(\'favorites\');closeRail()"><div class="bin-card-hdr"><span class="bin-name">&#x2B50; '+esc(b.name)+'</span><span class="bin-cnt">'+b.ids.length+'</span></div><div class="bin-members">'+members.slice(0,5).map(function(c){return '<span class="bin-chip">'+esc(c.first)+' '+esc(c.last)+'</span>';}).join('')+(members.length>5?'<span class="bin-chip">+'+( members.length-5)+'</span>':'')+'</div></div>';}).join('');
}
function createBin(){var inp=document.getElementById('new-bin-inp');var name=inp.value.trim();if(!name)return;var bins=getBins();bins.push({id:uid(),name:name,ids:[]});saveBins(bins);inp.value='';renderFavsRail();updateCounts();toast('"'+name+'" created!');}
