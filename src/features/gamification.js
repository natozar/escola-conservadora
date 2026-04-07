// ============================================================
// GAMIFICATION — Weekly Missions, Badges, Exam/Simulado
// Extracted from app.js
// ============================================================

// ============================================================
// WEEKLY MISSIONS
// ============================================================
const MISSIONS_KEY='escola_missions';
function getWeekId(){const d=new Date();const jan1=new Date(d.getFullYear(),0,1);return d.getFullYear()+'-W'+Math.ceil(((d-jan1)/864e5+jan1.getDay()+1)/7)}
function getMissions(){
  let stored;try{stored=JSON.parse(localStorage.getItem(MISSIONS_KEY)||'{}')}catch(e){stored={}}
  const wk=getWeekId();
  if(stored.week===wk)return stored;
  const missions={week:wk,claimed:[],list:[
    {id:'lessons5',name:'Complete 5 aulas',target:5,icon:'📚',xp:75},
    {id:'quiz3row',name:'Acerte 3 quizzes seguidos',target:3,icon:'🎯',xp:50},
    {id:'streak3',name:'Estude 3 dias seguidos',target:3,icon:'🔥',xp:60}
  ]};
  localStorage.setItem(MISSIONS_KEY,JSON.stringify(missions));return missions
}
function getMissionProgress(m){
  if(m.id==='lessons5')return Math.min(m.target,Object.keys(window.S.done).length);
  if(m.id==='streak3')return Math.min(m.target,window.S.streak);
  if(m.id==='quiz3row'){
    let streak=0,max=0;const keys=Object.keys(window.S.quiz).sort();
    for(const k of keys){if(window.S.quiz[k]){streak++;max=Math.max(max,streak)}else streak=0}
    return Math.min(m.target,max)
  }
  return 0
}
function renderMissions(){
  const data=getMissions();
  const daysLeft=7-new Date().getDay();
  var completed=0,claimable=0;
  data.list.forEach(function(m){var prog=getMissionProgress(m);if(prog>=m.target){completed++;if(!data.claimed.includes(m.id))claimable++}});
  var isMobile=window.innerWidth<=768;
  var html='<div class="missions-card missions-compact'+(isMobile?'':' expanded')+'" onclick="this.classList.toggle(\'expanded\')">';
  html+='<div class="missions-head">🎯 <span>Missões Semanais</span><span class="missions-summary">'+(claimable>0?claimable+' para resgatar':completed+'/'+data.list.length)+'</span><span class="missions-timer">'+daysLeft+'d</span><span class="missions-chevron">›</span></div>';
  html+='<div class="missions-expand-body" onclick="event.stopPropagation()">';
  data.list.forEach(function(m){
    var prog=getMissionProgress(m),pct=Math.round(prog/m.target*100),done=prog>=m.target,claimed=data.claimed.includes(m.id);
    var mAction=m.id==='lessons5'?'goNextLesson()':m.id==='quiz3row'?'goNextQuiz()':'goDash()';
    html+='<div class="mission'+(done?' done':'')+'" onclick="'+(done&&!claimed?'':mAction)+'" style="cursor:pointer"><div class="mission-icon">'+m.icon+'</div><div class="mission-info"><div class="mission-name">'+m.name+'</div><div class="mission-prog">'+prog+'/'+m.target+(claimed?' · ✓':'')+'</div><div class="mission-bar"><div class="mission-fill" style="width:'+pct+'%'+(done?';background:var(--honey)':'')+'"></div></div></div><div class="mission-xp">'+(done&&!claimed?'<button class="btn btn-sage" style="font-size:.7rem;padding:.25rem .6rem" onclick="event.stopPropagation();claimMission(\''+m.id+'\','+m.xp+')">+'+m.xp+' XP</button>':'+'+m.xp+' XP')+'</div></div>';
  });
  html+='</div></div>';
  document.getElementById('missionsSection').innerHTML=html;
}
function goNextLesson(){
  for(let mi=0;mi<window.M.length;mi++){if(!window.isModUnlocked(mi))continue;for(let li=0;li<window.M[mi].lessons.length;li++){if(!window.S.done[`${mi}-${li}`]){window.openL(mi,li);return}}}
  window.toast('🏆 Todas as aulas concluídas!');
}
function goNextQuiz(){
  for(let mi=0;mi<window.M.length;mi++){if(!window.isModUnlocked(mi))continue;for(let li=0;li<window.M[mi].lessons.length;li++){if(window.M[mi].lessons[li].quiz&&window.S.quiz[`${mi}-${li}`]===undefined){window.openL(mi,li);return}}}
  window.toast('🎯 Todos os quizzes respondidos!');
}
function claimMission(id,xp){
  const data=getMissions();
  if(!data.claimed.includes(id)){data.claimed.push(id);localStorage.setItem(MISSIONS_KEY,JSON.stringify(data));window.addXP(xp);window.toast(`🎯 +${xp} XP — Missão completa!`);renderMissions()}
}

