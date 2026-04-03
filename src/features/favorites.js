// ============================================================
// FAVORITES — extracted from app.js lines 1184-1214
// ============================================================
const FAV_KEY='escola_favs';
function loadFavs(){try{return JSON.parse(localStorage.getItem(FAV_KEY))||[]}catch(e){return[]}}
function saveFavs(f){localStorage.setItem(FAV_KEY,JSON.stringify(f));if(typeof queueSync==='function')queueSync('favs',f)}
function toggleFav(){
  const k=`${window.S.cMod}-${window.S.cLes}`;let favs=loadFavs();
  const idx=favs.indexOf(k);
  if(idx>=0)favs.splice(idx,1);else favs.push(k);
  saveFavs(favs);updateFavBtn();window.toast(idx>=0?'Removido dos favoritos':'⭐ Adicionado aos favoritos!')
}
function updateFavBtn(){
  const k=`${window.S.cMod}-${window.S.cLes}`,favs=loadFavs(),is=favs.includes(k);
  const btn=document.getElementById('favBtn');
  btn.textContent=is?'★':'☆';btn.classList.toggle('faved',is)
}
function renderFavs(){
  const favs=loadFavs();
  if(!favs.length){document.getElementById('favSection').innerHTML='';return}
  let html='<div class="fav-section"><h3>⭐ Favoritos</h3><div class="fav-list">';
  favs.forEach(k=>{
    const [mi,li]=k.split('-').map(Number);
    if(!window.M[mi]||!window.M[mi].lessons[li])return;
    const m=window.M[mi],l=m.lessons[li];
    html+=`<div class="fav-item" onclick="openL(${mi},${li})"><div class="fav-item-icon">${m.icon}</div><div class="fav-item-info"><div class="fav-item-title">${l.title}</div><div class="fav-item-sub">${m.title} · Aula ${li+1}</div></div><button class="fav-item-remove" onclick="event.stopPropagation();removeFav('${k}')" title="Remover">✕</button></div>`
  });
  html+='</div></div>';
  document.getElementById('favSection').innerHTML=html
}
function removeFav(k){let favs=loadFavs();favs=favs.filter(f=>f!==k);saveFavs(favs);renderFavs()}

// Attach to window
window.loadFavs=loadFavs;
window.saveFavs=saveFavs;
window.toggleFav=toggleFav;
window.updateFavBtn=updateFavBtn;
window.renderFavs=renderFavs;
window.removeFav=removeFav;
