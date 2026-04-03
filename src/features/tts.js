// ============================================================
// AUDIO LESSON PLAYER — paragraph-by-paragraph with highlighting
// Extracted from app.js lines 1398-1579
// ============================================================
let ttsPlaying=false,ttsPaused=false,ttsUtterance=null;
let ttsParagraphs=[],ttsCurrentIdx=0,ttsRate=1.0;
const TTS_RATE_KEY='escola_tts_rate';
try{ttsRate=parseFloat(localStorage.getItem(TTS_RATE_KEY))||1.0}catch(e){}
window.ttsRate=ttsRate;

function toggleTTS(){
  if(!('speechSynthesis' in window)){window.toast('Áudio não suportado neste navegador','error');return}
  if(ttsPlaying&&!ttsPaused){pauseTTS();return}
  if(ttsPaused){resumeTTS();return}
  startTTS();
}

function startTTS(){
  stopTTS();
  const body=document.getElementById('lvBody');
  if(!body)return;
  // Collect all readable paragraphs (skip quiz section)
  const els=body.querySelectorAll('h2,h3,p,li,.highlight,.example,.thinker-quote');
  ttsParagraphs=[];
  els.forEach(el=>{
    // Stop at quiz section
    if(el.closest('.qz'))return;
    const text=el.innerText.trim();
    if(text.length>5)ttsParagraphs.push({el:el,text:text});
  });
  if(ttsParagraphs.length===0){window.toast('Nenhum conteúdo para ler');return}
  ttsCurrentIdx=0;
  ttsPlaying=true;ttsPaused=false;
  updateTTSUI();
  showAudioPlayer();
  speakParagraph(ttsCurrentIdx);
}

function speakParagraph(idx){
  if(idx>=ttsParagraphs.length){finishTTS();return}
  ttsCurrentIdx=idx;
  // Remove previous highlight
  ttsParagraphs.forEach(p=>p.el.classList.remove('tts-active'));
  // Highlight current
  const p=ttsParagraphs[idx];
  p.el.classList.add('tts-active');
  p.el.scrollIntoView({behavior:'smooth',block:'center'});
  // Speak
  ttsUtterance=new SpeechSynthesisUtterance(p.text);
  ttsUtterance.lang=window.currentLang==='en'?'en-US':'pt-BR';
  ttsUtterance.rate=ttsRate;
  ttsUtterance.pitch=1.0;
  // Try to pick a good voice
  const voices=speechSynthesis.getVoices();
  const lang=ttsUtterance.lang;
  const preferred=voices.find(v=>v.lang===lang&&v.localService)||voices.find(v=>v.lang.startsWith(lang.split('-')[0]));
  if(preferred)ttsUtterance.voice=preferred;
  ttsUtterance.onend=()=>{
    if(!ttsPlaying||ttsPaused)return;
    speakParagraph(idx+1);
  };
  ttsUtterance.onerror=(e)=>{
    if(e.error==='canceled')return; // Normal on stop
    console.warn('[TTS] Error:',e.error);
    // Skip to next paragraph on error
    if(ttsPlaying&&!ttsPaused)speakParagraph(idx+1);
  };
  speechSynthesis.speak(ttsUtterance);
  updateAudioProgress();
}

function pauseTTS(){
  speechSynthesis.pause();
  ttsPaused=true;
  updateTTSUI();
}

function resumeTTS(){
  speechSynthesis.resume();
  ttsPaused=false;
  updateTTSUI();
}

function stopTTS(){
  speechSynthesis.cancel();
  ttsPlaying=false;ttsPaused=false;ttsCurrentIdx=0;
  ttsParagraphs.forEach(p=>p.el.classList.remove('tts-active'));
  ttsParagraphs=[];
  updateTTSUI();
  hideAudioPlayer();
}

function finishTTS(){
  ttsParagraphs.forEach(p=>p.el.classList.remove('tts-active'));
  ttsPlaying=false;ttsPaused=false;
  updateTTSUI();
  updateAudioProgress();
  window.toast('🔊 Áudio finalizado');
  // Auto-advance option
  const player=document.getElementById('audioPlayer');
  if(player){
    const prog=player.querySelector('.audio-progress-fill');
    if(prog)prog.style.width='100%';
  }
}

function ttsSkipBack(){
  if(ttsCurrentIdx>0){
    speechSynthesis.cancel();
    speakParagraph(ttsCurrentIdx-1);
  }
}

