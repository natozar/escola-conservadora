// ============================================================
// ERROR REPORTER — captura erros JS e tentativas suspeitas
// ============================================================
// Envia para Supabase tabela error_reports.
// Admin ve em admin.html → aba Seguranca.
//
// LGPD:
//   - sem IP raw (Supabase nao expoe IP no client)
//   - sem URL completa (so pathname; remove query/hash que pode ter token)
//   - sem stack trace com path absoluto do user (ja vem do browser sem isso)
//   - dedup por fingerprint (kind+path+msg) — uma ocorrencia/sessao
//
// Comportamento:
//   - OFFLINE_MODE → so console (zero rede)
//   - sem sbClient → fila localStorage (envia quando logar)
//   - rate limit local: max 20 reports/sessao (anti-flood)
// ============================================================

const _seen = new Set();
let _sentCount = 0;
const MAX_PER_SESSION = 20;
const QUEUE_KEY = 'escola_error_queue';

function _safePathname(){
  try{
    // Apenas pathname — sem query (pode ter access_token) e sem hash
    return location.pathname || '/';
  }catch(_){return '/'}
}

function _truncUA(){
  try{return (navigator.userAgent||'').slice(0,250)}catch(_){return ''}
}

function _truncMsg(s){
  if(!s) return '';
  return String(s).slice(0,500);
}

function _fingerprint(kind, path, msg){
  // Hash simples local — backend ainda recalcula via trigger
  return (kind||'')+'|'+(path||'')+'|'+(msg||'').slice(0,80);
}

async function _persist(payload){
  try{
    if(typeof window==='undefined') return;
    if(window.OFFLINE_MODE) return;
    if(window.sbClient && window.sbClient.from){
      const {error} = await window.sbClient.from('error_reports').insert(payload);
      if(error){
        // Fila para tentar de novo depois
        _enqueue(payload);
      }
    }else{
      _enqueue(payload);
    }
  }catch(_){
    _enqueue(payload);
  }
}

function _enqueue(payload){
  try{
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');
    if(q.length >= 50) q.shift();
    q.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  }catch(_){}
}

async function flushErrorQueue(){
  try{
    if(typeof window==='undefined') return;
    if(window.OFFLINE_MODE) return;
    if(!window.sbClient || !window.sbClient.from) return;
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');
    if(!q.length) return;
    const {error} = await window.sbClient.from('error_reports').insert(q);
    if(!error){
      localStorage.removeItem(QUEUE_KEY);
      console.log('[ErrorReporter] '+q.length+' eventos enviados');
    }
  }catch(_){}
}

function reportError(kind, opts){
  try{
    opts = opts || {};
    if(_sentCount >= MAX_PER_SESSION) return;
    const path = _safePathname();
    const msg = _truncMsg(opts.message || opts.msg || '');
    const fp = _fingerprint(kind, path, msg);
    if(_seen.has(fp)) return;
    _seen.add(fp);
    _sentCount++;

    const severity = opts.severity || (
      ['integrity_failure_local','age_tamper','pin_brute_force','paywall_bypass','manifest_self_hash_mismatch','content_hash_mismatch'].includes(kind)
        ? 'critical'
        : (['js_error','unhandled_rejection','sw_failure','oauth_failure'].includes(kind) ? 'warning' : 'info')
    );

    const payload = {
      kind: String(kind).slice(0,80),
      severity,
      message: msg,
      details: opts.details ? JSON.parse(JSON.stringify(opts.details).slice(0,3000)) : null,
      user_agent: _truncUA(),
      url_path: path,
      fingerprint: fp.slice(0,200)
    };
    _persist(payload);
  }catch(_){}
}

function _initGlobalHandlers(){
  if(typeof window==='undefined') return;

  // window.onerror — erros JS sincronos
  window.addEventListener('error', (e)=>{
    try{
      if(!e || !e.message) return;
      // Ignora erros de recurso (img/script 404) — nao tem message
      if(e.target && e.target !== window) return;
      reportError('js_error', {
        message: e.message,
        details: {
          file: (e.filename||'').split('/').pop(),
          line: e.lineno,
          col: e.colno,
          stack: e.error && e.error.stack ? String(e.error.stack).slice(0,1500) : null
        }
      });
    }catch(_){}
  });

  // unhandledrejection — promises rejeitadas sem catch
  window.addEventListener('unhandledrejection', (e)=>{
    try{
      const reason = e && e.reason;
      const msg = reason && (reason.message || String(reason));
      reportError('unhandled_rejection', {
        message: msg ? String(msg).slice(0,300) : 'unknown_rejection',
        details: { stack: reason && reason.stack ? String(reason.stack).slice(0,1500) : null }
      });
    }catch(_){}
  });

  // CSP violation reports
  document.addEventListener('securitypolicyviolation', (e)=>{
    try{
      reportError('csp_violation', {
        severity: 'warning',
        message: e.violatedDirective + ' blocked ' + (e.blockedURI||''),
        details: {
          directive: e.violatedDirective,
          blocked: (e.blockedURI||'').slice(0,200),
          source: (e.sourceFile||'').slice(0,200),
          line: e.lineNumber
        }
      });
    }catch(_){}
  });

  // Tentativa de flush quando online
  window.addEventListener('online', ()=>{ setTimeout(flushErrorQueue, 2000) });
}

if(typeof window !== 'undefined'){
  window.reportError = reportError;
  window.flushErrorQueue = flushErrorQueue;
  _initGlobalHandlers();
  // flush inicial apos 5s (espera sbClient)
  setTimeout(flushErrorQueue, 5000);
}

export { reportError, flushErrorQueue };
