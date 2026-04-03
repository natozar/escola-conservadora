// ============================================================
// NOTES — extracted from app.js lines 643-680
// ============================================================
const NOTES_KEY='escola_notes';
function loadNotes(){try{return JSON.parse(localStorage.getItem(NOTES_KEY))||{}}catch(e){return{}}}
function saveNotes(all){try{localStorage.setItem(NOTES_KEY,JSON.stringify(all))}catch(e){console.warn('[saveNotes] storage error:',e.message)}if(typeof queueSync==='function')queueSync('notes',all)}
let noteTimer;
function saveNote(){
  clearTimeout(noteTimer);
  noteTimer=setTimeout(()=>{
    const k=`${window.S.cMod}-${window.S.cLes}`,all=loadNotes();
    const txt=document.getElementById('notesTxt').value;
    if(txt.trim())all[k]=txt;else delete all[k];
    saveNotes(all);
    const saved=document.getElementById('notesSaved');saved.classList.add('show');
    setTimeout(()=>saved.classList.remove('show'),2000);
    updateNoteCount()
  },500)
}
function loadNoteForLesson(){
  const k=`${window.S.cMod}-${window.S.cLes}`,all=loadNotes();
  document.getElementById('notesTxt').value=all[k]||'';
  document.getElementById('notesToggle').classList.remove('open');
  document.getElementById('notesArea').classList.remove('open');
  if(all[k]){document.getElementById('notesToggle').classList.add('open');document.getElementById('notesArea').classList.add('open')}
  updateNoteCount()
}
function toggleNotes(){
  const tog=document.getElementById('notesToggle'),area=document.getElementById('notesArea');
  tog.classList.toggle('open');area.classList.toggle('open');
  const isOpen=area.classList.contains('open');
  tog.setAttribute('aria-expanded',isOpen);
  if(isOpen)document.getElementById('notesTxt').focus()
}
function updateNoteCount(){
  const all=loadNotes(),count=Object.keys(all).length;
  document.getElementById('notesCount').textContent=count?`(${count} anotação${count>1?'ões':''})`:''
}

// Attach to window for HTML onclick compatibility
window.loadNotes=loadNotes;
window.saveNotes=saveNotes;
window.saveNote=saveNote;
window.loadNoteForLesson=loadNoteForLesson;
window.toggleNotes=toggleNotes;
window.updateNoteCount=updateNoteCount;

export {loadNotes,saveNotes,saveNote,loadNoteForLesson,toggleNotes,updateNoteCount};
