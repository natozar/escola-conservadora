// src/ui/sfx.js — extracted from app.js
// Lines: 3200-3290 (SFX, print, export PDF), 3292-3323 (keyboard shortcuts, splash)

// ============================================================
// SOUND EFFECTS (Web Audio API)
// ============================================================
let sfxEnabled=true;const SFX_KEY='escola_sfx';
try{sfxEnabled=localStorage.getItem(SFX_KEY)!=='off'}catch(e){}
function toggleSfx(){sfxEnabled=!sfxEnabled;localStorage.setItem(SFX_KEY,sfxEnabled?'on':'off');window.toast(sfxEnabled?'🔊 Sons ativados':'🔇 Sons desativados');updateSfxLabel()}
function updateSfxLabel(){const l=document.getElementById('sfxLabel');const i=document.getElementById('sfxToggle');if(l)l.textContent=sfxEnabled?'Sons Ligados':'Sons Desligados';if(i){const ic=i.querySelector('.ni-icon');if(ic)ic.textContent=sfxEnabled?'🔊':'🔇'}}
function playSfx(type){
  if(!sfxEnabled)return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();const gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);
    gain.gain.value=0.1;
    if(type==='success'){osc.frequency.value=523;osc.type='sine';osc.start();osc.frequency.setValueAtTime(659,ctx.currentTime+0.1);osc.frequency.setValueAtTime(784,ctx.currentTime+0.2);gain.gain.setValueAtTime(0,ctx.currentTime+0.35);osc.stop(ctx.currentTime+0.4)}
    else if(type==='error'){osc.frequency.value=200;osc.type='square';osc.start();gain.gain.value=0.05;gain.gain.setValueAtTime(0,ctx.currentTime+0.25);osc.stop(ctx.currentTime+0.3)}
    else if(type==='levelup'){osc.frequency.value=440;osc.type='sine';osc.start();osc.frequency.setValueAtTime(554,ctx.currentTime+0.1);osc.frequency.setValueAtTime(659,ctx.currentTime+0.2);osc.frequency.setValueAtTime(880,ctx.currentTime+0.3);gain.gain.setValueAtTime(0,ctx.currentTime+0.5);osc.stop(ctx.currentTime+0.55)}
    else if(type==='complete'){osc.frequency.value=523;osc.type='sine';osc.start();osc.frequency.setValueAtTime(659,ctx.currentTime+0.15);osc.frequency.setValueAtTime(784,ctx.currentTime+0.3);osc.frequency.setValueAtTime(1047,ctx.currentTime+0.45);gain.gain.setValueAtTime(0,ctx.currentTime+0.7);osc.stop(ctx.currentTime+0.75)}
  }catch(e){}
}

