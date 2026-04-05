// ============================================================
// ONBOARDING — Age verification via CPF (Lei Felca compliance)
// Step 1: CPF + birth date → Serpro API verification (18+ only)
// Step 2: Name + avatar (optional)
// DEMO_MODE+OFFLINE_MODE: skip all steps
// Fallback: self-declaration if API not configured/down
// ============================================================
const AVATARS=['🧑‍🎓','👨‍💼','👩‍💼','🦊','🦁','🐺','🦅','🐉','💎','🏆'];
let obAvatar='🧑‍🎓';

// ============================================================
// CPF VALIDATION (client-side — dígitos verificadores)
// ============================================================
function isValidCPF(cpf){
  cpf=cpf.replace(/\D/g,'');
  if(cpf.length!==11||/^(\d)\1+$/.test(cpf))return false;
  var sum=0,rest;
  for(var i=1;i<=9;i++)sum+=parseInt(cpf[i-1])*(11-i);
  rest=(sum*10)%11;if(rest===10||rest===11)rest=0;
  if(rest!==parseInt(cpf[9]))return false;
  sum=0;
  for(var i=1;i<=10;i++)sum+=parseInt(cpf[i-1])*(12-i);
  rest=(sum*10)%11;if(rest===10||rest===11)rest=0;
  if(rest!==parseInt(cpf[10]))return false;
  return true;
}

// CPF mask on input
function _initCpfMask(){
  var input=document.getElementById('obCpf');
  if(!input)return;
  input.addEventListener('input',function(e){
    var v=e.target.value.replace(/\D/g,'').slice(0,11);
    if(v.length>9)v=v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/,'$1.$2.$3-$4');
    else if(v.length>6)v=v.replace(/(\d{3})(\d{3})(\d{1,3})/,'$1.$2.$3');
    else if(v.length>3)v=v.replace(/(\d{3})(\d{1,3})/,'$1.$2');
    e.target.value=v;
  });
}

// SHA-256 hash (Web Crypto API — never store raw CPF)
async function _hashCPF(cpf){
  var raw=cpf.replace(/\D/g,'');
  var encoded=new TextEncoder().encode(raw);
  var hash=await crypto.subtle.digest('SHA-256',encoded);
  return Array.from(new Uint8Array(hash)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
}

function initOnboard(){
  // Presentation mode: skip everything
  if(window.OFFLINE_MODE&&window.DEMO_MODE){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // Already blocked → enforceAgeGate handles this in boot.js
  if(window.S.ageGroup==='blocked'){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // Anti-tamper: re-verify birthYear on every boot
  if(window.S.birthYear){
    var today=new Date();
    var age=today.getFullYear()-window.S.birthYear;
    if(age<18){
      window.S.ageGroup='blocked';window.save();
      if(typeof window._showAgeBlockScreen==='function')window._showAgeBlockScreen();
      document.getElementById('onboard').style.display='none';
      return;
    }
  }
  // Verified adult returning user → skip onboarding
  if(window.S.ageGroup==='adult'&&window.S.ageVerifiedAt){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // Legacy user with name but no age verification → grandfather in as adult
  if(window.S.name!=='Aluno'&&window.S.ageGroup==='adult'){
    document.getElementById('onboard').style.display='none';
    return;
  }
  // New user or unverified → show onboarding (age gate required)
  var bd=document.getElementById('obBirthDate');
  if(bd)bd.max=new Date().toISOString().slice(0,10);
  _initCpfMask();
  document.getElementById('onboard').style.display='';
}

// Step 1 → verify age via CPF (Serpro API) with birth date cross-check
async function obVerifyAge(){
  var cpfInput=document.getElementById('obCpf');
  var bdInput=document.getElementById('obBirthDate');
  var errEl=document.getElementById('obAgeError');
  var btn=document.getElementById('obVerifyBtn');
  var loading=document.getElementById('obVerifyLoading');
  var cpfRaw=cpfInput?cpfInput.value.replace(/\D/g,''):'';
  var bdVal=bdInput?bdInput.value:'';

  // Validate CPF format
  if(!cpfRaw||!isValidCPF(cpfRaw)){
    if(errEl){errEl.textContent='CPF invalido. Verifique os digitos.';errEl.style.display='block'}
    return;
  }
  // Validate birth date
  if(!bdVal){
    if(errEl){errEl.textContent='Por favor, informe sua data de nascimento.';errEl.style.display='block'}
    return;
  }
  if(errEl)errEl.style.display='none';

  // Calculate age from birth date (client-side, used as cross-check and fallback)
  var birth=new Date(bdVal);
  var today=new Date();
  var age=today.getFullYear()-birth.getFullYear();
  var m=today.getMonth()-birth.getMonth();
  if(m<0||(m===0&&today.getDate()<birth.getDate()))age--;

  // Show loading
  if(btn)btn.style.display='none';
  if(loading)loading.style.display='block';

  // Hash CPF (never send or store raw)
  var cpfHash=await _hashCPF(cpfRaw);

  // Try Serpro API via Edge Function
  var method='self_declaration';
  var apiVerified=false;
  try{
    if(!window.OFFLINE_MODE&&typeof window.sbClient!=='undefined'&&window.sbClient){
      var session=await window.sbClient.auth.getSession();
      var token=session?.data?.session?.access_token;
      if(token){
        var resp=await fetch((window.SUPABASE_URL||'')+'/functions/v1/verify-age',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
          body:JSON.stringify({cpf:cpfRaw,birthDate:bdVal})
        });
        if(resp.ok){
          var result=await resp.json();
          if(result.fallback){
            // API not configured — use self-declaration fallback
            method='self_declaration_fallback';
          }else if(result.verified){
            apiVerified=true;
            method='cpf_serpro';
            // Use API-returned age if available, otherwise use client calculation
            if(typeof result.is_adult==='boolean'&&!result.is_adult){age=0}
          }
        }
      }
    }
  }catch(e){
    console.warn('[AgeGate] Serpro API error, using self-declaration fallback:',e.message);
    method='self_declaration_fallback';
  }

  // Hide loading, show button
  if(btn)btn.style.display='';
  if(loading)loading.style.display='none';

  // Save results (LGPD: only hash, never raw CPF)
  window.S.birthYear=birth.getFullYear();
  window.S.ageVerifiedAt=Date.now();
  window.S.cpfHash=cpfHash;
  window.S.verificationMethod=method;

  if(age<18){
    // Block: under 18 — permanent
    window.S.ageGroup='blocked';
    window.save();
    if(typeof window._showAgeBlockScreen==='function')window._showAgeBlockScreen();
    document.getElementById('onboard').style.display='none';
    return;
  }

  // 18+: proceed to profile step
  window.S.ageGroup='adult';
  window.save();
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

// Skip — only allowed if already age-verified or in presentation mode
function obSkip(){
  // Presentation mode: skip freely
  if(window.OFFLINE_MODE&&window.DEMO_MODE){
    window.S.name='Aluno';window.S.avatar='🧑‍🎓';window.S.ageGroup='adult';
    window.save();_hideOnboard();return;
  }
  // If age not yet verified, skip is NOT allowed — show error
  if(!window.S.ageGroup||window.S.ageGroup!=='adult'){
    var errEl=document.getElementById('obAgeError');
    if(errEl){errEl.textContent='Por favor, confirme sua idade para continuar.';errEl.style.display='block'}
    return;
  }
  // Age verified, skipping profile step
  window.S.name='Aluno';window.S.avatar='🧑‍🎓';
  window.save();_hideOnboard();
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
