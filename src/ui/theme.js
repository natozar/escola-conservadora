// ============================================================
// THEME
// ============================================================
const THEME_KEY='escola_theme';
function initTheme(){
  let saved=localStorage.getItem(THEME_KEY);
  if(!saved){
    saved=window.matchMedia&&window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';
    localStorage.setItem(THEME_KEY,saved)
  }
  document.documentElement.setAttribute('data-theme',saved);
  updateThemeUI(saved)
}
// Listen for system theme changes when no manual override
window.matchMedia&&window.matchMedia('(prefers-color-scheme:light)').addEventListener('change',e=>{
  if(!localStorage.getItem(THEME_KEY+'_manual')){
    const t=e.matches?'light':'dark';
    localStorage.setItem(THEME_KEY,t);
    document.documentElement.setAttribute('data-theme',t);
    updateThemeUI(t)
  }
});
function toggleTheme(){
  const cur=document.documentElement.getAttribute('data-theme')||'dark';
  const next=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem(THEME_KEY,next);
  localStorage.setItem(THEME_KEY+'_manual','1');
  updateThemeUI(next);
  document.querySelector('meta[name="theme-color"]').setAttribute('content',next==='dark'?'#0f1729':'#f5f3ef')
}
function updateThemeUI(t){
  document.getElementById('themeLabel').textContent=t==='dark'?'Modo Claro':'Modo Escuro';
  document.getElementById('themeSub').textContent=t==='dark'?'Ativar tema claro':'Ativar tema escuro'
}

// Attach to window
window.THEME_KEY=THEME_KEY;
window.initTheme=initTheme;
window.toggleTheme=toggleTheme;
window.updateThemeUI=updateThemeUI;
