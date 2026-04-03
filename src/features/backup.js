// ============================================================
// BACKUP / IMPORT — extracted from app.js lines 3464-3508
// ============================================================
function exportBackup(){
  const data={};
  const keys=['escola_v2','escola_notes','escola_favs','escola_theme','escola_daily','escola_missions','escola_marathon_best','escola_profiles','escola_pin','escola_timeline','escola_spaced','escola_sfx','escola_last_version'];
  keys.forEach(k=>{const v=localStorage.getItem(k);if(v)data[k]=v});
  // Also export all profile keys
  const profiles=JSON.parse(localStorage.getItem('escola_profiles')||'[]');
  profiles.forEach(p=>{const v=localStorage.getItem(p.key);if(v)data[p.key]=v});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`escola-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(url);
  window.toast('Backup exportado com sucesso!','success');
  window.logActivity('backup','Backup exportado')
}
function importBackup(){
  const input=document.createElement('input');
  input.type='file';input.accept='.json';
  input.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.escola_v2){window.toast('Arquivo inválido','error');return}
        if(!confirm('Importar backup substituirá seu progresso atual. Continuar?'))return;
        const ALLOWED_KEYS=['escola_v2','escola_notes','escola_favs','escola_theme','escola_daily','escola_missions','escola_marathon_best','escola_profiles','escola_pin','escola_timeline','escola_spaced','escola_sfx','escola_last_version','escola_daily_goal','escola_notif'];
        Object.entries(data).forEach(([k,v])=>{if(ALLOWED_KEYS.includes(k)||k.startsWith('escola_v2_p_'))try{localStorage.setItem(k,v)}catch(e){}});
        window.toast('Backup importado! Recarregando...','success');
        setTimeout(()=>location.reload(),1000)
      }catch(err){window.toast('Erro ao ler arquivo de backup','error')}
    };
    reader.readAsText(file)
  };
  input.click()
}

function showBackupMenu(){
  const choice=confirm('Clique OK para EXPORTAR seu backup.\nClique Cancelar para IMPORTAR um backup existente.');
  if(choice)exportBackup();else importBackup()
}

// Attach to window
window.exportBackup=exportBackup;
window.importBackup=importBackup;
window.showBackupMenu=showBackupMenu;