function ttsSkipForward(){
  if(ttsCurrentIdx<ttsParagraphs.length-1){
    speechSynthesis.cancel();
    speakParagraph(ttsCurrentIdx+1);
  }
}

function ttsSetRate(r){
  ttsRate=parseFloat(r);
  window.ttsRate=ttsRate;
  try{localStorage.setItem(TTS_RATE_KEY,ttsRate)}catch(e){}
  const label=document.getElementById('ttsRateLabel');
  if(label)label.textContent=ttsRate.toFixed(1)+'x';
  // Restart current paragraph with new rate
  if(ttsPlaying&&!ttsPaused){
    speechSynthesis.cancel();
    speakParagraph(ttsCurrentIdx);
  }
}

function updateTTSUI(){
  const btn=document.getElementById('ttsBtn');
  if(btn){
    if(ttsPlaying&&!ttsPaused){btn.innerHTML='⏸ Pausar';btn.classList.add('playing')}
    else if(ttsPaused){btn.innerHTML='▶ Continuar';btn.classList.add('playing')}
    else{btn.innerHTML='🔊 Ouvir';btn.classList.remove('playing')}
  }
}

function updateAudioProgress(){
  const player=document.getElementById('audioPlayer');
  if(!player)return;
  const prog=player.querySelector('.audio-progress-fill');
  const label=player.querySelector('.audio-progress-label');
  if(ttsParagraphs.length>0){
    const pct=Math.round(((ttsCurrentIdx+1)/ttsParagraphs.length)*100);
    if(prog)prog.style.width=pct+'%';
    if(label)label.textContent=(ttsCurrentIdx+1)+'/'+ttsParagraphs.length;
  }
}

function showAudioPlayer(){
  let player=document.getElementById('audioPlayer');
  if(!player){
    player=document.createElement('div');
    player.id='audioPlayer';
    player.className='audio-player';
    player.innerHTML=`
      <div class="audio-progress"><div class="audio-progress-fill"></div></div>
      <div class="audio-controls">
        <button class="audio-btn" onclick="window.ttsSkipBack()" title="Parágrafo anterior" aria-label="Anterior">⏮</button>
        <button class="audio-btn audio-btn-main" onclick="window.toggleTTS()" title="Play/Pause" aria-label="Play ou Pause">⏸</button>
        <button class="audio-btn" onclick="window.ttsSkipForward()" title="Próximo parágrafo" aria-label="Próximo">⏭</button>
        <button class="audio-btn" onclick="window.stopTTS()" title="Parar" aria-label="Parar">⏹</button>
        <div class="audio-speed">
          <button class="audio-speed-btn" onclick="window.ttsSetRate(Math.max(0.5,window.ttsRate-0.25))" aria-label="Diminuir velocidade">−</button>
          <span class="audio-speed-label" id="ttsRateLabel">${ttsRate.toFixed(1)}x</span>
          <button class="audio-speed-btn" onclick="window.ttsSetRate(Math.min(2.5,window.ttsRate+0.25))" aria-label="Aumentar velocidade">+</button>
        </div>
        <span class="audio-progress-label">0/0</span>
      </div>
    `;
    document.body.appendChild(player);
  }
  player.classList.add('show');
  updateAudioProgress();
}

function hideAudioPlayer(){
  const player=document.getElementById('audioPlayer');
  if(player)player.classList.remove('show');
}

// Attach to window for HTML onclick compatibility
window.toggleTTS=toggleTTS;
window.startTTS=startTTS;
window.speakParagraph=speakParagraph;
window.pauseTTS=pauseTTS;
window.resumeTTS=resumeTTS;
window.stopTTS=stopTTS;
window.finishTTS=finishTTS;
window.ttsSkipBack=ttsSkipBack;
window.ttsSkipForward=ttsSkipForward;
window.ttsSetRate=ttsSetRate;
window.updateTTSUI=updateTTSUI;
window.updateAudioProgress=updateAudioProgress;
window.showAudioPlayer=showAudioPlayer;
window.hideAudioPlayer=hideAudioPlayer;

export {toggleTTS,startTTS,speakParagraph,pauseTTS,resumeTTS,stopTTS,finishTTS,ttsSkipBack,ttsSkipForward,ttsSetRate,updateTTSUI,updateAudioProgress,showAudioPlayer,hideAudioPlayer};
