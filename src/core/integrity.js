// ============================================================
// INTEGRITY — verificacao de hash SHA-256 do conteudo de licoes
// ============================================================
// Defesa contra adulteracao de modulos, aulas e disciplinas.
// O cliente baixa lessons/integrity.json no boot e verifica todo
// JSON de licao antes de parsear. Falha de hash → reject + log.
//
// Modos de degradacao:
//   - manifesto ausente (404)        → modo permissivo + warning console
//                                      (compatibilidade com builds antigos)
//   - manifesto com self_hash invalido → modo estrito-recusa-tudo
//   - hash de arquivo divergente      → recusa + alerta Supabase
// ============================================================

let _manifest = null;
let _manifestLoaded = false;
let _strictMode = false;
let _selfVerified = false;

async function sha256Hex(text){
  if(!crypto || !crypto.subtle){
    // Browsers muito antigos (sem SubtleCrypto): degrada para permissivo
    return null;
  }
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function loadIntegrityManifest(){
  if(_manifestLoaded) return _manifest;
  _manifestLoaded = true;
  try{
    const r = await fetch('./lessons/integrity.json',{cache:'no-store'});
    if(!r.ok){
      console.warn('[Integrity] Manifesto ausente — modo permissivo');
      return null;
    }
    const text = await r.text();
    const m = JSON.parse(text);
    if(m && m.algorithm==='sha256' && m.files){
      // Verifica self_hash do manifesto
      const payload = JSON.stringify({version:m.version,algorithm:m.algorithm,files:m.files});
      const expected = m.self_hash;
      const actual = await sha256Hex(payload);
      if(actual && expected && actual !== expected){
        console.error('[Integrity] self_hash do manifesto INVALIDO — rejeitando todo conteudo');
        _strictMode = true;
        _selfVerified = false;
        _manifest = m;
        try{
          if(typeof window!=='undefined' && window.reportIntegrityAlert){
            window.reportIntegrityAlert('manifest_self_hash_mismatch',{expected,actual});
          }
        }catch(_){}
        return m;
      }
      _selfVerified = true;
      _manifest = m;
      console.log('[Integrity] Manifesto carregado: '+Object.keys(m.files).length+' arquivos');
      return m;
    }
  }catch(e){
    console.warn('[Integrity] Falha ao carregar manifesto:',e.message);
  }
  return null;
}

async function verifyContent(filename, text){
  // Sem manifesto → permissivo (build antigo)
  if(!_manifest) return true;
  // Manifesto invalido → bloqueia tudo
  if(_strictMode && !_selfVerified) return false;
  const entry = _manifest.files[filename];
  if(!entry){
    // Arquivo nao listado → permissivo (compatibilidade com licoes adicionadas pos-build)
    console.warn('[Integrity] Arquivo nao listado no manifesto:',filename);
    return true;
  }
  const actual = await sha256Hex(text);
  if(!actual) return true; // SubtleCrypto indisponivel
  if(actual !== entry.sha256){
    console.error('[Integrity] HASH DIVERGENTE em',filename,'\n  esperado:',entry.sha256.slice(0,16)+'...','\n  obtido:',actual.slice(0,16)+'...');
    try{
      if(typeof window!=='undefined' && window.reportIntegrityAlert){
        window.reportIntegrityAlert('content_hash_mismatch',{file:filename,expected:entry.sha256,actual});
      }
    }catch(_){}
    return false;
  }
  return true;
}

// Reporter de alertas — envia para Supabase se disponivel.
// Em OFFLINE_MODE, apenas loga (nada e enviado).
async function reportIntegrityAlert(kind, details){
  try{
    if(typeof window==='undefined') return;
    if(window.OFFLINE_MODE) return;
    if(!window.sbClient) return;
    await window.sbClient.from('integrity_alerts').insert({
      kind,
      details,
      user_agent: navigator.userAgent,
      url: location.href,
      occurred_at: new Date().toISOString()
    });
  }catch(_){}
}

if(typeof window !== 'undefined'){
  window.loadIntegrityManifest = loadIntegrityManifest;
  window.verifyContent = verifyContent;
  window.sha256Hex = sha256Hex;
  window.reportIntegrityAlert = reportIntegrityAlert;
}

export { loadIntegrityManifest, verifyContent, sha256Hex, reportIntegrityAlert };
