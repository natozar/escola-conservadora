// ============================================================
// SAFE DOM HELPER — prevents "Cannot read properties of null"
// ============================================================
const _origById=document.getElementById.bind(document);
const _nullProxy=new Proxy(document.createElement('div'),{get(t,p){if(p==='__isNull')return true;const v=t[p];return typeof v==='function'?v.bind(t):v},set(t,p,v){return true}});
document.getElementById=function(id){return _origById(id)||_nullProxy};

// ============================================================
// iOS/SAFARI COMPATIBILITY
// ============================================================
// Detect private browsing (localStorage throws on iOS private mode)
(function(){
  try{var t='__ls_test__';localStorage.setItem(t,t);localStorage.removeItem(t);window._storageAvailable=true}
  catch(e){window._storageAvailable=false;console.warn('[iOS] Private mode detected — progress will NOT persist offline')}
})();
// Safe localStorage wrapper for iOS private mode
function _safeSetItem(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function _safeGetItem(k){try{return localStorage.getItem(k)}catch(e){return null}}

window._origById = _origById;
window._nullProxy = _nullProxy;
window._safeSetItem = _safeSetItem;
window._safeGetItem = _safeGetItem;

export { _origById, _nullProxy, _safeSetItem, _safeGetItem };
