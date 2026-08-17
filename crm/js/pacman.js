
// ═══ PAC-MAN ═════════════════════════════════════════════════════════════════
var pmOpen=false,pmLoop=null,pmState='idle';
var PMC=20,PMR=10;
var PM_MAZE=[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,3,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,3,1],[1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],[1,0,0,0,0,1,1,0,2,2,2,2,0,1,1,0,0,0,0,1],[1,0,1,1,0,1,1,0,2,2,2,2,0,1,1,0,1,1,0,1],[1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],[1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],[1,3,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,3,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
var pmMaze,pmDots,pmScore,pmLives,pmPac,pmGhosts,pmNextDir,pmEn,pmEnT;
function pmReset(){pmMaze=PM_MAZE.map(function(r){return r.slice();});pmDots=0;for(var r=0;r<PMR;r++)for(var c=0;c<PMC;c++)if(pmMaze[r][c]===0||pmMaze[r][c]===3)pmDots++;pmPac={c:1,r:8,dc:1,dr:0,mouth:0,mDir:1,df:0};pmGhosts=[{c:9,r:4,dc:1,dr:0,color:'#ff6b8a',scared:false},{c:10,r:5,dc:-1,dr:0,color:'#67b3ff',scared:false}];pmNextDir={dc:1,dr:0};pmEn=false;pmEnT=0;}
function pmInit(){pmScore=0;pmLives=3;pmReset();pmDraw();pmHUD();}
function togglePM(){pmOpen=!pmOpen;var w=document.getElementById('pm-wrap'),t=document.getElementById('pm-teaser');if(!w||!t)return;w.classList.toggle('open',pmOpen);t.classList.toggle('open',pmOpen);if(pmOpen){setTimeout(function(){pmInit();var h=document.getElementById('pm-hi');if(h)h.textContent=localStorage.getItem('lo-pm-hi')||0;},40);}else pmStopLoop();}
function pmToggle(){if(pmState==='idle'||pmState==='over'){if(pmState==='over')pmInit();pmState='playing';var b=document.getElementById('pm-center');if(b)b.innerHTML='&#x23F8;';var m=document.getElementById('pm-msg');if(m)m.textContent='Arrow keys or d-pad';pmRunLoop();}else if(pmState==='playing'){pmState='idle';pmStopLoop();var b2=document.getElementById('pm-center');if(b2)b2.innerHTML='&#x25BA;';var m2=document.getElementById('pm-msg');if(m2)m2.textContent='Paused';}}
function pmDir(dc,dr){if(pmState==='idle'||pmState==='over')pmToggle();pmNextDir={dc:dc,dr:dr};}
function pmRunLoop(){pmStopLoop();var f=0;pmLoop=setInterval(function(){f++;pmTick(f);pmDraw();},100);}
function pmStopLoop(){if(pmLoop){clearInterval(pmLoop);pmLoop=null;}}
function pmCan(c,r,dc,dr){var nc=c+dc,nr=r+dr;if(nr<0||nr>=PMR||nc<0||nc>=PMC)return false;return pmMaze[nr][nc]!==1;}
function pmWrap(c,r){if(c<0)c=PMC-1;if(c>=PMC)c=0;if(r<0)r=PMR-1;if(r>=PMR)r=0;return{c:c,r:r};}
function pmTick(f){
  if(pmState!=='playing')return;
  if(pmEn){pmEnT--;if(pmEnT<=0){pmEn=false;pmGhosts.forEach(function(g){g.scared=false;});}}
  pmPac.mouth+=pmPac.mDir*18;if(pmPac.mouth>35||pmPac.mouth<0)pmPac.mDir*=-1;
  if(pmCan(pmPac.c,pmPac.r,pmNextDir.dc,pmNextDir.dr)){pmPac.dc=pmNextDir.dc;pmPac.dr=pmNextDir.dr;}
  if(pmCan(pmPac.c,pmPac.r,pmPac.dc,pmPac.dr)){pmPac.c+=pmPac.dc;pmPac.r+=pmPac.dr;var w=pmWrap(pmPac.c,pmPac.r);pmPac.c=w.c;pmPac.r=w.r;}
  var cell=pmMaze[pmPac.r][pmPac.c];
  if(cell===0){pmMaze[pmPac.r][pmPac.c]=2;pmScore+=10;pmDots--;}
  if(cell===3){pmMaze[pmPac.r][pmPac.c]=2;pmScore+=50;pmDots--;pmEn=true;pmEnT=30;pmGhosts.forEach(function(g){g.scared=true;});}
  pmHUD();
  if(pmDots<=0){pmState='idle';pmStopLoop();var m=document.getElementById('pm-msg');if(m)m.textContent='&#x1F389; Cleared! Press &#x25BA; to replay';pmCheckHi();return;}
  if(f%2===0){pmGhosts.forEach(function(g){var dirs=[{dc:1,dr:0},{dc:-1,dr:0},{dc:0,dr:1},{dc:0,dr:-1}];var valid=dirs.filter(function(d){return pmCan(g.c,g.r,d.dc,d.dr)&&!(d.dc===-g.dc&&d.dr===-g.dr);});if(!valid.length)return;var chosen;if(g.scared){chosen=valid[Math.floor(Math.random()*valid.length)];}else{var best=null,bd=9999;valid.forEach(function(d){var nc=g.c+d.dc,nr=g.r+d.dr,dist=Math.abs(nc-pmPac.c)+Math.abs(nr-pmPac.r);if(dist<bd){bd=dist;best=d;}});chosen=best||valid[0];}g.dc=chosen.dc;g.dr=chosen.dr;g.c+=g.dc;g.r+=g.dr;var w=pmWrap(g.c,g.r);g.c=w.c;g.r=w.r;});}
  pmGhosts.forEach(function(g){if(g.c===pmPac.c&&g.r===pmPac.r){if(g.scared){g.scared=false;g.c=9;g.r=4;pmScore+=200;}else pmDie();}});
}
function pmDie(){pmState='dead';pmStopLoop();pmLives--;pmHUD();var df=0;var da=setInterval(function(){df++;pmPac.df=df;pmDraw();if(df>8){clearInterval(da);if(pmLives<=0){pmState='over';var m=document.getElementById('pm-msg');if(m)m.textContent='Game Over \u2014 press \u25BA';pmCheckHi();}else{pmReset();pmState='playing';pmRunLoop();}}},80);}
function pmCheckHi(){var hi=parseInt(localStorage.getItem('lo-pm-hi')||0);if(pmScore>hi){localStorage.setItem('lo-pm-hi',pmScore);var h=document.getElementById('pm-hi');if(h){h.textContent=pmScore;h.style.color='var(--yellow)';}}}
function pmHUD(){var s=document.getElementById('pm-score');if(s)s.textContent=pmScore;var l=document.getElementById('pm-lives');if(l)l.textContent='\u15E4 '.repeat(Math.max(0,pmLives)).trim();}
function pmDraw(){
  var canvas=document.getElementById('pm-canvas');if(!canvas)return;
  var W=canvas.offsetWidth||280;var sc=W/400;canvas.width=W;canvas.height=200*sc;
  var ctx=canvas.getContext('2d');var cs=20*sc;
  ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(var r=0;r<PMR;r++)for(var c=0;c<PMC;c++){var cell=pmMaze[r][c];var x=c*cs,y=r*cs;if(cell===1){ctx.fillStyle='#1a1a2e';ctx.fillRect(x,y,cs,cs);ctx.strokeStyle='#2a2a5a';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,cs-1,cs-1);}else if(cell===0){ctx.fillStyle='#FF6666';ctx.beginPath();ctx.arc(x+cs/2,y+cs/2,cs*.1,0,Math.PI*2);ctx.fill();}else if(cell===3){ctx.fillStyle='#FFCF5A';ctx.beginPath();ctx.arc(x+cs/2,y+cs/2,cs*.22,0,Math.PI*2);ctx.fill();}}
  if(pmState==='dead'&&pmPac.df>0){var dfv=pmPac.df,xp=pmPac.c*cs+cs/2,yp=pmPac.r*cs+cs/2,rad=cs*.42,sa=(dfv/8)*Math.PI;ctx.fillStyle='#FFCF5A';ctx.beginPath();ctx.moveTo(xp,yp);ctx.arc(xp,yp,rad,sa,Math.PI*2-sa);ctx.closePath();ctx.fill();return;}
  var xp2=pmPac.c*cs+cs/2,yp2=pmPac.r*cs+cs/2,rad2=cs*.42,a=pmPac.mouth*(Math.PI/180),dir=Math.atan2(pmPac.dr,pmPac.dc);ctx.fillStyle='#FFCF5A';ctx.beginPath();ctx.moveTo(xp2,yp2);ctx.arc(xp2,yp2,rad2,dir+a,dir+Math.PI*2-a);ctx.closePath();ctx.fill();
  pmGhosts.forEach(function(g){var gx=g.c*cs,gy=g.r*cs,gr=cs*.42,gcx=gx+cs/2,gcy=gy+cs*.48;ctx.fillStyle=g.scared?(pmEnT<10&&Math.floor(Date.now()/200)%2===0?'#fff':'#4444ff'):g.color;ctx.beginPath();ctx.arc(gcx,gcy,gr,Math.PI,0);var sw=(gr*2)/4;for(var i=0;i<4;i++){var bx=gcx-gr+i*sw;if(i%2===0)ctx.quadraticCurveTo(bx+sw/2,gcy+gr*.7,bx+sw,gcy+gr*.2);else ctx.quadraticCurveTo(bx+sw/2,gcy-gr*.1,bx+sw,gcy+gr*.2);}ctx.closePath();ctx.fill();});
  if(pmState==='over'){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#FF6666';ctx.font='bold '+(15*sc)+'px monospace';ctx.textAlign='center';ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-7*sc);ctx.fillStyle='#FFCF5A';ctx.font=(11*sc)+'px monospace';ctx.fillText('Score: '+pmScore,canvas.width/2,canvas.height/2+9*sc);}
}
document.addEventListener('keydown',function(e){
  if(!pmOpen)return;var map={ArrowLeft:{dc:-1,dr:0},ArrowRight:{dc:1,dr:0},ArrowUp:{dc:0,dr:-1},ArrowDown:{dc:0,dr:1}};
  if(map[e.key]){e.preventDefault();pmDir(map[e.key].dc,map[e.key].dr);}
  if(e.key===' ')pmToggle();
});
