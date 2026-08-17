
// ═══ USERS ═══════════════════════════════════════════════════════════════════
function getAllUsers(){
  var custom=ls.get(UK)||{};var prefs=ls.get(PK)||{};var merged={};
  Object.keys(BASE_USERS).forEach(function(k){
    var v=BASE_USERS[k];var up=prefs[k]||{};
    merged[k]={pass:up.pass||v.pass,role:v.role,defaultName:v.defaultName,avatarClass:v.avatarClass,displayName:up.displayName||v.defaultName,emoji:up.emoji||null,bio:up.bio||'',email:up.email||v.email||''};
  });
  Object.keys(custom).forEach(function(k){merged[k]=custom[k];});
  return merged;
}
function getUserDef(u){return getAllUsers()[u]||null;}
function canDo(a){var d=getUserDef(currentUser);if(!d)return false;return (ROLE_PERMS[d.role]||ROLE_PERMS.viewer)[a]||false;}
