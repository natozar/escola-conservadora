// ============================================================
// MULTI-PROFILE — extracted from app.js lines 1683-1725
// ============================================================
const PROFILES_KEY='escola_profiles';
let activeProfile='default';
function loadProfiles(){try{return JSON.parse(localStorage.getItem(PROFILES_KEY))||{default:{name:window.S.name}}}catch(e){return{default:{name:window.S.name}}}}
function saveProfiles(p){try{localStorage.setItem(PROFILES_KEY,JSON.stringify(p))}catch(e){console.warn('[saveProfiles] storage error:',e.message)}}
function renderProfileSwitch(){
  const profiles=loadProfiles();const keys=Object.keys(profiles);
  if(keys.length<=1){
    document.getElementById('profileSwitch').innerHTML=`<span class="profile-manage" onclick="addProfile()">+ Adicionar perfil</span>`;return
  }
  let html=keys.map(k=>`<button class="profile-switch-btn${k===activeProfile?' active':''}" onclick="switchProfile('${k}')">${profiles[k].name||'Aluno'}</button>`).join('');
  html+=`<span class="profile-manage" onclick="addProfile()">+</span>`;
  html+=`<span class="profile-manage" onclick="goParentDash()">👁</span>`;
  document.getElementById('profileSwitch').innerHTML=html
}
function addProfile(){
  const name=prompt('Nome do novo perfil:');
  if(!name||!name.trim())return;
  const profiles=loadProfiles();
  const id='p_'+Date.now();
  profiles[id]={name:name.trim()};
  saveProfiles(profiles);
  // Create new state for this profile
  const newState=window.def();newState.name=name.trim();
  localStorage.setItem(window.SK+'_'+id,JSON.stringify(newState));
  switchProfile(id)
}
function switchProfile(id){
  // Save current
  const profiles=loadProfiles();
  if(activeProfile==='default'){localStorage.setItem(window.SK,JSON.stringify(window.S))}
  else{localStorage.setItem(window.SK+'_'+activeProfile,JSON.stringify(window.S))}
  profiles[activeProfile]={name:window.S.name};
  // Load new
  activeProfile=id;
  if(id==='default'){window.S=window.load()}
  else{try{window.S={...window.def(),...JSON.parse(localStorage.getItem(window.SK+'_'+id))};}catch(e){window.S=window.def()}}
  profiles[id]={name:window.S.name};
  saveProfiles(profiles);
  renderProfileSwitch();window.goDash();window.toast(`Perfil: ${window.S.name}`)
}

// ============================================================
// PARENT PIN LOCK — extracted from app.js lines 1726-1758
// ============================================================
const PIN_KEY='escola_pin';
let pinBuffer='';let pinCallback=null;
async function _hashPin(p){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('ec_pin_salt_'+p));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
async function getPin(){return localStorage.getItem(PIN_KEY)}
async function setPin(p){const h=await _hashPin(p);localStorage.setItem(PIN_KEY,h)}
function showPinOverlay(mode,cb){
  pinBuffer='';pinCallback=cb;
  const title=mode==='set'?'Criar PIN de Acesso':'Insira o PIN';
  const sub=mode==='set'?'Crie um PIN de 4 dígitos para proteger o painel dos pais.':'Digite o PIN de 4 dígitos.';
  const overlay=document.createElement('div');overlay.className='pin-overlay';overlay.id='pinOverlay';
  overlay.innerHTML=`<div class="pin-card"><h3>🔐 ${title}</h3><p>${sub}</p><div class="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot" id="pd${i}"></div>`).join('')}</div><div class="pin-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="pin-key" onclick="pinPress('${n}')">${n}</button>`).join('')}<div class="pin-key pin-empty"></div><button class="pin-key" onclick="pinPress('0')">0</button><button class="pin-key pin-del" onclick="pinDel()">⌫</button></div><button class="btn btn-ghost" onclick="closePin()" style="margin-top:1rem;width:100%">Cancelar</button></div>`;
  document.body.appendChild(overlay)
}
function pinPress(n){
  if(pinBuffer.length>=4)return;
  pinBuffer+=n;
  for(let i=0;i<4;i++){const d=document.getElementById('pd'+i);d&&(d.className='pin-dot'+(i<pinBuffer.length?' filled':''))}
  if(pinBuffer.length===4)setTimeout(()=>{if(pinCallback)pinCallback(pinBuffer)},200)
}
function pinDel(){
  if(pinBuffer.length>0){pinBuffer=pinBuffer.slice(0,-1);for(let i=0;i<4;i++){const d=document.getElementById('pd'+i);d&&(d.className='pin-dot'+(i<pinBuffer.length?' filled':''))}}
}
function closePin(){const o=document.getElementById('pinOverlay');if(o)o.remove();pinBuffer='';pinCallback=null}
function pinError(){
  document.querySelectorAll('.pin-dot').forEach(d=>{d.classList.add('error')});
  setTimeout(()=>{pinBuffer='';document.querySelectorAll('.pin-dot').forEach(d=>{d.className='pin-dot'})},600)
}
async function goParentDash(){
  const pin=await getPin();
  if(!pin){
    showPinOverlay('set',async p=>{await setPin(p);closePin();window.toast('🔐 PIN criado!');showPinOverlay('verify',async p2=>{const h=await _hashPin(p2);if(h===await getPin()){closePin();openParentDash()}else pinError()})})
  }else{
    showPinOverlay('verify',async p=>{const h=await _hashPin(p);if(h===pin){closePin();openParentDash()}else pinError()})
  }
}

