
// ═══ STORAGE ═════════════════════════════════════════════════════════════════
// The name-keyed company store (lo-companies-v1) is gone: companies are real
// records now and carry their own colour and notes, keyed by id.
var ls={
  get:function(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set:function(k,v){localStorage.setItem(k,JSON.stringify(v));}
};
var contacts=ls.get(CK)||[];
