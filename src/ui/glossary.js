// src/ui/glossary.js — extracted from app.js
// Lines: 580-611 (GLOSSARY data), 878-926 (glossary + flashcards), 613-641 (search)

// ============================================================
// GLOSSARY DATA
// ============================================================
const GLOSSARY=[
  {term:'Escambo',def:'Troca direta de bens sem uso de dinheiro. Problema principal: dupla coincidência de desejos.',mod:0,les:0},
  {term:'Dupla Coincidência de Desejos',def:'Necessidade de encontrar alguém que queira o que você tem e tenha o que você precisa, ao mesmo tempo.',mod:0,les:0},
  {term:'Ordem Espontânea',def:'Sistemas complexos que surgem da ação livre de indivíduos, sem planejamento central.',mod:0,les:1},
  {term:'Teoria Subjetiva do Valor',def:'O valor de um bem está na mente de quem avalia, não no objeto em si.',mod:0,les:2},
  {term:'Inflação',def:'Aumento generalizado dos preços causado por excesso de dinheiro na economia.',mod:0,les:3},
  {term:'Reserva Fracionária',def:'Sistema bancário onde apenas uma fração dos depósitos é mantida como reserva.',mod:0,les:4},
  {term:'Poupança',def:'Adiar consumo presente para acumular capital para o futuro. Base de todo investimento.',mod:0,les:5},
  {term:'Lei da Oferta e Demanda',def:'Preços sobem quando demanda supera oferta e caem quando oferta supera demanda.',mod:1,les:0},
  {term:'Monopólio',def:'Mercado com um único fornecedor, sem concorrência. Prejudica o consumidor.',mod:1,les:2},
  {term:'Curva de Laffer',def:'Teoria que mostra que aumentar impostos além de certo ponto diminui a arrecadação.',mod:1,les:4},
  {term:'Vantagem Comparativa',def:'Princípio de Ricardo: cada país deve produzir o que faz com mais eficiência relativa.',mod:1,les:6},
  {term:'Lucro',def:'Recompensa por satisfazer necessidades do consumidor melhor que os concorrentes.',mod:2,les:1},
  {term:'Destruição Criativa',def:'Processo pelo qual novas inovações substituem tecnologias e empresas obsoletas (Schumpeter).',mod:2,les:3},
  {term:'Empreendedor',def:'Agente central que identifica oportunidades, assume riscos e inova no mercado.',mod:2,les:0},
  {term:'Juros Compostos',def:'Juros calculados sobre o principal mais juros acumulados. "8ª maravilha do mundo."',mod:3,les:2},
  {term:'Orçamento',def:'Plano financeiro que organiza receitas e despesas. Ferramenta essencial de controle.',mod:3,les:0},
  {term:'Renda Fixa',def:'Investimentos com retorno previsível: Tesouro Direto, CDB, LCI. Menor risco.',mod:3,les:5},
  {term:'Renda Variável',def:'Investimentos sem retorno garantido: ações, FIIs. Maior potencial mas mais risco.',mod:3,les:5},
  {term:'Revolução Industrial',def:'Transformação econômica do séc. XVIII que multiplicou a produtividade humana.',mod:4,les:0},
  {term:'Crise de 1929',def:'Colapso financeiro causado por crédito artificial. Escola Austríaca previu o crash.',mod:4,les:2},
  {term:'Socialismo',def:'Sistema de planejamento central que falha por impossibilidade do cálculo econômico (Mises).',mod:4,les:4},
  {term:'Capitalismo',def:'Sistema baseado em propriedade privada, livre comércio e estado limitado.',mod:4,les:5},
  {term:'Falácia da Janela Quebrada',def:'Erro de pensar que destruição gera riqueza. Bastiat: analisar "o que não se vê".',mod:5,les:1},
  {term:'Praxeologia',def:'Ciência da ação humana de Mises. Fundamenta a economia na lógica da ação individual.',mod:5,les:3},
  {term:'Escola Austríaca',def:'Corrente econômica que defende mercado livre, propriedade privada e mínima intervenção.',mod:5,les:0},
  {term:'Custo de Oportunidade',def:'O valor da melhor alternativa sacrificada ao fazer uma escolha.',mod:1,les:1},
  {term:'Livre Comércio',def:'Troca internacional sem barreiras (tarifas, cotas). Beneficia todas as partes.',mod:1,les:6},
  {term:'Padrão-Ouro',def:'Sistema monetário onde a moeda é lastreada em ouro. Limita expansão monetária.',mod:0,les:7},
];

