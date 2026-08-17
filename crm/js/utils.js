
// ═══ ICONS / UTILS ═══════════════════════════════════════════════════════════
function mailSvg(){return'<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x=".5" y="2.5" width="11" height="7" rx="1" stroke="#888"/><path d="M.5 3.5 6 7l5.5-3.5" stroke="#888"/></svg>';}
function phoneSvg(){return'<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 1h2.5L6 4 4.5 5c.5 1 1.5 2 2.5 2.5L8 6l3 1.5V10c-5.5.5-10-5-9-9Z" stroke="#888" stroke-linejoin="round"/></svg>';}
function calSvg(){return'<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x=".5" y="1.5" width="11" height="9" rx="1" stroke="#888"/><path d="M4 .5v2M8 .5v2M.5 5h11" stroke="#888" stroke-linecap="round"/></svg>';}
function dotsSvg(){return'\u22EF';}
function editSvg(){return'<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M8 2l2 2-6 6H2v-2l6-6Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';}
function copySvg(){return'<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="4" y=".5" width="7.5" height="7.5" rx="1" stroke="currentColor"/><path d="M.5 4v7.5h7.5" stroke="currentColor" stroke-linecap="round"/></svg>';}
function shareSvg(){return'<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="9.5" cy="2.5" r="1.8" stroke="currentColor"/><circle cx="9.5" cy="9.5" r="1.8" stroke="currentColor"/><circle cx="2.5" cy="6" r="1.8" stroke="currentColor"/><path d="M4.2 7 8 8.7M8 3.3 4.2 5" stroke="currentColor" stroke-linecap="round"/></svg>';}
function bubSvg(){return'<svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x=".5" y=".5" width="11" height="8" rx="1.5" stroke="#888"/><path d="M3 11l2-3" stroke="#888" stroke-linecap="round"/></svg>';}
function ini(c){return((c.first||'?')[0]+(c.last||'?')[0]).toUpperCase();}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function esc2(s){return String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function fmt(ts){if(!ts)return'';var d=new Date(ts),now=new Date(),diff=(now-d)/1000;if(diff<60)return'just now';if(diff<3600)return Math.floor(diff/60)+'m ago';if(diff<86400)return Math.floor(diff/3600)+'h ago';return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function isGuest(){return getUserDef(currentUser)?getUserDef(currentUser).role==='viewer':false;}
function toast(msg){var t=document.getElementById('toast');document.getElementById('toast-msg').textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);}
function uid(){return Math.random().toString(36).slice(2)+Date.now().toString(36);}
var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(ts){var d=new Date(ts);return MONTHS[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();}
function checkSvg(c){return '<svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6.2l2.6 2.6L10 3" fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
function logAct(a){var p=ls.get(PK)||{};if(!p[currentUser])p[currentUser]={};if(!p[currentUser].activity)p[currentUser].activity=[];p[currentUser].activity.unshift(a);if(p[currentUser].activity.length>30)p[currentUser].activity=p[currentUser].activity.slice(0,30);ls.set(PK,p);}
