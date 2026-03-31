const fs=require('fs'),p=require('path');
const LDIR=p.join(__dirname,'..','lessons');
const idx=JSON.parse(fs.readFileSync(p.join(LDIR,'index.json'),'utf8'));

function addMod(m){
  const i=idx.length;
  idx.push({title:m.title,desc:m.desc,icon:m.icon,color:m.color,discipline:m.discipline,lessons:m.lessons.map(l=>({title:l.title,sub:l.sub,xp:l.xp,quiz:l.quiz}))});
  fs.writeFileSync(p.join(LDIR,'mod-'+i+'.json'),JSON.stringify(m));
  console.log('  mod-'+i+': '+m.title+' ('+m.lessons.length+' lessons)');
}

function mkLesson(title,sub,xp,content,q,opts,correct,exp){
  return{title,sub,xp,content,quiz:{q,o:opts,c:correct,exp}};
}

function quickMod(title,desc,icon,color,discipline,topics,subs){
  return{title,desc,icon,color,discipline,lessons:topics.map((t,i)=>mkLesson(t,subs?subs[i]:('Aula '+(i+1)),
    [20,25,25,25,20,25,25,20,25,30][i],
    '<h3>'+t+'</h3><p>Nesta aula exploramos <strong>'+t.toLowerCase()+'</strong> com exemplos pr\u00e1ticos para jovens de 10 a 16 anos.</p><p>Cada conceito foi escolhido para desenvolver pensamento cr\u00edtico e habilidades aplic\u00e1veis no dia a dia.</p><p>Use o tutor IA para aprofundar qualquer d\u00favida!</p>',
    'Qual conceito principal desta aula?',
    ['O conceito central de '+t,'Uma ideia secund\u00e1ria','Algo n\u00e3o relacionado','Nenhuma das anteriores'],
    0,'Nesta aula o conceito central foi '+t+'. Revise para fixar!'))};
}

// LÓGICA: Resolução de Problemas
addMod(quickMod('Resolu\u00e7\u00e3o de Problemas','Pensamento lateral, algoritmos mentais e como resolver qualquer desafio','\uD83D\uDD27','sky','logica',
  ['Pensamento Lateral','Divide e Conquista','Tentativa e Erro','Racioc\u00ednio Reverso','Analogias','Brainstorming','M\u00e9todo Cient\u00edfico','Mapas Mentais','Tomada de Decis\u00e3o','Criatividade Aplicada']));

// MÍDIA +2
addMod(quickMod('Fake News e Fact-Checking','Como identificar not\u00edcias falsas e verificar fontes','\uD83D\uDD0D','coral','midia',
  ['O que S\u00e3o Fake News','Vi\u00e9s Algor\u00edtmico','Como Verificar uma Not\u00edcia','Fontes Confi\u00e1veis vs Duvidosas','Imagens Manipuladas','Deepfakes e IA','Clickbait e Sensacionalismo','Teorias Conspirat\u00f3rias','Checagem de Fatos na Pr\u00e1tica','Cidad\u00e3o Digital Respons\u00e1vel']));

addMod(quickMod('Redes Sociais e Algoritmos','Como algoritmos decidem o que voc\u00ea v\u00ea','\uD83D\uDCF1','lavender','midia',
  ['Como Funciona um Algoritmo','A Bolha de Filtro','Economia da Aten\u00e7\u00e3o','Dopamina e Notifica\u00e7\u00f5es','Influenciadores e Marketing','Privacidade e Dados Pessoais','Cyberbullying','Sa\u00fade Mental e Redes','Detox Digital','Usando Redes com Prop\u00f3sito']));

// SAÚDE +2
addMod(quickMod('Nutri\u00e7\u00e3o e Alimenta\u00e7\u00e3o','Macronutrientes, r\u00f3tulos e como comer de verdade','\uD83E\uDD57','mint','saude',
  ['Macronutrientes','Vitaminas e Minerais','Lendo R\u00f3tulos','\u00c1gua e Hidrata\u00e7\u00e3o','Dietas da Moda','Alimenta\u00e7\u00e3o e Performance','Transtornos Alimentares','Comida Processada','Or\u00e7amento e Alimenta\u00e7\u00e3o Saud\u00e1vel','Cozinhar: Habilidade para a Vida']));

addMod(quickMod('Sa\u00fade Mental na Adolesc\u00eancia','Ansiedade, autoestima, sono e como cuidar da mente','\uD83E\uDDD8','lavender','saude',
  ['O que \u00e9 Sa\u00fade Mental','Ansiedade: Normal vs Excessiva','Autoestima e Autoimagem','Sono e Adolesc\u00eancia','Telas e Sa\u00fade Mental','Bullying e Resili\u00eancia','Mindfulness para Jovens','Quando Pedir Ajuda','H\u00e1bitos que Protegem a Mente','Intelig\u00eancia Emocional na Pr\u00e1tica']));

// ARTES +2
addMod(quickMod('M\u00fasica e Cultura Ocidental','Bach, Beatles, bossa nova \u2014 a m\u00fasica conta a hist\u00f3ria','\uD83C\uDFB5','honey','artes',
  ['O que \u00e9 M\u00fasica?','M\u00fasica Cl\u00e1ssica','Jazz e Blues','Rock and Roll','Bossa Nova e MPB','Hip Hop e Cultura','M\u00fasica Eletr\u00f4nica','Trilhas Sonoras','M\u00fasica e Emo\u00e7\u00e3o','Criando M\u00fasica Hoje']));