// ============================================================
// GLOSSARY VIEW
// ============================================================
function goGlossary(){
  window.hideAllViews();document.getElementById('vGloss').classList.add('on');window.setNav('nGloss');
  window.renderBackLink('vGloss','Voltar');
  renderGlossary(GLOSSARY)
}
function renderGlossary(items){
  document.getElementById('glossList').innerHTML=items.filter(g=>window.M[g.mod]).map(g=>
    `<div class="gl-item" onclick="openL(${g.mod},${g.les})"><div><div class="gl-term">${g.term}</div><div class="gl-def">${g.def}</div><div class="gl-mod">${window.M[g.mod].icon} ${window.M[g.mod].title} · Aula ${g.les+1}</div></div></div>`
  ).join('')
}
function filterGlossary(q){
  if(!q){renderGlossary(GLOSSARY);return}
  const n=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  renderGlossary(GLOSSARY.filter(g=>(g.term+' '+g.def).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(n)))
}

// ============================================================
// FLASHCARDS
// ============================================================
let flashMod=0,flashIdx=0,flashItems=[];
function goFlashcards(){
  window.hideAllViews();document.getElementById('vFlash').classList.add('on');window.setNav('nFlash');
  window.renderBackLink('vFlash','Voltar');
  document.getElementById('flashTabs').innerHTML=window.M.map((m,i)=>
    `<button class="xview-tab${i===flashMod?' active':''}" onclick="setFlashMod(${i})">${m.icon} ${m.title}</button>`
  ).join('');
  setFlashMod(flashMod)
}
function setFlashMod(i){
  flashMod=i;flashIdx=0;
  flashItems=GLOSSARY.filter(g=>g.mod===i);
  if(!flashItems.length)flashItems=[{term:'Sem termos',def:'Nenhum flashcard para este módulo.',mod:i,les:0}];
  document.querySelectorAll('#flashTabs .xview-tab').forEach((t,ti)=>t.classList.toggle('active',ti===i));
  showFlash()
}
function showFlash(){
  const f=flashItems[flashIdx];if(!f)return;
  document.getElementById('flashTerm').textContent=f.term;
  document.getElementById('flashMod').textContent=(window.M[f.mod]?window.M[f.mod].icon+' '+window.M[f.mod].title:'');
  document.getElementById('flashDef').textContent=f.def;
  document.getElementById('flashCounter').textContent=`${flashIdx+1}/${flashItems.length}`;
  document.getElementById('flashCard').classList.remove('flipped')
}
function flipFlash(){document.getElementById('flashCard').classList.toggle('flipped')}
function nextFlash(){flashIdx=(flashIdx+1)%flashItems.length;showFlash()}
function prevFlash(){flashIdx=(flashIdx-1+flashItems.length)%flashItems.length;showFlash()}

// ============================================================
// SEARCH
// ============================================================
let searchTimeout;
function doSearch(q){
  clearTimeout(searchTimeout);
  const box=document.getElementById('searchResults');
  if(!q||q.length<2){box.innerHTML='';return}
  searchTimeout=setTimeout(()=>{
    const norm=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const results=[];
    window.M.forEach((mod,mi)=>{
      mod.lessons.forEach((les,li)=>{
        const plain=les.content?(les.content.replace(/<[^>]*>/g,' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')):'';
        const titleN=(les.title+' '+les.sub).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const idx=plain?plain.indexOf(norm):-1;const tIdx=titleN.indexOf(norm);
        if(idx>=0||tIdx>=0){
          let snippet='';
          const safeNorm=norm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
          if(idx>=0){const start=Math.max(0,idx-30),end=Math.min(plain.length,idx+norm.length+40);
            snippet=(start>0?'...':'')+plain.slice(start,end).replace(new RegExp(safeNorm,'gi'),m=>`<mark>${m}</mark>`)+(end<plain.length?'...':'');}
          results.push({mi,li,mod:mod.title,title:les.title,snippet,score:tIdx>=0?2:1})
        }
      })
    });
    results.sort((a,b)=>b.score-a.score);
    box.innerHTML=results.slice(0,6).map(r=>`<div class="sr-item" onclick="document.getElementById('searchBox').value='';document.getElementById('searchResults').innerHTML='';openL(${r.mi},${r.li})"><div><div class="sr-title">${r.title}</div>${r.snippet?`<div class="sr-snippet">${r.snippet}</div>`:''}</div><div class="sr-mod">${r.mod}</div></div>`).join('')||`<div style="padding:.6rem;font-size:.82rem;color:var(--text-muted)">Nenhum resultado encontrado.</div>`
  },250)
}

// ============================================================
// EXPORTS
// ============================================================
window.GLOSSARY=GLOSSARY;
window.goGlossary=goGlossary;
window.renderGlossary=renderGlossary;
window.filterGlossary=filterGlossary;
window.goFlashcards=goFlashcards;
window.setFlashMod=setFlashMod;
window.showFlash=showFlash;
window.flipFlash=flipFlash;
window.nextFlash=nextFlash;
window.prevFlash=prevFlash;
window.doSearch=doSearch;
