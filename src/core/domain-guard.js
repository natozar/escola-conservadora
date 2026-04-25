// ============================================================
// domain-guard.js — verifica que o app esta rodando em dominio autorizado
// ============================================================
// Se um copiador subir o codigo em outro dominio (ex: clone.com.br),
// o app detecta, reporta para a tabela error_reports (kind:clone_detected)
// e bloqueia funcionalidades premium (modulos, debate, AI).
//
// Tres camadas:
//   1. Allowlist de hostnames legitimos (escolaliberal.com.br + dev hosts)
//   2. Em dominio nao-autorizado: reporta + bloqueia render
//   3. Anti-bypass: getter readonly em window.__DOMAIN_OK
// ============================================================

(function(){
  'use strict';

  const ALLOWED_HOSTS = [
    'escolaliberal.com.br',
    'www.escolaliberal.com.br',
    'natozar.github.io',          // GitHub Pages mirror
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ];

  const host = (location.hostname || '').toLowerCase();
  const isFile = location.protocol === 'file:';
  const ok = !isFile && (
    ALLOWED_HOSTS.includes(host) ||
    host.endsWith('.escolaliberal.com.br') ||
    host.endsWith('.localhost') ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host)
  );

  // Expose readonly flag (best-effort — JS can be patched, but raises bar)
  try {
    Object.defineProperty(window, '__DOMAIN_OK', {
      value: ok,
      writable: false,
      configurable: false,
      enumerable: false
    });
  } catch(e) { window.__DOMAIN_OK = ok; }

  if (!ok) {
    console.error('[domain-guard] Dominio nao autorizado:', host);

    // Tenta reportar o clone (best-effort — pode falhar por CORS ou Supabase off)
    try {
      const payload = {
        kind: 'clone_detected',
        details: {
          cloned_host: host,
          referrer: document.referrer || '',
          ua: (navigator.userAgent || '').slice(0, 200),
          path: location.pathname
        },
        message: 'App rodando em dominio nao autorizado: ' + host
      };
      // Lazy reporter — tenta endpoint Supabase publico via beacon
      if (navigator.sendBeacon) {
        const url = 'https://hwjplecfqsckfiwxiedo.supabase.co/rest/v1/error_reports';
        const blob = new Blob([JSON.stringify({
          kind: 'clone_detected',
          severity: 'critical',
          message: payload.message,
          details: payload.details,
          user_agent: payload.details.ua,
          url_path: payload.details.path
        })], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    } catch(e) { /* silencioso */ }

    // Bloqueio visual + funcional apos boot
    document.addEventListener('DOMContentLoaded', function(){
      try {
        const overlay = document.createElement('div');
        overlay.style.cssText = [
          'position:fixed','inset:0','z-index:2147483647',
          'background:#0a0e1a','color:#e2e8f0',
          'display:flex','flex-direction:column',
          'align-items:center','justify-content:center',
          'padding:24px','text-align:center',
          'font-family:system-ui,sans-serif'
        ].join(';');
        overlay.innerHTML = [
          '<div style="font-size:48px;margin-bottom:16px">⚠️</div>',
          '<h1 style="font-size:24px;margin:0 0 12px">Dominio nao autorizado</h1>',
          '<p style="max-width:480px;line-height:1.6;color:#94a3b8;margin:0 0 24px">',
          'Este aplicativo e propriedade da <strong>Escola Liberal</strong>. ',
          'Acesse pelo dominio oficial para usar todos os recursos.',
          '</p>',
          '<a href="https://escolaliberal.com.br" ',
          'style="background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">',
          'Ir para escolaliberal.com.br</a>',
          '<p style="margin-top:32px;font-size:11px;color:#475569">',
          '© Escola Liberal — Todos os direitos reservados — Lei 9.610/98',
          '</p>'
        ].join('');
        document.body.appendChild(overlay);
      } catch(e) { /* silencioso */ }
    });

    // Inutiliza fetch de modulos para nao servir conteudo num clone
    const _origFetch = window.fetch;
    window.fetch = function(url, opts){
      try {
        const u = String(url || '');
        if (u.includes('/lessons/') || u.includes('lessons.json')) {
          return Promise.reject(new Error('domain_blocked'));
        }
      } catch(e) {}
      return _origFetch.apply(this, arguments);
    };
  }
})();
