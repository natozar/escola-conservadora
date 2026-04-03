// src/ui/sidebar.js — Disciplines as single link, modules in main area

// Build sidebar — just update discipline count
function buildSidebar(){
  var discs=new Set();
  window.M.forEach(function(m){discs.add(m.discipline||'economia')});
  var el=document.getElementById('discSubtitle');
  if(el)el.textContent=discs.size+' disciplinas';
}

// Navigate to Disciplines view — delegates to goAulasTab (shared grid)
function goDiscView(){
  if(typeof window.goAulasTab==='function'){window.goAulasTab();return}
  // Fallback if mobile.js not loaded yet
  window.hideAllViews();
  document.getElementById('vAulas').style.display='block';
  window.setNav('nDisc');
}

// Restore original dashboard (no-op — goDiscView no longer overwrites vDash)
function restoreDash(){}

// Legacy compat
function toggleDiscGroup(){goDiscView()}

window.buildSidebar=buildSidebar;
window.goDiscView=goDiscView;
window.restoreDash=restoreDash;
window.toggleDiscGroup=toggleDiscGroup;
