// ============================================================
// MINI-GAME: BARRAQUINHA DE LIMONADA — extracted from app.js lines 2998-3130
// ============================================================
let gameDay=1,gameCash=20,gameHistory=[],gameInvestment=0,gameReputation=50;
const WEATHER=['☀️ Ensolarado','⛅ Nublado','🌧️ Chuvoso','🔥 Calor intenso'];
const WEATHER_MULT=[1.0,0.6,0.3,1.4];
const GAME_EVENTS=[
  null,null,null, // No event on some days
  {name:'📰 Matéria no jornal local',desc:'Sua barraquinha foi destaque! +20% demanda',mod:d=>d*1.2},
  {name:'🏗️ Concorrente abriu ao lado',desc:'Um rival apareceu! -15% demanda',mod:d=>d*0.85},
  {name:'💰 Inflação dos limões',desc:'Custo de produção subiu! R$2.00/copo',costMod:2.0},
  {name:'🎪 Festival na praça',desc:'Muita gente passando! +40% demanda',mod:d=>d*1.4},
  {name:'📱 Post viral no TikTok',desc:'Alguém filmou sua barraquinha! +30% demanda',mod:d=>d*1.3},
  {name:'🥶 Frente fria inesperada',desc:'Ninguém quer limonada gelada! -40% demanda',mod:d=>d*0.6},
];
function goGame(){
  window.hideAllViews();window.setNav('nGame');
  document.getElementById('vGame').classList.add('on');
  window.renderBackLink('vGame','Voltar');
  gameDay=1;gameCash=20;gameHistory=[];gameInvestment=0;gameReputation=50;
  renderGameDay()
}
function renderGameDay(){
  const wIdx=Math.floor(Math.random()*WEATHER.length);
  const weather=WEATHER[wIdx];const wMult=WEATHER_MULT[wIdx];
  // Random event
  const evt=GAME_EVENTS[Math.floor(Math.random()*GAME_EVENTS.length)];
  const costPerCup=evt&&evt.costMod?evt.costMod:1.5;
  const repBonus=1+(gameReputation-50)/200; // -25% to +25%
  window._gameEvt=evt;window._gameRepBonus=repBonus;
  document.getElementById('gameContent').innerHTML=`
    <div class="game-board">
      <div class="game-day">
        <h3>🍋 Dia ${gameDay} de 7</h3>
        <div class="game-weather">${weather}</div>
        <div class="game-stats-row">
          <div><span class="game-stat-val" style="color:var(--honey)">R$ ${gameCash.toFixed(2)}</span><span class="game-stat-lbl">Caixa</span></div>
          <div><span class="game-stat-val" style="color:var(--sky)">⭐ ${gameReputation}</span><span class="game-stat-lbl">Reputação</span></div>
          ${gameInvestment>0?`<div><span class="game-stat-val" style="color:var(--sage)">📈 R$ ${gameInvestment.toFixed(2)}</span><span class="game-stat-lbl">Investido</span></div>`:''}
        </div>
      </div>
      ${evt?`<div class="game-event"><strong>${evt.name}</strong><br><span style="font-size:.78rem;color:var(--text-secondary)">${evt.desc}</span></div>`:''}
      <div class="game-controls">
        <div class="game-ctrl"><label>Preço por copo</label><input type="range" min="1" max="10" value="3" step="0.5" id="gPrice" oninput="updateGamePreview(${wMult},${costPerCup})"><div class="game-val" id="gPriceVal">R$ 3,00</div></div>
        <div class="game-ctrl"><label>Copos a produzir</label><input type="range" min="0" max="${Math.floor(gameCash/costPerCup)}" value="${Math.min(10,Math.floor(gameCash/costPerCup))}" id="gQty" oninput="updateGamePreview(${wMult},${costPerCup})"><div class="game-val" id="gQtyVal">${Math.min(10,Math.floor(gameCash/costPerCup))}</div></div>
      </div>
      <div class="game-preview" id="gamePreview"></div>
      <button class="btn btn-sage" style="width:100%" onclick="playGameDay(${wMult},${costPerCup})">Abrir a Barraquinha!</button>
      ${gameCash>5?`<div class="game-invest"><button class="btn btn-ghost btn-sm" onclick="gameInvest()" style="width:100%;margin-top:.5rem">📈 Investir R$ 5,00 (retorno em 3 dias)</button></div>`:''}
    </div>
    ${gameHistory.length?`<div class="game-history"><h4 style="font-size:.82rem;font-weight:600;color:var(--text-muted);margin-bottom:.5rem">Histórico</h4>${gameHistory.map((h,i)=>`<div class="game-history-row"><span>Dia ${i+1}</span><span>${h.weather}</span><span style="color:${h.profit>=0?'var(--sage)':'var(--coral)'}">R$ ${h.profit>=0?'+':''}${h.profit.toFixed(2)}</span>${h.event?'<span style="font-size:.65rem">'+h.event+'</span>':''}</div>`).join('')}</div>`:''}`;
  updateGamePreview(wMult,costPerCup)
}
function gameInvest(){
  if(gameCash<5)return;
  gameCash-=5;gameInvestment+=5;
  window.toast('📈 Investiu R$ 5,00! Retorno em 3 dias.');
  renderGameDay()
}
function updateGamePreview(wMult,costPerCup){
  const priceEl=document.getElementById('gPrice'),qtyEl=document.getElementById('gQty');
  if(!priceEl||!qtyEl)return;
  const price=parseFloat(priceEl.value);
  const qty=parseInt(qtyEl.value);
  const cpc=costPerCup||1.5;
  document.getElementById('gPriceVal').textContent=`R$ ${price.toFixed(2).replace('.',',')}`;
  document.getElementById('gQtyVal').textContent=qty;
  const cost=qty*cpc;
  const evt=window._gameEvt;const repBonus=window._gameRepBonus||1;
  let baseDemand=Math.round(qty*wMult*(1-price/15)*1.2*repBonus);
  if(evt&&evt.mod)baseDemand=Math.round(evt.mod(baseDemand));
  const sold=Math.min(qty,Math.max(0,baseDemand));
  const revenue=sold*price;const profit=revenue-cost;
  document.getElementById('gamePreview').innerHTML=`
    <div><div class="gp-label">Custo</div><div class="gp-val" style="color:var(--coral)">R$ ${cost.toFixed(2)}</div></div>
    <div><div class="gp-label">Demanda est.</div><div class="gp-val">~${Math.max(0,baseDemand)} copos</div></div>
    <div><div class="gp-label">Lucro est.</div><div class="gp-val" style="color:${profit>=0?'var(--sage)':'var(--coral)'}">R$ ${profit>=0?'+':''}${profit.toFixed(2)}</div></div>`
}
function playGameDay(wMult,costPerCup){
  const price=parseFloat(document.getElementById('gPrice').value);
  const qty=parseInt(document.getElementById('gQty').value);
  const cpc=costPerCup||1.5;
  const cost=qty*cpc;
  const evt=window._gameEvt;const repBonus=window._gameRepBonus||1;
  let baseDemand=Math.round(qty*wMult*(1-price/15)*1.2*repBonus);
  if(evt&&evt.mod)baseDemand=Math.round(evt.mod(baseDemand));
  const variance=Math.round((Math.random()-.5)*qty*0.3);
  const actualDemand=Math.max(0,baseDemand+variance);
  const sold=Math.min(qty,actualDemand);
  const revenue=sold*price;const profit=revenue-cost;
  const wasted=qty-sold;
  gameCash+=profit;
  // Reputation: good service (sold most) → up, waste → down
  if(sold>=qty*0.8)gameReputation=Math.min(100,gameReputation+5);
  else if(wasted>qty*0.5)gameReputation=Math.max(0,gameReputation-5);
  // Investment returns after 3 days
  if(gameDay>=4&&gameInvestment>0){const ret=gameInvestment*1.3;gameCash+=ret;window.toast(`📈 Investimento rendeu R$ ${ret.toFixed(2)}!`);gameInvestment=0}
  const wIdx=WEATHER.findIndex(w=>WEATHER_MULT[WEATHER.indexOf(w)]===wMult)||0;
  gameHistory.push({weather:WEATHER[wIdx]||'☀️',sold,qty,profit,price,event:evt?evt.name:null});
  window.playSfx(profit>=0?'success':'error');
  if(gameDay>=7){renderGameEnd();return}
  // Show result overlay then next day
  document.getElementById('gameContent').innerHTML=`
    <div class="game-result ${profit<0?'loss':''}">
      <h4>Dia ${gameDay} — ${profit>=0?'Lucro!':'Prejuízo'}</h4>
      <div class="gr-amount ${profit>=0?'profit':'deficit'}">R$ ${profit>=0?'+':''}${profit.toFixed(2)}</div>
      <p style="font-size:.82rem;color:var(--text-secondary);margin-top:.5rem">Vendeu ${sold}/${qty} copos a R$ ${price.toFixed(2)}${wasted>0?` (${wasted} desperdiçados)`:''}</p>
    </div>
    <button class="btn btn-sage" style="width:100%;margin-top:1rem" onclick="gameDay++;renderGameDay()">Próximo Dia →</button>`;
  window.logActivity('lesson',`Limonada Dia ${gameDay}: R$ ${profit>=0?'+':''}${profit.toFixed(2)}`)
}
function renderGameEnd(){
  const totalProfit=gameCash-20;
  const avgProfit=totalProfit/7;
  if(totalProfit>0){window.addXP(30);window.launchConfetti()}
  document.getElementById('gameContent').innerHTML=`
    <div class="game-result ${totalProfit<0?'loss':''}">
      <h4>Semana Encerrada!</h4>
      <div class="gr-amount ${totalProfit>=0?'profit':'deficit'}">R$ ${totalProfit>=0?'+':''}${totalProfit.toFixed(2)}</div>
      <p style="font-size:.82rem;color:var(--text-secondary);margin-top:.5rem">${totalProfit>=0?'Parabéns, você lucrou!':'Não desanime — empreender é aprender.'}</p>
      <div class="game-summary">
        <div class="gs-item"><div class="gs-val" style="color:var(--honey)">R$ ${gameCash.toFixed(2)}</div><div class="gs-lbl">Caixa Final</div></div>
        <div class="gs-item"><div class="gs-val">${gameHistory.reduce((s,h)=>s+h.sold,0)}</div><div class="gs-lbl">Copos Vendidos</div></div>
        <div class="gs-item"><div class="gs-val">R$ ${avgProfit.toFixed(2)}</div><div class="gs-lbl">Lucro Médio/Dia</div></div>
      </div>
    </div>
    <div style="display:flex;gap:.75rem;justify-content:center;margin-top:1.25rem">
      <button class="btn btn-sage" onclick="goGame()">Jogar Novamente</button>
      <button class="btn btn-ghost" onclick="goDash()">Dashboard</button>
    </div>
    <div class="game-history" style="margin-top:1.5rem"><h4 style="font-size:.82rem;font-weight:600;color:var(--text-muted);margin-bottom:.5rem">Resumo dos 7 Dias</h4>${gameHistory.map((h,i)=>`<div class="game-history-row"><span>Dia ${i+1}</span><span>${h.weather}</span><span>Vendeu ${h.sold} a R$${h.price.toFixed(2)}</span><span style="color:${h.profit>=0?'var(--sage)':'var(--coral)'}">R$ ${h.profit>=0?'+':''}${h.profit.toFixed(2)}</span></div>`).join('')}</div>`;
  window.logActivity('lesson',`Limonada completa: R$ ${totalProfit>=0?'+':''}${totalProfit.toFixed(2)}`)
}

// Attach to window
window.goGame=goGame;
window.renderGameDay=renderGameDay;
window.gameInvest=gameInvest;
window.updateGamePreview=updateGamePreview;
window.playGameDay=playGameDay;
window.renderGameEnd=renderGameEnd;