addMod(quickMod('Cinema e Narrativa Visual','A arte de contar hist\u00f3rias com imagens','\uD83C\uDFAC','sky','artes',
  ['A Inven\u00e7\u00e3o do Cinema','Linguagem Cinematogr\u00e1fica','Roteiro e Storytelling','Grandes Diretores','Anima\u00e7\u00e3o: De Disney a Pixar','Document\u00e1rios','Cinema Brasileiro','Trilha Sonora e Som','Efeitos Especiais e CGI','Fa\u00e7a Seu Curta-Metragem']));

// PROGRAMAÇÃO (3 módulos)
addMod(quickMod('L\u00f3gica de Programa\u00e7\u00e3o','Algoritmos, fluxogramas e pensamento computacional','\uD83D\uDCBB','sky','programacao',
  ['O que \u00e9 Programa\u00e7\u00e3o?','Algoritmos do Dia a Dia','Vari\u00e1veis e Tipos','Condicionais (Se/Ent\u00e3o)','Loops (Repeti\u00e7\u00e3o)','Fun\u00e7\u00f5es','Arrays e Listas','Debug: Encontrando Erros','Fluxogramas','Seu Primeiro Pseudoc\u00f3digo']));

addMod(quickMod('HTML e CSS na Pr\u00e1tica','Crie sua primeira p\u00e1gina web do zero','\uD83C\uDF10','lavender','programacao',
  ['O que \u00e9 HTML?','Tags B\u00e1sicas','Estrutura de P\u00e1gina','Textos e Listas','Links e Imagens','O que \u00e9 CSS?','Cores e Fontes','Layout com Flexbox','Responsividade','Publique Seu Site']));

addMod(quickMod('Python para Jovens','Sua primeira linguagem de programa\u00e7\u00e3o','\uD83D\uDC0D','mint','programacao',
  ['Por que Python?','Instala\u00e7\u00e3o e Primeiro Programa','Vari\u00e1veis e Input','Condicionais em Python','Loops For e While','Fun\u00e7\u00f5es em Python','Listas e Dicion\u00e1rios','Trabalhando com Arquivos','Projeto: Calculadora','Projeto: Jogo de Adivinha\u00e7\u00e3o']));

// ORATÓRIA (3 módulos)
addMod(quickMod('Falar em P\u00fablico','Supere o medo e fale com confian\u00e7a','\uD83C\uDF99\uFE0F','honey','oratoria',
  ['O Medo de Falar','Prepara\u00e7\u00e3o \u00e9 Tudo','Estrutura do Discurso','Linguagem Corporal','Voz e Entona\u00e7\u00e3o','Contato Visual','Usando Hist\u00f3rias','Apresenta\u00e7\u00f5es com Slides','Improvisa\u00e7\u00e3o','Pratique: Seu Primeiro Discurso']));

addMod(quickMod('Debate Estruturado','Argumenta\u00e7\u00e3o e contra-argumenta\u00e7\u00e3o','\u2694\uFE0F','coral','oratoria',
  ['O que \u00e9 Debate?','Tipos de Debate','Construindo Argumentos','Evid\u00eancias e Dados','Contra-Argumenta\u00e7\u00e3o','Refuta\u00e7\u00e3o','Fal\u00e1cias no Debate','Debate Parlamentar','Ju\u00edzes e Pontua\u00e7\u00e3o','Debate na Pr\u00e1tica']));

addMod(quickMod('Ret\u00f3rica e Persuas\u00e3o','A arte de convencer','\uD83C\uDFDB\uFE0F','lavender','oratoria',
  ['O que \u00e9 Ret\u00f3rica?','Arist\u00f3teles: Ethos, Pathos, Logos','A Arte da Persuas\u00e3o','T\u00e9cnicas de Influ\u00eancia','Storytelling Persuasivo','Negocia\u00e7\u00e3o','Marketing e Ret\u00f3rica','Discursos que Mudaram o Mundo','\u00c9tica na Persuas\u00e3o','Seu Discurso Persuasivo']));

// EDUCAÇÃO CÍVICA (3 módulos)
addMod(quickMod('Como Funciona o Estado','Tr\u00eas poderes, federalismo e burocracia','\uD83C\uDFDB\uFE0F','sage','civica',
  ['Por que o Estado Existe?','Os Tr\u00eas Poderes','Executivo: Presidente e Governadores','Legislativo: Deputados e Senadores','Judici\u00e1rio: Ju\u00edzes e Tribunais','Federalismo Brasileiro','Burocracia e Servi\u00e7o P\u00fablico','Constitui\u00e7\u00e3o Federal','Elei\u00e7\u00f5es e Voto','Estado M\u00ednimo vs Estado M\u00e1ximo']));

addMod(quickMod('Impostos e Or\u00e7amento P\u00fablico','Para onde vai seu dinheiro?','\uD83D\uDCB8','coral','civica',
  ['O que S\u00e3o Impostos?','Tipos de Impostos no Brasil','Carga Tribut\u00e1ria Brasileira','O Or\u00e7amento Federal','Para Onde Vai Seu Dinheiro?','D\u00edvida P\u00fablica','Reforma Tribut\u00e1ria','Sonega\u00e7\u00e3o vs Elis\u00e3o','Impostos e Desigualdade','Simplificando os Impostos']));

addMod(quickMod('Democracia e Liberdade','Direitos individuais e limites do poder','\uD83D\uDDFD','honey','civica',
  ['O que \u00e9 Democracia?','Democracia Direta vs Representativa','Direitos Individuais','Liberdade de Express\u00e3o','Propriedade Privada','Separa\u00e7\u00e3o de Poderes','Tirania da Maioria','Desobedi\u00eancia Civil','Liberalismo Cl\u00e1ssico','O Pre\u00e7o da Liberdade']));

fs.writeFileSync(p.join(LDIR,'index.json'),JSON.stringify(idx));
console.log('\n=== TOTAL: '+idx.length+' modules, '+idx.reduce((s,m)=>s+m.lessons.length,0)+' lessons ===');
