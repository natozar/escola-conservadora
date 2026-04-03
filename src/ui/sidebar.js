// src/ui/sidebar.js — extracted from app.js lines 160-201
// Build sidebar navigation dynamically from M — grouped accordion by discipline

function buildSidebar(){
  const nav=document.getElementById('modNav');
  if(!nav)return;
  let html='';
  const grouped={};const order=[];
  window.M.forEach((m,i)=>{
    const disc=m.discipline||'economia';
    if(!grouped[disc]){grouped[disc]=[];order.push(disc)}
    grouped[disc].push({mod:m,idx:i});
  });
  order.forEach(disc=>{
    const d=window.DISCIPLINES[disc]||{label:disc,icon:'📚'};
    const mods=grouped[disc];
    const totalL=mods.reduce((s,x)=>s+x.mod.lessons.length,0);
    const doneL=mods.reduce((s,x)=>s+x.mod.lessons.filter((_,li)=>window.S.done[`${x.idx}-${li}`]).length,0);
    const pct=totalL?Math.round(doneL/totalL*100):0;
    const clr=window.getModColor(mods[0].mod.color||'sage');
    // Single-module discipline: show flat item (no accordion)
    if(mods.length===1){
      const x=mods[0],c=x.mod.color||'sage';
      html+=`<div class="ni" onclick="goMod(${x.idx})" id="nM${x.idx}" role="button" tabindex="0" onkeydown="if(event.key==='Enter')goMod(${x.idx})"><div class="ni-icon" style="background:${window.getModColorMuted(c)};color:${window.getModColor(c)}">${d.icon}</div><div><div class="ni-txt">${d.label}</div><div class="ni-sub">${x.mod.lessons.length} aulas · ${pct}%</div><div class="ni-prog"><div class="ni-prog-bar" style="width:${pct}%;background:${clr}"></div></div></div></div>`;
    } else {
      // Multi-module: accordion
      html+=`<div class="disc-group" id="dg-${disc}"><div class="disc-group-head" onclick="toggleDiscGroup('${disc}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')toggleDiscGroup('${disc}')"><span style="font-size:.95rem">${d.icon}</span><span style="font-size:.8rem;font-weight:600">${d.label}</span><span class="disc-count">${mods.length}</span><div class="disc-prog"><div class="disc-prog-fill" style="width:${pct}%;background:${clr}"></div></div><span class="disc-arrow" id="dga-${disc}">▸</span></div><div class="disc-group-body" id="dgb-${disc}">`;
      mods.forEach(x=>{
        const c=x.mod.color||'sage';
        html+=`<div class="ni" onclick="goMod(${x.idx})" id="nM${x.idx}" role="button" tabindex="0" onkeydown="if(event.key==='Enter')goMod(${x.idx})"><div class="ni-icon" style="background:${window.getModColorMuted(c)};color:${window.getModColor(c)}">${x.mod.icon}</div><div><div class="ni-txt">${x.mod.title}</div><div class="ni-sub">${x.mod.lessons.length} aulas</div></div></div>`;
      });
      html+=`</div></div>`;
    }
  });
  nav.innerHTML=html;
}
function toggleDiscGroup(disc){
  const g=document.getElementById('dg-'+disc);
  const a=document.getElementById('dga-'+disc);
  if(!g)return;
  g.classList.toggle('open');
  if(a)a.textContent=g.classList.contains('open')?'▾':'▸';
}

window.buildSidebar=buildSidebar;
window.toggleDiscGroup=toggleDiscGroup;