// ============================================================
// PRINT LESSON
// ============================================================
function printLesson(){
  if(window.S.cMod===null||window.S.cLes===null||!window.M[window.S.cMod]||!window.M[window.S.cMod].lessons[window.S.cLes])return;
  const m=window.M[window.S.cMod],l=m.lessons[window.S.cLes];
  const w=window.open('','_blank');
  if(!w){window.toast('Permita popups para imprimir','error');return;}
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${l.title} — escola liberal</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;font-family:Georgia,serif}body{padding:2.5rem;max-width:700px;margin:0 auto;color:#1a1a2e;font-size:14px;line-height:1.7}
  h2{font-size:1.5rem;margin-bottom:.5rem}h3{font-size:1.1rem;margin:1.5rem 0 .5rem;color:#3d8b6e}
  p{margin-bottom:.75rem}.highlight{background:#f5f3ef;border-left:3px solid #dba550;padding:.75rem 1rem;margin:1rem 0;font-size:.9rem}
  .example{background:#f0faf5;border-left:3px solid #4a9e7e;padding:.75rem 1rem;margin:1rem 0;font-size:.9rem}
  .thinker-quote{font-style:italic;color:#666;margin:1rem 0;padding:.5rem 1rem;border-left:3px solid #9b7ed8}
  .header{border-bottom:2px solid #1a1a2e;padding-bottom:.75rem;margin-bottom:1.5rem}
  .header .module{font-size:.8rem;color:#666}.header .lesson{font-size:.8rem;color:#4a9e7e}
  .footer{margin-top:2rem;padding-top:.75rem;border-top:1px solid #ddd;font-size:.75rem;color:#999;text-align:center}
  .quiz-section{background:#f5f3ef;border:1px solid #ddd;border-radius:4px;padding:1rem;margin-top:1.5rem}
  .quiz-section h3{margin-top:0}.quiz-opt{padding:.3rem 0;font-size:.9rem}
  @media print{body{padding:1rem}}</style></head><body>
  <div class="header"><div class="module">${m.icon} ${m.title}</div><h1>${l.title}</h1><div class="lesson">Aula ${window.S.cLes+1} de ${m.lessons.length} · ⏱ ~${window.calcReadTime(l.content)} min de leitura</div></div>
  ${l.content}
  ${l.quiz?`<div class="quiz-section"><h3>Quiz</h3><p><strong>${l.quiz.q}</strong></p>${l.quiz.o.map((o,i)=>`<div class="quiz-opt">${String.fromCharCode(65+i)}) ${o}</div>`).join('')}<p style="margin-top:.75rem;font-size:.8rem;color:#666"><strong>Resposta:</strong> ${String.fromCharCode(65+l.quiz.c)} — ${l.quiz.exp}</p></div>`:''}
  <div class="footer">Escola Liberal · ${new Date().toLocaleDateString('pt-BR')} · A educação que bilionários escondem dos seus filhos.</div>
</body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),300)
}

// ============================================================
// EXPORT PDF
// ============================================================
function exportPDF(){
  const li=window.getLevelInfo(window.S.lvl);
  const done=Object.keys(window.S.done).length;
  const qt=Object.keys(window.S.quiz).length;
  const qc=Object.values(window.S.quiz).filter(v=>v).length;
  const pct=qt?Math.round(qc/qt*100):0;

  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatório — ${window.S.name}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;font-family:Georgia,serif}body{padding:3rem;max-width:700px;margin:0 auto;color:#1a1a2e}
  h1{font-size:1.8rem;margin-bottom:.3rem}h2{font-size:1.2rem;margin:2rem 0 .75rem;color:#3d8b6e;border-bottom:2px solid #3d8b6e;padding-bottom:.3rem}
  .subtitle{color:#666;font-size:.9rem;margin-bottom:2rem}.stat{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #eee;font-size:.9rem}
  .stat-label{color:#666}.stat-value{font-weight:700}.module{padding:.6rem 0;border-bottom:1px solid #eee;font-size:.9rem}
  .footer{margin-top:3rem;padding-top:1rem;border-top:2px solid #1a1a2e;font-size:.75rem;color:#999;text-align:center}
  @media print{body{padding:1.5rem}}</style></head><body>
  <h1>🎓 Escola Liberal</h1>
  <div class="subtitle">Relatório de Progresso — ${new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'})}</div>
  <h2>Aluno</h2>
  <div class="stat"><span class="stat-label">Nome</span><span class="stat-value">${window.S.name}</span></div>
  <div class="stat"><span class="stat-label">Nível</span><span class="stat-value">${window.S.lvl} — ${li.emoji} ${li.name}</span></div>
  <div class="stat"><span class="stat-label">XP Total</span><span class="stat-value">${window.totalXP()}</span></div>
  <div class="stat"><span class="stat-label">Sequência</span><span class="stat-value">${window.S.streak} dias</span></div>
  <h2>Progresso Geral</h2>
  <div class="stat"><span class="stat-label">Aulas Concluídas</span><span class="stat-value">${done}/${window.M.reduce((s,m)=>s+m.lessons.length,0)}</span></div>
  <div class="stat"><span class="stat-label">Quizzes Respondidos</span><span class="stat-value">${qt}/${window.M.reduce((s,m)=>s+m.lessons.length,0)}</span></div>
  <div class="stat"><span class="stat-label">Taxa de Acerto</span><span class="stat-value">${pct}%</span></div>
  <h2>Por Módulo</h2>
  ${window.M.map((m,mi)=>{
    const d=m.lessons.filter((_,li)=>window.S.done[`${mi}-${li}`]).length;
    const mq=m.lessons.filter((_,li)=>window.S.quiz[`${mi}-${li}`]!==undefined).length;
    const mqc=m.lessons.filter((_,li)=>window.S.quiz[`${mi}-${li}`]===true).length;
    return`<div class="module"><strong>${m.icon} ${m.title}</strong> — ${d}/${m.lessons.length} aulas · ${mq?Math.round(mqc/mq*100):0}% quizzes ${d===m.lessons.length?'✅':''}</div>`
  }).join('')}
  <div class="footer">Documento gerado automaticamente pela Escola Liberal<br>© ${new Date().getFullYear()}</div>
</body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),300)
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
let kbdVisible=false;
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  const lesOn=document.getElementById('vLes').classList.contains('on');
  const marathonOn=document.getElementById('vMarathon').classList.contains('on');
  if(e.key==='ArrowRight'&&lesOn){e.preventDefault();window.nextL()}
  else if(e.key==='ArrowLeft'&&lesOn){e.preventDefault();window.prevL()}
  else if(e.key==='f'||e.key==='F'){if(lesOn){e.preventDefault();window.toggleFocus()}}
  else if(e.key==='s'||e.key==='S'){if(lesOn){e.preventDefault();window.toggleTTS()}}
  else if(e.key==='Escape'){
    if(document.body.classList.contains('focus-mode'))window.toggleFocus();
    else if(lesOn)window.goBackMod();
    else if(document.getElementById('vMod').classList.contains('on'))window.goDash();
    else if(marathonOn)window.endMarathon();
  }
  else if(e.key==='?'){e.preventDefault();kbdVisible=!kbdVisible;document.getElementById('kbdHint').classList.toggle('show',kbdVisible)}
});

// ============================================================
// SPLASH SCREEN
// ============================================================
function runSplash(){
  const fill=document.getElementById('splashFill');
  setTimeout(()=>fill.style.width='30%',100);
  setTimeout(()=>fill.style.width='70%',400);
  setTimeout(()=>fill.style.width='100%',700);
  setTimeout(()=>{document.getElementById('splash').classList.add('hide');setTimeout(()=>document.getElementById('splash').style.display='none',500)},1100)
}
runSplash();

// ============================================================
// EXPORTS
// ============================================================
window.sfxEnabled=sfxEnabled;
window.SFX_KEY=SFX_KEY;
window.toggleSfx=toggleSfx;
window.updateSfxLabel=updateSfxLabel;
window.playSfx=playSfx;
window.printLesson=printLesson;
window.exportPDF=exportPDF;
window.runSplash=runSplash;
