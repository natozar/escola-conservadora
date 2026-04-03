// ============================================================
// SPACED REPETITION (LEITNER SYSTEM)
// Extracted from app.js
// ============================================================
const SPACED_KEY='escola_spaced';
function loadSpaced(){try{return JSON.parse(localStorage.getItem(SPACED_KEY))||{}}catch(e){return{}}}
function saveSpaced(d){localStorage.setItem(SPACED_KEY,JSON.stringify(d))}
function initSpaced(){
  const data=loadSpaced();let changed=false;
  GLOSSARY.forEach(g=>{
    if(!data[g.term]){data[g.term]={box:1,next:Date.now(),reviews:0};changed=true}
  });
  if(changed)saveSpaced(data);return data
}
function goSpaced(){
  window.hideAllViews();window.setNav('nSpaced');
  document.getElementById('vSpaced').classList.add('on');
  const data=initSpaced();
  const now=Date.now();
  const due=Object.entries(data).filter(([_,v])=>v.next<=now);
  const byBox=[0,0,0,0,0];
  Object.values(data).forEach(v=>{byBox[Math.min(v.box-1,4)]++});
  document.getElementById('spacedStats').innerHTML=`
    <div class="sr-stat"><div class="sr-stat-val" style="color:var(--coral)">${due.length}</div><div class="sr-stat-lbl">Para Revisar</div></div>
    <div class="sr-stat"><div class="sr-stat-val" style="color:var(--sage)">${byBox[3]+byBox[4]}</div><div class="sr-stat-lbl">Dominados</div></div>
    <div class="sr-stat"><div class="sr-stat-val">${Object.keys(data).length}</div><div class="sr-stat-lbl">Total</div></div>`;
  if(due.length>0){
    renderSpacedReview(due[0][0],data)
  }else{
    let html='<p style="text-align:center;color:var(--sage);font-weight:600;margin:1.5rem 0">✓ Nenhum termo para revisar agora!</p>';
    html+='<h3 style="font-family:\'DM Sans\',sans-serif;font-size:.85rem;font-weight:600;color:var(--text-muted);margin-bottom:.75rem">Todos os Termos</h3>';
    Object.entries(data).sort((a,b)=>a[1].box-b[1].box).forEach(([term,v])=>{
      const intervals=['','Hoje','Amanhã','3 dias','7 dias','14 dias'];
      html+=`<div class="sr-card"><span class="sr-box sr-box-${Math.min(v.box,5)}">Caixa ${v.box}</span><span class="sr-term">${term}</span><span class="sr-due">${intervals[Math.min(v.box,5)]||'Dominado'}</span></div>`
    });
    document.getElementById('spacedContent').innerHTML=html
  }
}
function renderSpacedReview(term,data){
  const g=GLOSSARY.find(g=>g.term===term);
  if(!g){goSpaced();return}
  const due=Object.entries(data).filter(([_,v])=>v.next<=Date.now()).length;
  document.getElementById('spacedContent').innerHTML=`
    <div style="text-align:center;margin-bottom:1.5rem"><span style="font-size:.82rem;color:var(--text-muted)">${due} termos restantes</span></div>
    <div class="flash-container" onclick="document.getElementById('srAnswer').style.display='block'" style="cursor:pointer;min-height:160px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;padding:2rem">
      <div style="text-align:center"><h3 style="font-size:1.2rem;margin-bottom:.4rem">${g.term}</h3><span style="font-size:.72rem;color:var(--text-muted)">Clique para ver a resposta</span></div>
    </div>
    <div id="srAnswer" style="display:none;margin-top:1rem;text-align:center">
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.5rem;margin-bottom:1rem"><p style="font-size:.9rem;color:var(--text-secondary);line-height:1.6">${g.def}</p></div>
      <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:.75rem">Você lembrou?</p>
      <div style="display:flex;gap:.5rem;justify-content:center">
        <button class="btn" style="background:var(--coral-muted);color:var(--coral);border:1px solid var(--coral)" onclick="spacedAnswer('${g.term}',false)">Não lembrei</button>
        <button class="btn" style="background:var(--sage-subtle);color:var(--sage);border:1px solid var(--sage)" onclick="spacedAnswer('${g.term}',true)">Lembrei!</button>
      </div>
    </div>`
}
function spacedAnswer(term,correct){
  const data=loadSpaced();
  if(data[term]){
    if(correct){data[term].box=Math.min(data[term].box+1,5)}
    else{data[term].box=1}
    const intervals=[0,0,864e5,864e5*3,864e5*7,864e5*14];
    data[term].next=Date.now()+intervals[data[term].box];
    data[term].reviews++;
    saveSpaced(data)
  }
  window.logActivity('badge',`Revisão: ${term} — ${correct?'Acertou':'Errou'}`);
  // Next due
  const due=Object.entries(data).filter(([_,v])=>v.next<=Date.now());
  if(due.length>0)renderSpacedReview(due[0][0],data);
  else goSpaced()
}

// Attach to window
window.SPACED_KEY=SPACED_KEY;
window.loadSpaced=loadSpaced;
window.saveSpaced=saveSpaced;
window.initSpaced=initSpaced;
window.goSpaced=goSpaced;
window.renderSpacedReview=renderSpacedReview;
window.spacedAnswer=spacedAnswer;