// ============================================================
// BADGES / ACHIEVEMENTS PAGE
// ============================================================
function getAllBadges(){
  const totalL=window.M.reduce((s,m)=>s+m.lessons.length,0);
  const totalQ=totalL;
  const half=Math.floor(totalL/2);
  const LB_KEY=window.LB_KEY||'escola_leaderboard';
  const FAV_KEY=window.FAV_KEY||'escola_favs';
  const badges=[
    {id:'first',e:'🎯',n:'Primeira Aula',d:'Complete sua primeira aula',check:()=>Object.keys(window.S.done).length>=1},
    {id:'five',e:'💡',n:'Curioso',d:'Complete 5 aulas',check:()=>Object.keys(window.S.done).length>=5},
    {id:'ten',e:'📚',n:'Estudioso',d:'Complete 10 aulas',check:()=>Object.keys(window.S.done).length>=10},
    {id:'twenty',e:'🔥',n:'Dedicado',d:'Complete 20 aulas',check:()=>Object.keys(window.S.done).length>=20},
    {id:'thirty',e:'💪',n:'Incansável',d:'Complete 30 aulas',check:()=>Object.keys(window.S.done).length>=30},
    {id:'half',e:'🌟',n:'Meio Caminho',d:`Complete ${half} de ${totalL} aulas`,check:()=>Object.keys(window.S.done).length>=half}
  ];
  // Dynamic module badges
  window.M.forEach((m,i)=>{
    badges.push({id:'mod'+i,e:m.icon,n:m.title,d:`Conclua "${m.title}"`,check:()=>window.M[i].lessons.every((_,li)=>window.S.done[`${i}-${li}`])});
  });
  // Discipline badges
  Object.entries(window.DISCIPLINES).forEach(([key,d])=>{
    const mods=window.getDiscModules(key);
    if(mods.length===0)return;
    badges.push({id:'disc_'+key,e:'🏆',n:d.label+' Completa',d:`Conclua todos os módulos de ${d.label}`,check:()=>mods.every(x=>x.mod.lessons.every((_,li)=>window.S.done[`${x.idx}-${li}`]))});
  });
  badges.push(
    {id:'streak3',e:'🔥',n:'3 Dias Seguidos',d:'Mantenha uma sequência de 3 dias',check:()=>window.S.streak>=3},
    {id:'streak7',e:'🔥',n:'Semana Perfeita',d:'7 dias consecutivos',check:()=>window.S.streak>=7},
    {id:'streak30',e:'💎',n:'Mês de Fogo',d:'30 dias consecutivos',check:()=>window.S.streak>=30},
    {id:'quiz80',e:'🎯',n:'Precisão 80%',d:'80%+ de acerto nos quizzes',check:()=>{const qt=Object.keys(window.S.quiz).length;const qc=Object.values(window.S.quiz).filter(v=>v).length;return qt>=10&&qc/qt>=.8}},
    {id:'quiz100',e:'💯',n:'Perfeição',d:'100% de acerto em todos os quizzes',check:()=>Object.keys(window.S.quiz).length>=totalQ&&Object.values(window.S.quiz).every(v=>v)},
    {id:'lvl3',e:'📈',n:'Nível 3',d:'Alcance o nível 3',check:()=>window.S.lvl>=3},
    {id:'lvl5',e:'📈',n:'Nível 5',d:'Alcance o nível 5',check:()=>window.S.lvl>=5},
    {id:'lvl10',e:'👑',n:'Nível 10',d:'Alcance o nível 10',check:()=>window.S.lvl>=10},
    {id:'master',e:'👑',n:'Mestre Total',d:`Complete todas as ${totalL} aulas`,check:()=>Object.keys(window.S.done).length>=totalL},
    {id:'notes5',e:'📝',n:'Anotador',d:'Faça anotações em 5 aulas',check:()=>{try{const n=JSON.parse(localStorage.getItem('escola_notes')||'{}');return Object.keys(n).length>=5}catch(e){return false}}},
    {id:'favs3',e:'⭐',n:'Colecionador',d:'Adicione 3 favoritos',check:()=>{try{return(JSON.parse(localStorage.getItem(FAV_KEY)||'[]')).length>=3}catch(e){return false}}},
    {id:'league_silver',e:'🥈',n:'Liga Prata',d:'Alcance a Liga Prata',check:()=>{try{const lb=JSON.parse(localStorage.getItem(LB_KEY)||'{}');return(lb.league||0)>=1}catch(e){return false}}},
    {id:'league_gold',e:'🥇',n:'Liga Ouro',d:'Alcance a Liga Ouro',check:()=>{try{const lb=JSON.parse(localStorage.getItem(LB_KEY)||'{}');return(lb.league||0)>=2}catch(e){return false}}},
    {id:'league_diamond',e:'💎',n:'Liga Diamante',d:'Alcance a Liga Diamante',check:()=>{try{const lb=JSON.parse(localStorage.getItem(LB_KEY)||'{}');return(lb.league||0)>=3}catch(e){return false}}},
    {id:'league_ruby',e:'❤️‍🔥',n:'Liga Rubi',d:'Alcance a liga máxima',check:()=>{try{const lb=JSON.parse(localStorage.getItem(LB_KEY)||'{}');return(lb.league||0)>=4}catch(e){return false}}}
  );
  return badges;
}
const ALL_BADGES=[];
function goBadges(){
  window.hideAllViews();window.setNav('nBadges');
  document.getElementById('vBadges').classList.add('on');
  window.renderBackLink('vBadges','Voltar');
  const badges=getAllBadges();
  const unlocked=badges.filter(b=>b.check()).length;
  const total=badges.length;
  const pct=Math.round(unlocked/total*100);
  document.getElementById('badgesProgress').innerHTML=`<div class="bp-num">${unlocked}/${total}</div><div class="bp-info"><div class="bp-label">${pct}% das conquistas desbloqueadas</div><div class="bp-bar"><div class="bp-fill" style="width:${pct}%"></div></div></div>`;
  document.getElementById('badgesGrid').innerHTML=badges.map(b=>{
    const on=b.check();
    const safeName=b.n.replace(/'/g,"\\'");
    const badgeAction=on?`onclick="toast('${b.e} ${safeName} — Conquista desbloqueada!')"`:b.id.startsWith('mod')?`onclick="goMod(${b.id.replace('mod','')})"`:b.id==='first'||b.id==='five'||b.id==='ten'||b.id==='twenty'||b.id==='thirty'||b.id==='half'||b.id==='master'?`onclick="goNextLesson()"`:b.id.startsWith('streak')?`onclick="goDash()"`:b.id.startsWith('quiz')?`onclick="goNextQuiz()"`:`onclick="goDash()"`;

    return`<div class="badge-card ${on?'unlocked':'locked'}" ${badgeAction} style="cursor:pointer"><span class="badge-icon">${b.e}</span><div class="badge-name">${b.n}</div><div class="badge-desc">${b.d}</div>${on?'<div class="badge-check">✓</div>':'<div class="badge-hint">Toque para avançar →</div>'}</div>`
  }).join('')
}

// ============================================================
// EXAM / SIMULADO
// ============================================================
let examQs=[],examAns=[],examIdx=0;
function startExam(){
  window.hideAllViews();window.setNav('nExam');
  document.getElementById('vExam').classList.add('on');
  examQs=[];examAns=[];examIdx=0;
  // Pick 2-3 questions per module randomly
  window.M.forEach((m,mi)=>{
    const available=m.lessons.filter(l=>l.quiz).map((l,li)=>({mi,li,q:l.quiz,mod:m.title,icon:m.icon}));
    const shuffled=available.sort(()=>Math.random()-.5).slice(0,3);
    examQs.push(...shuffled)
  });
  examQs.sort(()=>Math.random()-.5);
  examAns=new Array(examQs.length).fill(-1);
  renderExamQ()
}
function renderExamQ(){
  if(examIdx>=examQs.length){renderExamResult();return}
  const q=examQs[examIdx];
  const pct=Math.round(examIdx/examQs.length*100);
  document.getElementById('examContent').innerHTML=`
    <div class="exam-progress"><div class="exam-pbar"><div class="exam-pfill" style="width:${pct}%"></div></div><div class="exam-count">${examIdx+1}/${examQs.length}</div></div>
    <div class="exam-q"><div class="eq-mod">${q.icon} ${q.mod}</div><h3>${q.q.q}</h3></div>
    <div class="exam-opts">${q.q.o.map((o,i)=>`<button class="exam-o${examAns[examIdx]===i?' sel':''}" onclick="examSelect(${i})">${o}</button>`).join('')}</div>
    <div class="exam-nav"><button class="btn btn-ghost" onclick="examNav(-1)" ${examIdx===0?'disabled':''}>← Anterior</button><button class="btn btn-sage" onclick="examNav(1)">${examIdx===examQs.length-1?'Finalizar':'Próxima →'}</button></div>`
}
function examSelect(i){examAns[examIdx]=i;renderExamQ()}
function examNav(dir){
  if(dir===1&&examIdx===examQs.length-1){renderExamResult();return}
  examIdx=Math.max(0,Math.min(examQs.length-1,examIdx+dir));renderExamQ()
}
function renderExamResult(){
  let correct=0;const byMod={};
  examQs.forEach((q,i)=>{
    const ok=examAns[i]===q.q.c;if(ok)correct++;
    const k=q.mi;if(!byMod[k])byMod[k]={ok:0,total:0,icon:q.icon,name:q.mod};
    byMod[k].total++;if(ok)byMod[k].ok++
  });
  const pct=Math.round(correct/examQs.length*100);
  const pass=pct>=70;
  let html=`<div class="exam-result"><h2>${pass?'Aprovado!':'Continue Estudando'}</h2><div class="exam-grade ${pass?'pass':'fail'}">${pct}%</div><p style="color:var(--text-secondary);margin-bottom:.5rem">${correct}/${examQs.length} questões corretas</p><div class="exam-breakdown">`;
  Object.values(byMod).forEach(m=>{
    html+=`<div class="exam-bmod"><span class="exam-bmod-icon">${m.icon}</span><span class="exam-bmod-info">${m.name}</span><span class="exam-bmod-score">${m.ok}/${m.total}</span></div>`
  });
  html+=`</div><div style="margin-top:1.5rem;display:flex;gap:.75rem;justify-content:center"><button class="btn btn-sage" onclick="startExam()">Novo Simulado</button><button class="btn btn-ghost" onclick="goDash()">Dashboard</button></div></div>`;
  document.getElementById('examContent').innerHTML=html;
  if(pass)window.launchConfetti();
  window.logActivity('exam',`Simulado: ${pct}%`)
}
function endExam(){window.goDash()}

// Attach to window
window.getWeekId=getWeekId;
window.getMissions=getMissions;
window.getMissionProgress=getMissionProgress;
window.renderMissions=renderMissions;
window.goNextLesson=goNextLesson;
window.goNextQuiz=goNextQuiz;
window.claimMission=claimMission;
window.getAllBadges=getAllBadges;
window.ALL_BADGES=ALL_BADGES;
window.goBadges=goBadges;
window.startExam=startExam;
window.renderExamQ=renderExamQ;
window.examSelect=examSelect;
window.examNav=examNav;
window.renderExamResult=renderExamResult;
window.endExam=endExam;
