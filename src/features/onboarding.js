// ============================================================
// ONBOARDING — extracted from app.js lines 1260-1334
// ============================================================
const AVATARS=['🧑‍🎓','👨‍💼','👩‍💼','🦊','🦁','🐺','🦅','🐉','💎','🏆'];
let obAvatar='🧑‍🎓';
let obAgeGroup='';
let obLangPref='pt';
function initOnboard(){
  // If user already completed onboarding (has name AND age group), skip entirely
  if(window.S.name!=='Aluno' && window.S.ageGroup){document.getElementById('onboard').style.display='none';return}

  // Render avatar picker
  document.getElementById('obAvatars').innerHTML=AVATARS.map((a,i)=>
    `<div class="onboard-av${i===0?' selected':''}" onclick="selectAvatar('${a}',this)">${a}</div>`
  ).join('');

  // If name+email already filled (e.g. from Google OAuth via onSignIn),
  // skip step 1 and go directly to step 2 (age group)
  if(window.S.name && window.S.name!=='Aluno' && window.S.email){
    document.getElementById('obStep1').classList.remove('active');
    document.getElementById('obStep2').classList.add('active');
    return;
  }

  // Pre-fill fields if partial data available (e.g. name from Google but checking again)
  var nameInput=document.getElementById('obName');
  var emailInput=document.getElementById('obEmail');
  if(window.S.name && window.S.name!=='Aluno' && nameInput) nameInput.value=window.S.name;
  if(window.S.email && emailInput) emailInput.value=window.S.email;

  if(nameInput)nameInput.focus()
}
function selectAvatar(a,el){
  obAvatar=a;
  document.querySelectorAll('.onboard-av').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected')
}
function selectAge(age,el){
  obAgeGroup=age;
  document.querySelectorAll('.ob-age-btn').forEach(e=>e.classList.remove('active'));
  el.classList.add('active')
}
function selectObLang(lang,el){
  obLangPref=lang;
  document.querySelectorAll('.ob-lang-btn').forEach(e=>e.classList.remove('active'));
  el.classList.add('active')
}
function obNext(step){
  if(step===1){
    const name=document.getElementById('obName').value.trim();
    if(!name){document.getElementById('obName').focus();return}
    window.S.name=name;
    const email=document.getElementById('obEmail').value.trim();
    if(email)window.S.email=email;
    window.save();
    if(email)localStorage.setItem('escola_lead_email',email);
  }
  if(step===2&&!obAgeGroup){window.toast('Selecione sua faixa etária');return}
  if(step===3){
    // Estado (UF)
    const stEl=document.getElementById('obState');
    if(stEl&&stEl.value)window.S.state=stEl.value;
    window.save();
  }
  if(step===4){
    if(typeof setLang==='function')setLang(obLangPref);
  }
  document.getElementById('obStep'+step).classList.remove('active');
  document.getElementById('obStep'+(step+1)).classList.add('active')
}
function obFinish(){
  try{
    window.S.avatar=obAvatar;
    window.S.ageGroup=obAgeGroup;
    window.S.lang=obLangPref;
    if(!window.S.state){const stEl=document.getElementById('obState');if(stEl&&stEl.value)window.S.state=stEl.value}
    window.save();
    // Salvar lead no Supabase
    if(window.S.email&&typeof saveLeadEmail==='function')saveLeadEmail(window.S.email,window.S.name,obAgeGroup,obLangPref);
    if(typeof setLang==='function')setLang(obLangPref);
    if(typeof updateLangToggle==='function')updateLangToggle();
    // GA4: onboarding completo
    if(typeof gtag==='function')gtag('event','onboarding_complete',{name:window.S.name,age_group:obAgeGroup,lang:obLangPref,has_email:!!window.S.email});
    const el=window._origById('onboard');
    if(el){el.classList.add('hide');setTimeout(()=>{el.style.display='none';
      // After onboarding hides, show What's New and PWA modal
      setTimeout(window.checkWhatsNew,800);
      setTimeout(()=>window._showPwaModal(false),2000);
      setTimeout(window.preloadModules,2500);
    },500)}
    window.goDash()
  }catch(e){console.error('[obFinish]',e.message);window.goDash()}
}

// ============================================================
// PAYWALL — shows upgrade prompt for premium modules
// extracted from app.js lines 1336-1353
// ============================================================
function showModulePaywall(modIdx){
  const m=window.M[modIdx];if(!m)return;
  const overlay=document.createElement('div');
  overlay.className='save-modal-overlay';overlay.id='paywallModal';
  overlay.innerHTML=`<div class="save-modal">
    <button class="save-modal-close" onclick="document.getElementById('paywallModal').remove()" aria-label="Fechar">&times;</button>
    <div style="font-size:2.5rem;margin-bottom:.75rem">${m.icon}</div>
    <h2 style="font-size:1.3rem;margin-bottom:.5rem">${m.title}</h2>
    <p style="color:var(--text-secondary);font-size:.9rem;margin-bottom:1.25rem;line-height:1.6">Este módulo faz parte do plano <strong>Premium</strong>. Desbloqueie acesso completo a todas as ${window.M.reduce((s,m)=>s+m.lessons.length,0)} aulas, certificados e ferramentas avançadas.</p>
    <a href="perfil.html#planos" class="btn btn-sage" style="width:100%;margin-bottom:.75rem">Ver Planos — a partir de R$29,90/mês</a>
    <button class="btn btn-ghost" onclick="document.getElementById('paywallModal').remove()" style="width:100%;font-size:.85rem">Voltar</button>
  </div>`;
  document.body.appendChild(overlay);
  if(typeof gtag==='function')gtag('event','paywall_shown',{module:m.title,module_index:modIdx});
}

// Attach to window
window.AVATARS=AVATARS;
window.initOnboard=initOnboard;
window.selectAvatar=selectAvatar;
window.selectAge=selectAge;
window.selectObLang=selectObLang;
window.obNext=obNext;
window.obFinish=obFinish;
window.showModulePaywall=showModulePaywall;
