// ============================================================
// ONBOARDING — Age verification (18+ only)
// Step 1: Date of birth → must be 18+
// Step 2: Name + avatar (optional)
// DEMO_MODE/OFFLINE_MODE: skip all steps
// ============================================================
const AVATARS=['🧑‍🎓','👨‍💼','👩‍💼','🦊','🦁','🐺','🦅','🐉','💎','🏆'];
let obAvatar='🧑‍🎓';

function initOnboard(){
  // Skip if user already has age verified (returning user)
  if(window.S.name!=='Aluno'&&window.S.ageVerifiedAt){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // Skip if user already has a name but no age verification (legacy user — grandfather in)
  if(window.S.name!=='Aluno'){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // DEMO_MODE or OFFLINE_MODE: auto-skip onboarding
  if(window.DEMO_MODE||window.OFFLINE_MODE){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // Set max date on birth input (today)
  var bd=document.getElementById('obBirthDate');
  if(bd)bd.max=new Date().toISOString().slice(0,10);
}

// Step 1 → verify age from date of birth (must be 18+)
function obVerifyAge(){
  var bd=document.getElementById('obBirthDate');
  var errEl=document.getElementById('obAgeError');
  if(!bd||!bd.value){
    if(errEl){errEl.textContent='Por favor, informe sua data de nascimento.';errEl.style.display='block'}
    return;
  }
  var birth=new Date(bd.value);
  var today=new Date();
  var age=today.getFullYear()-birth.getFullYear();
  var m=today.getMonth()-birth.getMonth();
  if(m<0||(m===0&&today.getDate()<birth.getDate()))age--;

  // Save only birth year (LGPD data minimization)
  window.S.birthYear=birth.getFullYear();
  window.S.ageVerifiedAt=Date.now();

  if(age<18){
    // Block: under 18
    window.S.ageGroup='blocked';
    window.save();
    if(errEl){errEl.innerHTML='<strong>Acesso restrito.</strong> Esta plataforma e exclusiva para maiores de 18 anos.';errEl.style.display='block'}
    return;
  }

  // 18+: proceed to profile step
  window.S.ageGroup='adult';
  if(errEl)errEl.style.display='none';
  _showObStep('obStep3Profile');
  _initProfileStep();
}

// Helper: show specific onboarding step, hide others
function _showObStep(stepId){
  var steps=document.querySelectorAll('.onboard-step');
  steps.forEach(function(s){s.classList.remove('active')});
  var target=document.getElementById(stepId);
  if(target)target.classList.add('active');
}

// Initialize profile step (avatar picker)
function _initProfileStep(){
  var avatarsEl=document.getElementById('obAvatars');
  if(avatarsEl){
    avatarsEl.innerHTML=AVATARS.map(function(a,i){
      return'<div class="onboard-av'+(i===0?' selected':'')+'" onclick="selectAvatar(\''+a+'\',this)">'+a+'</div>';
    }).join('');
  }
  var nameInput=document.getElementById('obName');
  if(nameInput)nameInput.focus();
}

function selectAvatar(a,el){
  obAvatar=a;
  document.querySelectorAll('.onboard-av').forEach(function(e){e.classList.remove('selected')});
  el.classList.add('selected');
}

// Quick finish — save name + avatar and go to dashboard
function obQuickFinish(){
  try{
    var name=document.getElementById('obName').value.trim();
    window.S.name=name||'Aluno';
    window.S.avatar=obAvatar;
    window.S.ageGroup=window.S.ageGroup||'adult';
    window.save();
    if(typeof window.gtag==='function')window.gtag('event','onboarding_complete',{name:window.S.name,mode:'quick',ageGroup:window.S.ageGroup});
    _hideOnboard();
  }catch(e){console.error('[obQuickFinish]',e.message);_hideOnboard()}
}

// Skip — use defaults and go straight to dashboard
function obSkip(){
  window.S.name='Aluno';
  window.S.avatar='🧑‍🎓';
  window.S.ageGroup=window.S.ageGroup||'adult';
  window.save();
  _hideOnboard();
}

function _hideOnboard(){
  var el=window._origById('onboard');
  if(el){
    el.classList.add('hide');
    setTimeout(function(){el.style.display='none';
      setTimeout(function(){if(typeof window.preloadModules==='function')window.preloadModules()},1000);
    },400);
  }
  window.goDash();
}

// Legacy compat
function obNext(step){obVerifyAge()}
function obFinish(){obQuickFinish()}
function selectAge(){}
function selectObLang(){}

// ============================================================
// PAYWALL — shows upgrade prompt for premium modules
// DEMO_MODE: this function exists but is never called (isModUnlocked returns true)
// ============================================================
function showModulePaywall(modIdx){
  if(document.getElementById('paywallModal'))return;
  var overlay=document.createElement('div');
  overlay.id='paywallModal';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.innerHTML='<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;max-width:400px;width:100%;padding:2rem;text-align:center">'
    +'<div style="font-size:2.5rem;margin-bottom:.75rem">🔒</div>'
    +'<h2 style="font-size:1.2rem;margin-bottom:.5rem">Modulo Premium</h2>'
    +'<p style="color:var(--text-secondary);font-size:.9rem;margin-bottom:1.25rem;line-height:1.5">Este modulo faz parte do plano premium. Assine para desbloquear todos os modulos e funcionalidades.</p>'
    +'<a href="perfil.html#planos" class="btn btn-sage" style="width:100%;margin-bottom:.75rem">Ver Planos</a>'
    +'<button class="btn btn-ghost" onclick="document.getElementById(\'paywallModal\').remove()" style="width:100%;font-size:.85rem">Voltar</button>'
    +'</div>';
  document.body.appendChild(overlay);
}

// Attach to window
window.AVATARS=AVATARS;
window.initOnboard=initOnboard;
window.obVerifyAge=obVerifyAge;
window.selectAvatar=selectAvatar;
window.selectAge=selectAge;
window.selectObLang=selectObLang;
window.obNext=obNext;
window.obFinish=obFinish;
window.obQuickFinish=obQuickFinish;
window.obSkip=obSkip;
window.showModulePaywall=showModulePaywall;