// ============================================================
// PARENT DASHBOARD — extracted from app.js lines 1767-1901
// ============================================================
function _loadProfileState(k){
  if(k===activeProfile)return{...window.S};
  const key=k==='default'?window.SK:window.SK+'_'+k;
  try{return{...window.def(),...JSON.parse(localStorage.getItem(key))}}catch(e){return window.def()}
}
function _profileStats(ps){
  const done=Object.keys(ps.done||{}).length;
  const totalL=window.M.reduce((s,m)=>s+m.lessons.length,0);
  const qt=Object.keys(ps.quiz||{}).length;
  const qc=Object.values(ps.quiz||{}).filter(v=>v).length;
  const pct=qt?Math.round(qc/qt*100):0;
  const estMinutes=done*5;
  // Per-discipline breakdown
  const byDisc={};
  window.M.forEach((m,mi)=>{
    const disc=m.discipline||'economia';
    if(!byDisc[disc])byDisc[disc]={done:0,total:0,quizOk:0,quizTotal:0};
    m.lessons.forEach((_,li)=>{
      byDisc[disc].total++;
      if(ps.done[`${mi}-${li}`])byDisc[disc].done++;
      if(ps.quiz[`${mi}-${li}`]!==undefined){byDisc[disc].quizTotal++;if(ps.quiz[`${mi}-${li}`])byDisc[disc].quizOk++}
    });
  });
  // Weekly activity (last 7 days)
  const weekActivity=[];
  const today=new Date();
  for(let d=6;d>=0;d--){
    const dt=new Date(today);dt.setDate(today.getDate()-d);
    const iso=dt.toISOString().slice(0,10);
    weekActivity.push({date:iso,day:['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dt.getDay()],active:ps.streakDays&&ps.streakDays.includes(iso)});
  }
  const daysActive=weekActivity.filter(d=>d.active).length;
  return{done,totalL,qt,qc,pct,estMinutes,byDisc,weekActivity,daysActive}
}

function openParentDash(){
  window.hideAllViews();
  document.getElementById('vParent').classList.add('on');
  const profiles=loadProfiles();const keys=Object.keys(profiles);

  // Alerts
  let alerts='';
  keys.forEach(k=>{
    const ps=_loadProfileState(k);
    const st=_profileStats(ps);
    if(st.daysActive===0)alerts+=`<div class="pd-alert pd-alert-warn">⚠️ <strong>${ps.name||'Aluno'}</strong> não estudou nenhum dia esta semana.</div>`;
    else if(st.daysActive<=2)alerts+=`<div class="pd-alert pd-alert-info">💡 <strong>${ps.name||'Aluno'}</strong> estudou apenas ${st.daysActive} dia${st.daysActive>1?'s':''} esta semana. Incentive a consistência!</div>`;
    if(ps.streak>=7)alerts+=`<div class="pd-alert pd-alert-success">🔥 <strong>${ps.name||'Aluno'}</strong> está com ${ps.streak} dias de sequência! Excelente!</div>`;
  });
  document.getElementById('parentAlerts').innerHTML=alerts;

  // Profile cards
  let cardsHtml='';
  keys.forEach(k=>{
    const ps=_loadProfileState(k);
    const st=_profileStats(ps);
    const li=window.getLevelInfo(ps.lvl||1);
    const progPct=st.totalL?Math.round(st.done/st.totalL*100):0;
    cardsHtml+=`<div class="parent-card" onclick="showParentDetail('${k}')">
      <div class="pc-head">
        <span class="pc-avatar">${ps.avatar||'🧑‍🎓'}</span>
        <div class="pc-name-wrap">
          <h4>${ps.name||'Aluno'}</h4>
          <span class="pc-level">${li.emoji} Nível ${ps.lvl||1} · ${li.name}</span>
        </div>
        <span class="pc-arrow">›</span>
      </div>
      <div class="pc-stats-grid">
        <div class="pc-stat-box"><div class="pc-stat-val">${st.done}/${st.totalL}</div><div class="pc-stat-lbl">Aulas</div></div>
        <div class="pc-stat-box"><div class="pc-stat-val">${st.pct}%</div><div class="pc-stat-lbl">Quizzes</div></div>
        <div class="pc-stat-box"><div class="pc-stat-val">${ps.streak||0}🔥</div><div class="pc-stat-lbl">Sequência</div></div>
        <div class="pc-stat-box"><div class="pc-stat-val">${st.daysActive}/7</div><div class="pc-stat-lbl">Semana</div></div>
      </div>
      <div class="pc-prog-bar"><div class="pc-prog-fill" style="width:${progPct}%"></div></div>
      <div class="pc-prog-label">${progPct}% do currículo completo · ~${Math.floor(st.estMinutes/60)}h${st.estMinutes%60}min estudados</div>
      <div class="pc-week">${st.weekActivity.map(d=>`<div class="pc-week-day${d.active?' active':''}"><div class="pc-week-dot"></div><div class="pc-week-lbl">${d.day}</div></div>`).join('')}</div>
    </div>`;
  });
  document.getElementById('parentCards').innerHTML=cardsHtml;

  // Debate moderation section
  var debateHtml='<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">'
    +'<h3 style="font-size:1rem;margin-bottom:.75rem">💬 Debate — Controle Parental</h3>';
  var strikes=typeof window.getDebateStrikes==='function'?window.getDebateStrikes():{strikes:0,history:[]};
  var disabled=typeof window.isDebateDisabled==='function'&&window.isDebateDisabled();
  debateHtml+='<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem">'
    +'<div class="pc-stat-box"><div class="pc-stat-val" style="color:'+(strikes.strikes>=3?'var(--coral)':'var(--sage)')+'">'+strikes.strikes+'</div><div class="pc-stat-lbl">Strikes</div></div>'
    +'<div class="pc-stat-box"><div class="pc-stat-val">'+(strikes.banned?'🚫':strikes.suspended_until?'⏸':'✓')+'</div><div class="pc-stat-lbl">'+(strikes.banned?'Banido':strikes.suspended_until?'Suspenso':'Ativo')+'</div></div>'
    +'</div>';
  // History
  if(strikes.history&&strikes.history.length>0){
    debateHtml+='<details style="margin-bottom:.75rem"><summary style="font-size:.82rem;cursor:pointer;color:var(--text-muted)">Historico de infracoes ('+strikes.history.length+')</summary>'
      +'<div style="margin-top:.5rem;font-size:.75rem">';
    strikes.history.slice(-10).reverse().forEach(function(h){
      debateHtml+='<div style="padding:.3rem 0;border-bottom:1px solid var(--border)"><span style="color:var(--text-muted)">'+new Date(h.date).toLocaleDateString('pt-BR')+'</span> · <span style="color:var(--coral)">'+h.reason+'</span> · <em>'+h.msg+'</em></div>';
    });
    debateHtml+='</div></details>';
  }
  // Sent messages
  var sentLog=typeof window.getDebateSentLog==='function'?window.getDebateSentLog():[];
  if(sentLog.length>0){
    debateHtml+='<details style="margin-bottom:.75rem"><summary style="font-size:.82rem;cursor:pointer;color:var(--text-muted)">Ultimas mensagens enviadas ('+sentLog.length+')</summary>'
      +'<div style="margin-top:.5rem;font-size:.75rem">';
    sentLog.slice(-20).reverse().forEach(function(m){
      debateHtml+='<div style="padding:.3rem 0;border-bottom:1px solid var(--border)"><span style="color:var(--text-muted)">'+new Date(m.date).toLocaleDateString('pt-BR')+'</span> · <span>['+m.room+']</span> '+m.text+'</div>';
    });
    debateHtml+='</div></details>';
  }
  // Controls
  debateHtml+='<div style="display:flex;gap:.5rem;flex-wrap:wrap">';
  if(strikes.strikes>0)debateHtml+='<button class="btn btn-ghost" style="font-size:.78rem" onclick="resetDebateStrikes();openParentDash()">↺ Resetar Strikes</button>';
  debateHtml+='<button class="btn btn-ghost" style="font-size:.78rem" onclick="setDebateDisabled('+(disabled?'false':'true')+');openParentDash()">'+(disabled?'✓ Reativar Debate':'✕ Desativar Debate')+'</button>';
  debateHtml+='</div></div>';
  document.getElementById('parentCards').innerHTML+=debateHtml;

  document.getElementById('parentDetail').innerHTML='';
}

function showParentDetail(profileKey){
  const ps=_loadProfileState(profileKey);
  const st=_profileStats(ps);
  let html=`<div class="pd-detail">
    <h4>${ps.avatar||'🧑‍🎓'} ${ps.name||'Aluno'} — Detalhamento por Disciplina</h4>
    <div class="pd-disc-list">`;
  Object.entries(st.byDisc).forEach(([disc,d])=>{
    const info=window.DISCIPLINES[disc]||{label:disc,icon:'📚'};
    const pct=d.total?Math.round(d.done/d.total*100):0;
    const qPct=d.quizTotal?Math.round(d.quizOk/d.quizTotal*100):0;
    html+=`<div class="pd-disc-row">
      <span class="pd-disc-icon">${info.icon}</span>
      <div class="pd-disc-info">
        <div class="pd-disc-name">${info.label}</div>
        <div class="pd-disc-meta">${d.done}/${d.total} aulas · ${qPct}% quizzes</div>
        <div class="pd-disc-bar"><div class="pd-disc-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  });
  html+=`</div></div>`;
  document.getElementById('parentDetail').innerHTML=html;
  document.getElementById('parentDetail').scrollIntoView({behavior:'smooth'});
}

function exportParentReport(){
  const profiles=loadProfiles();const keys=Object.keys(profiles);
  let text='ESCOLA LIBERAL — RELATÓRIO DE PROGRESSO\n';
  text+=`Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
  text+='='.repeat(50)+'\n\n';
  keys.forEach(k=>{
    const ps=_loadProfileState(k);
    const st=_profileStats(ps);
    const li=window.getLevelInfo(ps.lvl||1);
    text+=`ALUNO: ${ps.name||'Aluno'}\n`;
    text+=`Nível: ${ps.lvl||1} (${li.name})\n`;
    text+=`Aulas: ${st.done}/${st.totalL} (${st.totalL?Math.round(st.done/st.totalL*100):0}%)\n`;
    text+=`Quizzes: ${st.pct}% de acerto (${st.qc}/${st.qt})\n`;
    text+=`Sequência: ${ps.streak||0} dias\n`;
    text+=`Tempo estimado: ~${Math.floor(st.estMinutes/60)}h${st.estMinutes%60}min\n\n`;
    text+='Por disciplina:\n';
    Object.entries(st.byDisc).forEach(([disc,d])=>{
      const info=window.DISCIPLINES[disc]||{label:disc};
      const pct=d.total?Math.round(d.done/d.total*100):0;
      text+=`  ${info.label}: ${d.done}/${d.total} (${pct}%)\n`;
    });
    text+='\n'+'-'.repeat(40)+'\n\n';
  });
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`escola-liberal-relatorio-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();URL.revokeObjectURL(a.href);
  window.toast('Relatório exportado!')
}

// Attach to window
window.activeProfile=activeProfile;
window.loadProfiles=loadProfiles;
window.saveProfiles=saveProfiles;
window.renderProfileSwitch=renderProfileSwitch;
window.addProfile=addProfile;
window.switchProfile=switchProfile;
window.pinPress=pinPress;
window.pinDel=pinDel;
window.closePin=closePin;
window.goParentDash=goParentDash;
window.showParentDetail=showParentDetail;
window.exportParentReport=exportParentReport;
window.openParentDash=openParentDash;
window.showPinOverlay=showPinOverlay;
window.pinError=pinError;
window.getPin=getPin;
window.setPin=setPin;
