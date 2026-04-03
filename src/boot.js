// ============================================================
// BOOT SEQUENCE + AUTH + SUPABASE/STRIPE LOADING
// ============================================================

// DEMO_MODE: when true, app opens 100% without auth.
// All modules unlocked, no paywall, no save modal nagging.
// Login only triggered when user clicks "Perfil".
// Set to false to restore normal auth + paywall behavior.
const DEMO_MODE = true;
window.DEMO_MODE = DEMO_MODE;

// Error boundary
let _errCount=0,_errTimer=null;
window.onerror=function(msg,url,line,col,err){
  console.warn('[App warn]',msg,'at line',line);
  _errCount++;
  if(_errTimer)clearTimeout(_errTimer);
  _errTimer=setTimeout(()=>{_errCount=0},2000);
  if(_errCount>=3){
    try{window._origById('errorScreen').style.display='flex'}catch(e){}
  }
  return true
};
window.addEventListener('unhandledrejection',e=>{
  console.error('Unhandled promise:',e.reason);
});

// Service Worker update notification
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',e=>{
    if(!e.data)return;
    if(e.data.type==='SW_UPDATED'){
      window.toast('Atualizado para '+e.data.version+'!','success');
      var lbl=document.getElementById('appVersionLabel');
      if(lbl) lbl.textContent='versão: '+e.data.version;
    }
    if(e.data.type==='SW_VERSION'){
      var lbl=document.getElementById('appVersionLabel');
      if(lbl) lbl.textContent='versão: '+e.data.version;
    }
  })
}

// Browser back/forward
window.addEventListener('popstate',function(e){
  var s=e.state;
  if(!s||!s.view){window.goDash();return}
  if(s.view==='mod'&&window.M[s.mod])window.goMod(s.mod);
  else if(s.view==='lesson'&&window.M[s.mod]&&window.M[s.mod].lessons[s.les])window.openL(s.mod,s.les);
  else if(s.view==='leaderboard')window.goLeaderboard();
  else if(s.view==='studyplan')window.goStudyPlan();
  else window.goDash();
});

// Sync status indicator
let _syncHideTimer=null;
function showSyncStatus(state,msg){
  var el=document.getElementById('syncIndicator');
  if(!el)return;
  el.className='sync-indicator show '+state;
  el.innerHTML='<span class="sync-dot"></span>'+msg;
  clearTimeout(_syncHideTimer);
  if(state==='synced')_syncHideTimer=setTimeout(()=>{el.classList.remove('show')},3000);
}
window.addEventListener('online',()=>{showSyncStatus('synced','Conexão restaurada');if(typeof window.flushSyncQueue==='function')window.flushSyncQueue()});
window.addEventListener('offline',()=>showSyncStatus('offline','Offline — dados salvos localmente'));
// Override queueSync to show status
const _origQueueSync=window.queueSync;
if(typeof _origQueueSync==='function'){
  window.queueSync=function(type,data){
    showSyncStatus('syncing','Sincronizando...');
    _origQueueSync(type,data);
    setTimeout(()=>{if(navigator.onLine)showSyncStatus('synced','Salvo na nuvem')},4000);
  }
}

window.showSyncStatus = showSyncStatus;

// Supabase ready signal — boot waits for auth with timeout
let _supabaseReady=null;
const _waitSupabase=new Promise(resolve=>{_supabaseReady=resolve});
window._supabaseReady = _supabaseReady;

// initAfterAuth: called when login happens in app.html
async function initAfterAuth(user){
  console.log('[Auth] initAfterAuth:',user?.email);
  if(typeof window.updateAuthUI==='function')window.updateAuthUI();
  if(typeof window.ui==='function')window.ui();
  if(typeof window.checkPlanAccess==='function')window.checkPlanAccess();
}
window.initAfterAuth = initAfterAuth;

// Profile navigation — shows login if not authenticated, otherwise goes to perfil.html
function handleProfileNav(){
  if(typeof window.currentUser!=='undefined' && window.currentUser){
    location.href='perfil.html';
  } else if(typeof window._showLoginModal==='function'){
    window._showLoginModal();
  } else {
    location.href='auth.html';
  }
}
window.handleProfileNav = handleProfileNav;

