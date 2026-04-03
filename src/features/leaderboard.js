// ============================================================
// LEADERBOARD — LIGAS SEMANAIS (estilo Duolingo)
// Extracted from app.js
// ============================================================
const LEAGUES=[
  {id:'bronze',name:'Bronze',icon:'🥉',color:'#cd7f32',promote:3,demote:0,minXP:0},
  {id:'silver',name:'Prata',icon:'🥈',color:'#c0c0c0',promote:3,demote:3,minXP:50},
  {id:'gold',name:'Ouro',icon:'🥇',color:'#ffd700',promote:3,demote:3,minXP:150},
  {id:'diamond',name:'Diamante',icon:'💎',color:'#b9f2ff',promote:3,demote:3,minXP:300},
  {id:'ruby',name:'Rubi',icon:'❤️‍🔥',color:'#e0115f',promote:0,demote:3,minXP:500}
];
const LB_KEY='escola_leaderboard';
const LB_NAMES=['Ana','Pedro','Lucas','Maria','João','Sofia','Gabriel','Julia','Rafael','Laura','Miguel','Isabella','Arthur','Helena','Bernardo','Alice','Davi','Manuela','Lorenzo','Valentina','Theo','Lara','Heitor','Cecília','Matheus','Beatriz','Felipe','Lívia','Enzo','Clara'];
const LB_AVATARS=['🧑‍🎓','👧','👦','👩','🧒','👨‍🎓','🧑','👩‍💻','👨‍💻','🧒'];

function getLBState(){
  try{
    const raw=localStorage.getItem(LB_KEY);
    if(raw){const st=JSON.parse(raw);if(st.weekId===getCurrentWeekId())return st}
  }catch(e){}
  return initLeaderboardWeek()
}
function saveLBState(st){try{localStorage.setItem(LB_KEY,JSON.stringify(st))}catch(e){}}

