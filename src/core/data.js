// ============================================================
// COURSE DATA — lazy-loaded: index (66KB) on boot, full content per module on demand
// ============================================================
// M lives on window so all modules share the same reference
window.M = window.M || [];
const _modCache = {};

async function loadLessons(){
  try{
    const r=await fetch('./lessons/index.json');
    if(!r.ok)throw new Error(r.status);
    const data=await r.json();
    window.M.length=0; data.forEach(m=>window.M.push(m));
    window.M.forEach(m=>{m._loaded=false});
  }catch(e){
    console.warn('[Lessons] Index fetch failed, trying full fallback...',e.message);
    try{
      const r2=await fetch('./lessons.json');
      if(r2.ok){const data=await r2.json();window.M.length=0;data.forEach(m=>window.M.push(m));window.M.forEach(m=>{m._loaded=true});return true}
    }catch(e2){}
    try{
      const c=await caches.match('./lessons.json');
      if(c){const data=await c.json();window.M.length=0;data.forEach(m=>window.M.push(m));window.M.forEach(m=>{m._loaded=true});return true}
      const c2=await caches.match('./lessons/index.json');
      if(c2){const data=await c2.json();window.M.length=0;data.forEach(m=>window.M.push(m));window.M.forEach(m=>{m._loaded=false})}
    }catch(e3){console.error('[Lessons] All sources failed:',e3.message)}
  }
  if(window.M.length===0){
    document.getElementById('errorScreen').style.display='flex';
    const retryBtn=document.getElementById('errorScreen').querySelector('button');
    if(retryBtn){
      retryBtn.onclick=async function(){
        this.textContent='Carregando...';
        this.disabled=true;
        const ok=await loadLessons();
        if(ok){document.getElementById('errorScreen').style.display='none';location.reload()}
        else{this.textContent='Recarregar';this.disabled=false}
      };
    }
    return false;
  }
  return true;
}

async function loadFullModule(i){
  const M=window.M;
  if(!M[i])return false;
  if(M[i]._loaded)return true;
  if(_modCache[i]){M[i]=_modCache[i];return true}
  try{
    const r=await fetch('./lessons/mod-'+i+'.json');
    if(!r.ok)throw new Error(r.status);
    const full=await r.json();
    full._loaded=true;
    M[i]=full;
    _modCache[i]=full;
    return true;
  }catch(e){
    console.warn('[Lessons] Module '+i+' fetch failed, trying cache...',e.message);
    try{
      const c=await caches.match('./lessons/mod-'+i+'.json');
      if(c){const full=await c.json();full._loaded=true;M[i]=full;_modCache[i]=full;return true}
    }catch(e2){}
    try{
      const c=await caches.match('./lessons.json');
      if(c){const all=await c.json();if(all[i]){all[i]._loaded=true;M[i]=all[i];_modCache[i]=all[i];return true}}
    }catch(e3){}
    return false;
  }
}

function preloadModules(){
  const M=window.M;
  M.forEach((_,i)=>{
    if(!M[i]._loaded)setTimeout(()=>loadFullModule(i),1000+i*200);
  });
}

window._modCache = _modCache;
window.loadLessons = loadLessons;
window.loadFullModule = loadFullModule;
window.preloadModules = preloadModules;

export { _modCache, loadLessons, loadFullModule, preloadModules };