// MAIN BOOT
export async function boot(){
  if(typeof window.initTheme==='function')window.initTheme();
  if(typeof window.initI18n==='function')window.initI18n();

  var ok=await window.loadLessons();
  if(!ok)return;
  window.buildSidebar();
  if(typeof window.updateLangToggle==='function')window.updateLangToggle();
  window.streak();
  window.initOnboard();

  if(DEMO_MODE){
    // DEMO: don't wait for auth at all — render immediately
    // Supabase loads in background; if user is already logged in, sync happens silently
    if(window.S.name!=='Aluno' && window.S.ageGroup){
      document.getElementById('onboard').style.display='none';
      window.goDash();
    }
  } else {
    // Normal mode: wait for auth with 4s timeout (don't block offline)
    await Promise.race([_waitSupabase,new Promise(r=>setTimeout(()=>r(false),4000))]);
    if(window.S.name!=='Aluno' && window.S.ageGroup){
      document.getElementById('onboard').style.display='none';
      window.goDash();
    }
  }

  // Defer non-critical init
  var _deferInit=typeof requestIdleCallback==='function'?requestIdleCallback:cb=>setTimeout(cb,100);
  _deferInit(()=>{
    if(typeof window.updateSfxLabel==='function')window.updateSfxLabel();
    if(typeof window.scheduleStudyReminder==='function')window.scheduleStudyReminder();
    if(typeof window.enhanceAria==='function')window.enhanceAria();
    if(typeof window.updateGlobalProgress==='function')window.updateGlobalProgress();
    if(window.S.name!=='Aluno' && window.S.ageGroup){
      setTimeout(()=>{if(typeof window.checkWhatsNew==='function')window.checkWhatsNew()},1000);
      setTimeout(()=>{if(typeof window.preloadModules==='function')window.preloadModules()},1500);
    }
  });

  // Challenge banner
  (function initChallengeBanner(){
    var banner=window._origById('challengeBanner');
    if(!banner)return;
    var msgs=[
      {icon:'🏆',title:'Desafie um amigo agora!',sub:'Quem ganha mais XP esta semana? Compartilhe e descubra!'},
      {icon:'⚡',title:'Você tem '+window.totalXP()+' XP — quem te supera?',sub:'Mande o link no WhatsApp e veja quem estuda mais!'},
      {icon:'🔥',title:window.S.streak+' dias de sequência!',sub:'Desafie alguém a manter uma sequência maior que a sua!'},
      {icon:'🎯',title:'Já completou '+Object.keys(window.S.done).length+' aulas',sub:'Desafie seus amigos a te alcançar!'},
      {icon:'💪',title:'Nível '+window.S.lvl+' — quem chega primeiro?',sub:'Compartilhe e crie uma competição saudável!'},
      {icon:'🧠',title:'Teste quem sabe mais!',sub:'Envie o app para um amigo e comparem resultados!'}
    ];
    var idx=Math.floor(Math.random()*msgs.length);
    function updateBanner(){
      var m=msgs[idx%msgs.length];
      var iconEl=banner.querySelector('.cb-icon');
      var titleEl=banner.querySelector('.cb-title');
      var subEl=banner.querySelector('.cb-sub');
      if(iconEl)iconEl.textContent=m.icon;
      if(titleEl)titleEl.textContent=m.title;
      if(subEl)subEl.textContent=m.sub;
      idx++;
    }
    updateBanner();
    setInterval(updateBanner,30000);
  })();

  // Remove splash screen
  setTimeout(()=>{var sp=document.getElementById('appSplash');if(sp){sp.style.opacity='0';setTimeout(()=>sp.remove(),300)}},400);

  // Performance metrics
  window.addEventListener('load',()=>{try{var p=performance.getEntriesByType('navigation')[0];if(p)console.log('⚡ Escola Liberal Performance:\n  DOM Ready: '+Math.round(p.domContentLoadedEventEnd-p.startTime)+'ms\n  Load: '+Math.round(p.loadEventEnd-p.startTime)+'ms\n  TTFB: '+Math.round(p.responseStart-p.requestStart)+'ms\n  Transfer: '+Math.round(p.transferSize/1024)+'KB')}catch(e){}});

  // Accept challenge from URL parameter
  (function(){
    var sp=new URLSearchParams(location.search);
    var chId=sp.get('challenge');
    if(chId){
      var url=new URL(location);url.searchParams.delete('challenge');
      history.replaceState(null,'',url.pathname+url.search+url.hash);
      setTimeout(()=>{window.acceptChallenge(chId);window.toast('Desafio aceito! Ganhe XP para subir.')},2000);
    }
  })();

  // Recovery token: redirect to auth.html
  if(location.hash && location.hash.includes('type=recovery')){
    window.location.replace('auth.html' + location.hash);
  }

  // OAuth errors: show toast
  (function(){
    var sp=new URLSearchParams(location.search);
    var err=sp.get('error');
    if(err){
      var desc=sp.get('error_description')||err;
      setTimeout(function(){if(typeof window.toast==='function')window.toast('Erro no login: '+decodeURIComponent(desc),'error')},1000);
      history.replaceState(null,'',location.pathname);
    }
  })();

  // Hash navigation (module deep links)
  if(location.hash){
    if(location.hash.includes('access_token')||location.hash.includes('type=recovery')){
      console.log('[Nav] Hash de auth detectado, ignorando parser de módulo');
    }else{
      var m=location.hash.match(/module-(\d+)/);
      if(m)setTimeout(()=>window.goMod(parseInt(m[1])-1),100);
    }
  }

  // ============================================================
  // SUPABASE INTEGRATION (load SDK + client dynamically)
  // ============================================================
  (function(){
    var sdk=document.createElement('script');
    sdk.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    sdk.onload=function(){
      var cl=document.createElement('script');
      cl.src='supabase-client.js';
      cl.onload=function(){
        if(typeof window.initSupabase==='function'){
          var ok=window.initSupabase();
          if(ok){_renderAuth();if(typeof _supabaseReady==='function')_supabaseReady(true)}
          else{if(typeof _supabaseReady==='function')_supabaseReady(false)}
        }
      };
      cl.onerror=function(){console.warn('[Supabase] client.js não encontrado, modo offline.');if(typeof _supabaseReady==='function')_supabaseReady(false)};
      document.body.appendChild(cl);
    };
    sdk.onerror=function(){console.warn('[Supabase] SDK offline, continuando sem sync.');if(typeof _supabaseReady==='function')_supabaseReady(false)};
    document.body.appendChild(sdk);
  })();

  function _renderAuth(){
    var side=document.querySelector('.side');
    if(!side)return;
    var el=document.createElement('div');
    el.id='authSection';
    el.style.cssText='margin-top:auto;padding-top:1rem;border-top:1px solid var(--border)';
    el.innerHTML='<div class="side-label" style="margin-top:.5rem">CONTA</div>'
      +'<div id="authLoggedOut"><div class="ni" role="button" tabindex="0" onclick="_showLoginModal()"><div class="ni-icon" style="background:var(--sage-muted);color:var(--sage-light)">🔐</div><span style="font-size:.85rem">Entrar / Criar Conta</span></div></div>'
      +'<div id="authLoggedIn" style="display:none"><div style="display:flex;align-items:center;gap:.5rem;padding:.5rem .75rem;margin-bottom:.25rem"><div style="width:28px;height:28px;border-radius:50%;background:var(--sage-muted);display:flex;align-items:center;justify-content:center;font-size:.8rem">👤</div><span id="authUserName" style="font-size:.85rem;color:var(--text-secondary)"></span></div>'
      +'<div class="ni" role="button" tabindex="0" onclick="location.href=\'perfil.html\'"><div class="ni-icon" style="background:var(--sky-muted);color:var(--sky)">⚙️</div><span style="font-size:.85rem">Meu Perfil</span></div>'
      +'<div class="ni" role="button" tabindex="0" onclick="_doSignOut()"><div class="ni-icon" style="background:var(--coral-muted);color:var(--coral)">🚪</div><span style="font-size:.85rem">Sair</span></div></div>';
    side.appendChild(el);

    var vEl=document.createElement('div');
    vEl.style.cssText='padding:.75rem;border-top:1px solid var(--border);margin-top:.5rem';
    vEl.innerHTML='<div class="ni" role="button" tabindex="0" onclick="typeof _checkForUpdates===\'function\'&&_checkForUpdates()"><div class="ni-icon" style="background:var(--lavender-muted,rgba(139,92,246,.1));color:var(--lavender,#a78bfa)">🔄</div><span style="font-size:.85rem">Verificar atualizações</span></div>'
      +'<div style="text-align:center;padding:.25rem 0;margin-top:.25rem"><span id="appVersionLabel" style="font-size:.7rem;color:var(--text-muted);font-family:\'JetBrains Mono\',monospace">versão: carregando...</span></div>';
    side.appendChild(vEl);

    setTimeout(function(){
      if(typeof window._getAppVersion==='function'){
        var v=window._getAppVersion();
        var lbl=document.getElementById('appVersionLabel');
        if(lbl&&v&&v!=='desconhecida') lbl.textContent='versão: '+v;
      }
      if('serviceWorker' in navigator&&navigator.serviceWorker.controller){
        navigator.serviceWorker.controller.postMessage({type:'GET_VERSION'});
        navigator.serviceWorker.addEventListener('message',function _vHandler(e){
          if(e.data&&e.data.type==='SW_VERSION'){
            var lbl=document.getElementById('appVersionLabel');
            if(lbl) lbl.textContent='versão: '+e.data.version;
            navigator.serviceWorker.removeEventListener('message',_vHandler);
          }
        });
      }
    }, 1500);

    window.updateAuthUI();
  }

  function updateAuthUI(){
    var loggedOut=document.getElementById('authLoggedOut');
    var loggedIn=document.getElementById('authLoggedIn');
    var nameEl=document.getElementById('authUserName');
    if(!loggedOut||!loggedIn)return;
    if(typeof window.currentUser!=='undefined'&&window.currentUser){
      loggedOut.style.display='none';
      loggedIn.style.display='block';
      if(nameEl) nameEl.textContent=window.currentUser.user_metadata?.full_name||window.currentUser.email||'Aluno';
    } else {
      loggedOut.style.display='block';
      loggedIn.style.display='none';
    }
  }
  window.updateAuthUI = updateAuthUI;

  async function _doSignOut(){
    if(typeof window.signOut==='function'){
      await window.signOut();
    }
    updateAuthUI();
    if(typeof window.setSubscription==='function')window.setSubscription(null);
    window.toast('Conta desconectada');
    window.goDash();
  }
  window._doSignOut = _doSignOut;

  // Login modal
  function _showLoginModal(){
    if(document.getElementById('loginModal'))return;
    window.closeSideMobile();
    var overlay=document.createElement('div');
    overlay.id='loginModal';
    overlay.className='save-modal-overlay';
    overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};
    overlay.innerHTML='<div class="save-modal" style="max-width:380px;padding:2rem 1.5rem">'
      +'<button class="save-modal-close" onclick="document.getElementById(\'loginModal\').remove()" aria-label="Fechar">&times;</button>'
      +'<div style="text-align:center;margin-bottom:1.5rem"><div style="font-size:2rem;margin-bottom:.5rem">🔐</div><h2 style="font-size:1.2rem;margin-bottom:.25rem">Entrar na Escola Liberal</h2><p style="font-size:.82rem;color:var(--text-muted)">Sincronize progresso entre dispositivos</p></div>'
      +'<button class="btn btn-ghost" style="width:100%;padding:.75rem;font-size:.9rem;margin-bottom:.75rem;display:flex;align-items:center;justify-content:center;gap:.5rem" onclick="_loginGoogle()">'
      +'<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'
      +' Continuar com Google</button>'
      +'<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem"><div style="flex:1;height:1px;background:var(--border)"></div><span style="font-size:.7rem;color:var(--text-muted)">ou</span><div style="flex:1;height:1px;background:var(--border)"></div></div>'
      +'<input id="loginEmail" type="email" placeholder="Email" style="width:100%;padding:.6rem .75rem;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg-elevated);color:var(--text-primary);font-family:inherit;font-size:.85rem;margin-bottom:.5rem;box-sizing:border-box">'
      +'<input id="loginPass" type="password" placeholder="Senha" style="width:100%;padding:.6rem .75rem;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg-elevated);color:var(--text-primary);font-family:inherit;font-size:.85rem;margin-bottom:.75rem;box-sizing:border-box" onkeydown="if(event.key===\'Enter\')_loginEmail()">'
      +'<button class="btn btn-sage" style="width:100%;margin-bottom:.5rem" onclick="_loginEmail()">Entrar</button>'
      +'<div id="loginError" style="display:none;color:var(--coral);font-size:.78rem;text-align:center;margin-bottom:.5rem"></div>'
      +'<div style="text-align:center"><button class="btn btn-ghost" style="font-size:.75rem;padding:.35rem .75rem" onclick="document.getElementById(\'loginModal\').remove()">Continuar sem conta →</button></div>'
      +'</div>';
    document.body.appendChild(overlay);
    setTimeout(function(){var el=document.getElementById('loginEmail');if(el)el.focus()},200);
  }
  window._showLoginModal = _showLoginModal;

  async function _loginGoogle(){
    if(typeof window.signInGoogle!=='function'){window.toast('Google login não disponível offline','error');return}
    var result=await window.signInGoogle();
    if(!result.success){
      var err=document.getElementById('loginError');
      if(err){err.style.display='block';err.textContent='Erro: '+(result.error||'Tente novamente')}
    }
  }
  window._loginGoogle = _loginGoogle;

  async function _loginEmail(){
    var email=(document.getElementById('loginEmail')||{}).value||'';
    var pass=(document.getElementById('loginPass')||{}).value||'';
    var err=document.getElementById('loginError');
    if(!email||!pass){if(err){err.style.display='block';err.textContent='Preencha email e senha'}return}
    if(typeof window.sbClient==='undefined'||!window.sbClient){if(err){err.style.display='block';err.textContent='Sem conexão'}return}
    try{
      var res=await window.sbClient.auth.signInWithPassword({email:email,password:pass});
      if(res.error){
        if(res.error.message.includes('Invalid login')){
          var res2=await window.sbClient.auth.signUp({email:email,password:pass});
          if(res2.error)throw res2.error;
          if(err){err.style.display='block';err.style.color='var(--sage)';err.textContent='Conta criada! Verifique seu email para confirmar.'}
          return;
        }
        throw res.error;
      }
      var modal=document.getElementById('loginModal');if(modal)modal.remove();
      initAfterAuth(res.data.user);
      updateAuthUI();
      window.toast('Bem-vindo de volta!','success');
    }catch(e){
      if(err){err.style.display='block';err.textContent='Erro: '+e.message}
    }
  }
  window._loginEmail = _loginEmail;

  // Handle OAuth callback in app.html (fallback — primary handler is auth.html)
  (function(){
    if(location.hash&&location.hash.includes('access_token')){
      console.log('[Auth] OAuth tokens detectados em app.html, aguardando SDK...');
      var attempts=0,maxAttempts=30;
      var hashCleaned=false;
      function checkOAuthSession(){
        attempts++;
        if(typeof window.sbClient==='undefined'||!window.sbClient){
          if(attempts<maxAttempts)setTimeout(checkOAuthSession,250);
          else console.warn('[Auth] SDK não carregou em 7.5s');
          return;
        }
        window.sbClient.auth.getSession().then(function(r){
          if(r.data&&r.data.session){
            initAfterAuth(r.data.session.user);
            updateAuthUI();
            window.toast('Login realizado!','success');
            if(!hashCleaned){hashCleaned=true;history.replaceState(null,'',location.pathname)}
          }else if(attempts<maxAttempts){
            setTimeout(checkOAuthSession,250);
          }
        }).catch(function(){
          if(attempts<maxAttempts)setTimeout(checkOAuthSession,250);
        });
      }
      setTimeout(checkOAuthSession,500);
    }
    var sp=new URLSearchParams(location.search);
    if(sp.get('error')){
      setTimeout(function(){window.toast('Erro no login: '+(sp.get('error_description')||sp.get('error')),'error')},500);
      history.replaceState(null,'',location.pathname);
    }
  })();

  // Stripe billing (load dynamically)
  (function(){
    var s=document.createElement('script');
    s.src='stripe-billing.js';
    s.onerror=function(){console.warn('[Stripe] billing.js não encontrado.')};
    document.body.appendChild(s);
  })();
}
