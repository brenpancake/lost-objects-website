
// ═══ STORAGE ═════════════════════════════════════════════════════════════════
var ls={
  get:function(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set:function(k,v){localStorage.setItem(k,JSON.stringify(v));}
};
var contacts=ls.get(CK)||[];

function getCoData(){return ls.get(COK)||{};}
function saveCoData(d){ls.set(COK,d);}
function autoColor(name){var h=0;for(var i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))%CO_COLORS.length;return CO_COLORS[h];}
function getCoColor(name){var d=getCoData();if(!d[name])d[name]={color:autoColor(name),notes:''};return d[name].color;}
function setCoColor(name,color){var d=getCoData();if(!d[name])d[name]={color:color,notes:''};else d[name].color=color;saveCoData(d);}
function getCoNotes(name){var d=getCoData();return(d[name]||{}).notes||'';}
function setCoNotes(name,notes){var d=getCoData();if(!d[name])d[name]={color:autoColor(name),notes:notes};else d[name].notes=notes;saveCoData(d);}