function getCurrentWeekId(){
  const d=new Date();
  const jan1=new Date(d.getFullYear(),0,1);
  const week=Math.ceil(((d-jan1)/864e5+jan1.getDay()+1)/7);
  return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`
}

function getWeekEndDate(){
  const d=new Date();
  const day=d.getDay();
  const diff=day===0?0:7-day;
  const end=new Date(d);
  end.setDate(end.getDate()+diff);
  end.setHours(23,59,59,999);
  return end
}

function initLeaderboardWeek(){
  const prev=(() => {try{return JSON.parse(localStorage.getItem(LB_KEY))}catch(e){return null}})();
  let league=0;
  if(prev&&prev.league!==undefined){
    league=prev.league;
    const prevRank=prev.competitors?prev.competitors.findIndex(c=>c.isUser)+1:1;
    const L=LEAGUES[league];
    if(L.promote>0&&prevRank>0&&prevRank<=L.promote&&league<LEAGUES.length-1)league++;
    else if(L.demote>0&&prevRank>prev.competitors.length-L.demote&&league>0)league--;
  }
  const competitors=generateCompetitors(league);
  const st={weekId:getCurrentWeekId(),league,competitors,userWeekXP:0};
  saveLBState(st);
  return st
}

function generateCompetitors(league){
  const weekSeed=getCurrentWeekId().split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const rng=(i)=>{let s=weekSeed*31+i*17+league*7;return()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}};
  const L=LEAGUES[league];
  const count=15;
  const used=new Set();
  const comps=[];
  for(let i=0;i<count-1;i++){
    const r=rng(i);
    let ni;do{ni=Math.floor(r()*LB_NAMES.length)}while(used.has(ni));
    used.add(ni);
    const baseXP=Math.floor(L.minXP*0.3+r()*L.minXP*2.5);
    const dayProgress=Math.min(1,(new Date().getDay()||7)/7);
    const xp=Math.floor(baseXP*dayProgress*(0.4+r()*0.6));
    comps.push({name:LB_NAMES[ni],avatar:LB_AVATARS[i%LB_AVATARS.length],xp,isUser:false})
  }
  comps.push({name:window.S.name||'Você',avatar:window.S.avatar||'🧑‍🎓',xp:0,isUser:true});
  return comps
}

function updateLeaderboardXP(earned){
  const st=getLBState();
  st.userWeekXP+=earned;
  const userComp=st.competitors.find(c=>c.isUser);
  if(userComp){userComp.xp=st.userWeekXP;userComp.name=window.S.name||'Você';userComp.avatar=window.S.avatar||'🧑‍🎓'}
  saveLBState(st);
  // Sync to Supabase if authenticated
  _syncLeaderboardXP(st.userWeekXP,st.league)
}

async function _syncLeaderboardXP(xp,league){
  if(typeof sbClient==='undefined'||!sbClient||typeof currentUser==='undefined'||!currentUser)return;
  try{
    await sbClient.from('weekly_xp').upsert({
      user_id:currentUser.id,
      week_id:getCurrentWeekId(),
      xp,league,
      name:window.S.name||'Aluno',
      avatar:window.S.avatar||'🧑‍🎓',
      updated_at:new Date().toISOString()
    },{onConflict:'user_id,week_id'})
  }catch(e){/* silent — local data is primary */}
}

async function _fetchRealLeaderboard(){
  if(typeof sbClient==='undefined'||!sbClient||typeof currentUser==='undefined'||!currentUser)return null;
  try{
    const{data}=await sbClient.from('weekly_xp')
      .select('user_id,name,avatar,xp,league')
      .eq('week_id',getCurrentWeekId())
      .order('xp',{ascending:false})
      .limit(20);
    return data&&data.length>1?data:null // Need at least 2 real users
  }catch(e){return null}
}

function goLeaderboard(){
  window.hideAllViews();window.setNav('nLeaderboard');
  document.getElementById('vLeaderboard').classList.add('on');
  try{history.pushState({view:'leaderboard'},'')}catch(e){}
  // Try real data first, fallback to local
  _fetchRealLeaderboard().then(realData=>{
    if(realData)renderLeaderboardReal(realData);
    else renderLeaderboard()
  }).catch(()=>renderLeaderboard())
}

function renderLeaderboardReal(data){
  const st=getLBState();
  const L=LEAGUES[st.league];
  const hasUser=data.some(d=>d.user_id===currentUser?.id);
  const sorted=data.map(d=>({
    name:d.name||'Aluno',avatar:d.avatar||'🧑‍🎓',xp:d.xp||0,
    isUser:d.user_id===currentUser?.id
  }));
  if(!hasUser)sorted.push({name:window.S.name||'Você',avatar:window.S.avatar||'🧑‍🎓',xp:st.userWeekXP,isUser:true});
  sorted.sort((a,b)=>b.xp-a.xp);
  // Reuse render logic with real data
  const userRank=sorted.findIndex(c=>c.isUser)+1;
  document.getElementById('lbBanner').innerHTML=
    `<div class="lb-league-icon" style="color:${L.color}">${L.icon}</div>`+
    `<div class="lb-league-info"><div class="lb-league-name" style="color:${L.color}">Liga ${L.name}</div>`+
    `<div class="lb-league-desc">${getLeagueDesc(st.league,userRank,sorted.length)} <span style="font-size:.7rem;color:var(--sage)">· Ranking real</span></div></div>`;
  const end=getWeekEndDate();const diff=end-new Date();const days=Math.floor(diff/864e5);const hrs=Math.floor((diff%864e5)/36e5);
  document.getElementById('lbTimer').innerHTML=`<span class="lb-timer-icon">⏳</span> Semana encerra em <strong>${days}d ${hrs}h</strong>`;
  document.getElementById('lbTitle').textContent=`${L.icon} Liga ${L.name}`;
  let html='';
  sorted.forEach((c,i)=>{
    const rank=i+1;const medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'';
    html+=`<div class="lb-row ${c.isUser?'lb-row-user':''}"><div class="lb-rank">${medal||rank}</div><div class="lb-avatar">${c.avatar}</div><div class="lb-name">${c.isUser?'<strong>Você</strong>':c.name}</div><div class="lb-xp">${c.xp.toLocaleString('pt-BR')} XP</div></div>`
  });
  document.getElementById('lbTable').innerHTML=html;
  document.getElementById('lbRules').innerHTML=
    `<div class="lb-rules-title">Como funciona</div>`+
    `<div class="lb-rule">🌐 Ranking real com outros alunos da plataforma</div>`+
    `<div class="lb-rule">📅 Rankings resetam toda segunda-feira</div>`+
    `<div class="lb-rule">⭐ Ganhe XP completando aulas, quizzes e maratonas</div>`+
    `<div class="lb-leagues-row">${LEAGUES.map((l,i)=>`<span class="lb-league-chip${i===st.league?' active':''}" style="${i===st.league?'background:'+l.color:''}"><span>${l.icon}</span><span>${l.name}</span></span>`).join('')}</div>`
}

function renderLeaderboard(){
  const st=getLBState();
  const L=LEAGUES[st.league];
  const sorted=[...st.competitors].sort((a,b)=>b.xp-a.xp);
  const userRank=sorted.findIndex(c=>c.isUser)+1;

  // Banner
  document.getElementById('lbBanner').innerHTML=
    `<div class="lb-league-icon" style="color:${L.color}">${L.icon}</div>`+
    `<div class="lb-league-info">`+
      `<div class="lb-league-name" style="color:${L.color}">Liga ${L.name}</div>`+
      `<div class="lb-league-desc">${getLeagueDesc(st.league,userRank,sorted.length)}</div>`+
    `</div>`;

  // Timer
  const end=getWeekEndDate();
  const now=new Date();
  const diff=end-now;
  const days=Math.floor(diff/864e5);
  const hrs=Math.floor((diff%864e5)/36e5);
  document.getElementById('lbTimer').innerHTML=
    `<span class="lb-timer-icon">⏳</span> Semana encerra em <strong>${days}d ${hrs}h</strong>`;

  // Title
  document.getElementById('lbTitle').textContent=`${L.icon} Liga ${L.name}`;

  // Table
  let html='';
  sorted.forEach((c,i)=>{
    const rank=i+1;
    const isPromo=L.promote>0&&rank<=L.promote&&st.league<LEAGUES.length-1;
    const isDemo=L.demote>0&&rank>sorted.length-L.demote&&st.league>0;
    const medal=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'';
    const cls=c.isUser?'lb-row-user':'';
    const zone=isPromo?'lb-row-promote':isDemo?'lb-row-demote':'';
    html+=`<div class="lb-row ${cls} ${zone}">`+
      `<div class="lb-rank">${medal||rank}</div>`+
      `<div class="lb-avatar">${c.avatar}</div>`+
      `<div class="lb-name">${c.isUser?'<strong>Você</strong>':c.name}</div>`+
      `<div class="lb-xp">${c.xp.toLocaleString('pt-BR')} XP</div>`+
    `</div>`
  });
  document.getElementById('lbTable').innerHTML=html;

  // Rules
  const promoText=st.league<LEAGUES.length-1?`<div class="lb-rule lb-rule-up">🔼 Top ${L.promote} sobem para <strong>${LEAGUES[st.league+1].icon} ${LEAGUES[st.league+1].name}</strong></div>`:'<div class="lb-rule lb-rule-up">🏆 Você está na liga máxima!</div>';
  const demoText=st.league>0?`<div class="lb-rule lb-rule-down">🔽 Últimos ${L.demote} descem para <strong>${LEAGUES[st.league-1].icon} ${LEAGUES[st.league-1].name}</strong></div>`:'';
  document.getElementById('lbRules').innerHTML=
    `<div class="lb-rules-title">Como funciona</div>`+promoText+demoText+
    `<div class="lb-rule">📅 Rankings resetam toda segunda-feira</div>`+
    `<div class="lb-rule">⭐ Ganhe XP completando aulas, quizzes e maratonas</div>`+
    `<div class="lb-leagues-row">${LEAGUES.map((l,i)=>`<span class="lb-league-chip${i===st.league?' active':''}" style="${i===st.league?'background:'+l.color:''}"><span>${l.icon}</span><span>${l.name}</span></span>`).join('')}</div>`
}

function renderLeaderboardWidget(){
  const el=document.getElementById('leaderboardWidget');
  if(!el)return;
  try{
    const st=getLBState();
    const L=LEAGUES[st.league];
    const sorted=[...st.competitors].sort((a,b)=>b.xp-a.xp);
    const userRank=sorted.findIndex(c=>c.isUser)+1;
    const top3=sorted.slice(0,3);
    const end=getWeekEndDate();const diff=end-new Date();const days=Math.floor(diff/864e5);
    el.innerHTML=`<div class="lb-widget" onclick="goLeaderboard()" style="cursor:pointer">`+
      `<div class="lb-widget-head"><span style="color:${L.color}">${L.icon} Liga ${L.name}</span><span class="lb-widget-timer">${days}d restantes</span></div>`+
      `<div class="lb-widget-body">`+
        top3.map((c,i)=>`<div class="lb-widget-row${c.isUser?' lb-widget-you':''}">`+
          `<span class="lb-widget-rank">${['🥇','🥈','🥉'][i]}</span>`+
          `<span class="lb-widget-name">${c.isUser?'Você':c.name}</span>`+
          `<span class="lb-widget-xp">${c.xp.toLocaleString('pt-BR')} XP</span></div>`).join('')+
        (userRank>3?`<div class="lb-widget-row lb-widget-you"><span class="lb-widget-rank">${userRank}°</span><span class="lb-widget-name">Você</span><span class="lb-widget-xp">${st.userWeekXP.toLocaleString('pt-BR')} XP</span></div>`:'')+
      `</div>`+
      `<div class="lb-widget-foot">Ver ranking completo →</div>`+
    `</div>`;
  }catch(e){el.innerHTML=''}
}

function getLeagueDesc(league,rank,total){
  const L=LEAGUES[league];
  if(L.promote>0&&rank<=L.promote)return '🔥 Zona de promoção! Continue assim!';
  if(L.demote>0&&rank>total-L.demote)return '⚠️ Zona de rebaixamento — estude mais!';
  return `Posição ${rank}° de ${total} estudantes`
}

// Attach to window
window.LEAGUES=LEAGUES;
window.LB_KEY=LB_KEY;
window.LB_NAMES=LB_NAMES;
window.LB_AVATARS=LB_AVATARS;
window.getLBState=getLBState;
window.saveLBState=saveLBState;
window.getCurrentWeekId=getCurrentWeekId;
window.getWeekEndDate=getWeekEndDate;
window.initLeaderboardWeek=initLeaderboardWeek;
window.generateCompetitors=generateCompetitors;
window.updateLeaderboardXP=updateLeaderboardXP;
window._syncLeaderboardXP=_syncLeaderboardXP;
window._fetchRealLeaderboard=_fetchRealLeaderboard;
window.goLeaderboard=goLeaderboard;
window.renderLeaderboardReal=renderLeaderboardReal;
window.renderLeaderboard=renderLeaderboard;
window.renderLeaderboardWidget=renderLeaderboardWidget;
window.getLeagueDesc=getLeagueDesc;
