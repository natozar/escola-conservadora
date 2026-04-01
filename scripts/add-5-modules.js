const fs = require('fs');
const M = JSON.parse(fs.readFileSync('./lessons/index.json','utf8'));

if (M.length >= 66) {
  console.log('Already has', M.length, 'modules. Skipping.');
  process.exit(0);
}

// Module 61: Filosofia Política e Liberdade
M.push({
  title: 'Filosofia Política e Liberdade',
  desc: 'Explore as ideias que moldaram a civilização ocidental e o conceito de liberdade individual.',
  icon: '\u{1F3DB}\uFE0F', color: 'lavender', discipline: 'filosofia',
  lessons: [
    {title:'O que é Filosofia Política?',sub:'Aula 1',xp:30,quiz:{q:'Qual pensador é considerado o pai da filosofia política ocidental?',o:['Platão','Aristóteles','Maquiavel','Sócrates'],c:0,exp:'Platão, com "A República", é considerado o fundador da filosofia política ocidental.'}},
    {title:'Direito Natural',sub:'Aula 2',xp:30,quiz:{q:'Segundo John Locke, quais são os três direitos naturais fundamentais?',o:['Vida, liberdade e propriedade','Liberdade, igualdade e fraternidade','Saúde, educação e moradia','Trabalho, lazer e segurança'],c:0,exp:'Locke definiu vida, liberdade e propriedade como direitos naturais inalienáveis que precedem qualquer governo.'}},
    {title:'O Contrato Social',sub:'Aula 3',xp:30,quiz:{q:'Qual filósofo via o estado de natureza como "guerra de todos contra todos"?',o:['Rousseau','Locke','Hobbes','Montesquieu'],c:2,exp:'Thomas Hobbes, em "Leviatã", descreveu o estado de natureza como caótico.'}},
    {title:'Liberalismo Clássico',sub:'Aula 4',xp:30,quiz:{q:'Qual obra de Adam Smith é considerada a fundação do liberalismo econômico?',o:['O Leviatã','O Contrato Social','A Riqueza das Nações','Dois Tratados sobre o Governo'],c:2,exp:'"A Riqueza das Nações" (1776) estabeleceu os princípios do livre mercado.'}},
    {title:'Propriedade Privada',sub:'Aula 5',xp:30,quiz:{q:'Por que a propriedade privada é fundamental para a liberdade?',o:['Porque gera desigualdade saudável','Porque sem propriedade não há independência do Estado','Porque enriquece apenas os donos','Porque o governo não precisa existir'],c:1,exp:'Propriedade privada dá ao indivíduo independência econômica do Estado, permitindo liberdade real.'}},
    {title:'Os Limites do Estado',sub:'Aula 6',xp:30,quiz:{q:'O que Montesquieu propôs para limitar o poder do Estado?',o:['Eleições diretas','Separação dos três poderes','Abolição do governo','Monarquia constitucional'],c:1,exp:'Montesquieu propôs a separação entre Executivo, Legislativo e Judiciário.'}},
    {title:'Democracia e seus Riscos',sub:'Aula 7',xp:30,quiz:{q:'O que Tocqueville chamou de "tirania da maioria"?',o:['Quando a maioria oprime minorias usando o voto','Quando o presidente governa sozinho','Quando não há eleições','Quando a minoria controla tudo'],c:0,exp:'Tocqueville alertou que a maioria pode usar seu poder para oprimir direitos de minorias.'}},
    {title:'Liberdade de Expressão',sub:'Aula 8',xp:30,quiz:{q:'Segundo Mill, por que a liberdade de expressão é essencial?',o:['Porque permite ofender','Porque a verdade surge do debate livre','Porque o governo nunca erra','Porque é divertido'],c:1,exp:'Mill argumentou que silenciar opinião impede a humanidade de descobrir a verdade.'}},
    {title:'Anarcocapitalismo e Minarquismo',sub:'Aula 9',xp:30,quiz:{q:'Qual a diferença entre anarcocapitalismo e minarquismo?',o:['Minarquistas querem Estado mínimo; ancaps querem nenhum','Ambos querem Estado grande','Ancaps querem comunismo','Não há diferença'],c:0,exp:'Minarquistas aceitam Estado mínimo. Anarcocapitalistas querem todas as funções privadas.'}},
    {title:'O Futuro da Liberdade',sub:'Aula 10',xp:35,quiz:{q:'Como a tecnologia pode proteger a liberdade individual?',o:['Tecnologia é sempre boa','Criptomoedas e criptografia protegem privacidade','Tecnologia não tem relação com liberdade','Apenas governos controlam tecnologia'],c:1,exp:'Criptomoedas e criptografia protegem a privacidade. Vigilância em massa é ameaça real.'}}
  ]
});

// Module 62: Resiliência e Autoconhecimento
M.push({
  title: 'Resiliência e Autoconhecimento',
  desc: 'Desenvolva força interior, autoconhecimento e habilidades emocionais para a vida.',
  icon: '\u{1F4A1}', color: 'honey', discipline: 'emocional',
  lessons: [
    {title:'O que é Resiliência?',sub:'Aula 1',xp:30,quiz:{q:'O que define uma pessoa resiliente?',o:['Nunca sentir dor','Capacidade de se recuperar e crescer após adversidades','Ignorar problemas','Ser insensível'],c:1,exp:'Resiliência é a capacidade de enfrentar adversidades, aprender com elas e sair mais forte.'}},
    {title:'Autoconhecimento',sub:'Aula 2',xp:30,quiz:{q:'Qual é o primeiro passo para o autoconhecimento?',o:['Pedir opinião dos outros','Observar suas emoções sem julgamento','Ler muitos livros','Meditar 3 horas'],c:1,exp:'Autoconhecimento começa com auto-observação: notar emoções e padrões sem julgamento.'}},
    {title:'Lidando com Fracassos',sub:'Aula 3',xp:30,quiz:{q:'Na mentalidade de crescimento, o fracasso é:',o:['Prova de incapacidade','Oportunidade de aprendizado','Algo a evitar sempre','Culpa dos outros'],c:1,exp:'Na mentalidade de crescimento (Carol Dweck), fracassos são oportunidades de aprendizado.'}},
    {title:'Inteligência Social',sub:'Aula 4',xp:30,quiz:{q:'O que é inteligência social?',o:['Ter muitos seguidores','Capacidade de entender e navegar relações interpessoais','Ser popular','Saber manipular pessoas'],c:1,exp:'Inteligência social é compreender dinâmicas sociais e construir relações saudáveis.'}},
    {title:'Gerenciando a Raiva',sub:'Aula 5',xp:30,quiz:{q:'Qual técnica ajuda a controlar a raiva?',o:['Gritar','Respiração profunda e pausa','Ignorar','Culpar alguém'],c:1,exp:'Respiração profunda ativa o sistema parassimpático, permitindo que o cérebro racional retome o controle.'}},
    {title:'Ansiedade e Como Enfrentar',sub:'Aula 6',xp:30,quiz:{q:'Ansiedade moderada pode ser:',o:['Sempre prejudicial','Útil como alerta e motivação','Sinal de fraqueza','Impossível de controlar'],c:1,exp:'Ansiedade moderada é resposta natural que alerta e motiva. Só é problema quando crônica.'}},
    {title:'Autoestima Saudável',sub:'Aula 7',xp:30,quiz:{q:'Diferença entre autoestima saudável e narcisismo?',o:['Não há diferença','Autoestima reconhece falhas; narcisismo nega imperfeições','Narcisismo é melhor','Autoestima é para fracos'],c:1,exp:'Autoestima saudável inclui reconhecer qualidades e defeitos. Narcisismo é visão inflada e frágil.'}},
    {title:'Tomada de Decisão Emocional',sub:'Aula 8',xp:30,quiz:{q:'Por que decisões sob emoção forte tendem a ser piores?',o:['Emoções sempre atrapalham','O córtex pré-frontal fica menos ativo','Decisões emocionais são melhores','Não há relação'],c:1,exp:'Sob emoção intensa, a amígdala domina e o córtex pré-frontal fica menos ativo.'}},
    {title:'Empatia Avançada',sub:'Aula 9',xp:30,quiz:{q:'O que diferencia empatia de simpatia?',o:['São iguais','Empatia é sentir COM o outro; simpatia é sentir pena','Simpatia é mais profunda','Empatia é fingir'],c:1,exp:'Empatia é se colocar no lugar do outro. Simpatia é sentir pena à distância.'}},
    {title:'Construindo Caráter',sub:'Aula 10',xp:35,quiz:{q:'Qual virtude Aristóteles considerava central?',o:['Inteligência','Coragem (moderação entre covardia e imprudência)','Riqueza','Popularidade'],c:1,exp:'Aristóteles via a coragem como virtude central — o equilíbrio entre dois extremos.'}}
  ]
});

// Module 63: Psicologia do Dinheiro e Decisões
M.push({
  title: 'Psicologia do Dinheiro e Decisões',
  desc: 'Entenda os vieses mentais que afetam suas decisões financeiras e pessoais.',
  icon: '\u{1F9E0}', color: 'coral', discipline: 'psicologia',
  lessons: [
    {title:'Vieses Cognitivos',sub:'Aula 1',xp:30,quiz:{q:'O que são vieses cognitivos?',o:['Erros propositais','Atalhos mentais que podem levar a erros sistemáticos','Mentiras','Problemas de memória'],c:1,exp:'Vieses cognitivos são atalhos mentais que podem gerar erros sistemáticos de julgamento.'}},
    {title:'O Efeito Manada',sub:'Aula 2',xp:30,quiz:{q:'O efeito manada acontece quando:',o:['Pessoas decidem independentemente','Pessoas seguem o grupo contra seu julgamento','Animais migram','Todos concordam naturalmente'],c:1,exp:'No efeito manada, pessoas abandonam seu julgamento para seguir a maioria.'}},
    {title:'Aversão à Perda',sub:'Aula 3',xp:30,quiz:{q:'A dor de perder R$100 é, segundo Kahneman:',o:['Igual ao prazer de ganhar R$100','Menor que ganhar R$100','Cerca de 2x maior que ganhar R$100','Irrelevante'],c:2,exp:'Sentimos a dor de uma perda com intensidade ~2x maior do que o prazer de um ganho equivalente.'}},
    {title:'Gratificação Instantânea vs Futuro',sub:'Aula 4',xp:30,quiz:{q:'O Teste do Marshmallow demonstrou:',o:['Crianças preferem chocolate','Capacidade de adiar gratificação prevê sucesso futuro','Doces fazem mal','Crianças não sabem esperar'],c:1,exp:'Crianças que adiaram gratificação tiveram melhores resultados na vida adulta.'}},
    {title:'Ancoragem e Framing',sub:'Aula 5',xp:30,quiz:{q:'O que é o efeito de ancoragem?',o:['Quando um barco ancora','Quando a primeira informação influencia desproporcionalmente decisões','Quando fixamos uma meta','Quando pesquisamos preços'],c:1,exp:'Ancoragem: a primeira informação influencia desproporcionalmente nossas decisões posteriores.'}},
    {title:'Falácia do Custo Irrecuperável',sub:'Aula 6',xp:30,quiz:{q:'Exemplo de falácia do custo irrecuperável:',o:['Investir em algo promissor','Continuar filme ruim "porque já paguei o ingresso"','Desistir do que não funciona','Analisar custos antes'],c:1,exp:'Continuar investindo em algo ruim só porque já gastou recursos é a falácia do custo irrecuperável.'}},
    {title:'O Poder do Hábito',sub:'Aula 7',xp:30,quiz:{q:'O "loop do hábito" segundo Duhigg é:',o:['Começar, meio e fim','Gatilho, rotina e recompensa','Pensar, agir e descansar','Acordar, trabalhar e dormir'],c:1,exp:'Loop do hábito: gatilho (disparo), rotina (comportamento) e recompensa (ganho cerebral).'}},
    {title:'Escassez vs Abundância',sub:'Aula 8',xp:30,quiz:{q:'Mentalidade de abundância acredita que:',o:['Recursos são limitados e disputados','Há oportunidades para todos crescerem','Dinheiro não importa','Competição é desnecessária'],c:1,exp:'Mentalidade de abundância: valor pode ser criado, oportunidades são expandíveis.'}},
    {title:'Nudge: Arquitetura de Escolhas',sub:'Aula 9',xp:30,quiz:{q:'O que é um "nudge"?',o:['Ordem do governo','Empurrão gentil que direciona escolhas sem proibir','Regra obrigatória','Propaganda'],c:1,exp:'Nudge influencia decisões sem proibir opções. Ex: frutas na altura dos olhos incentiva saúde.'}},
    {title:'Pensamento Probabilístico',sub:'Aula 10',xp:35,quiz:{q:'Por que pensamento probabilístico é importante?',o:['Tudo é aleatório','Ajuda a tomar melhores decisões sob incerteza','Elimina toda incerteza','Só serve para matemática'],c:1,exp:'Pensamento probabilístico ajuda a avaliar riscos e decidir melhor sob incerteza.'}}
  ]
});

// Module 64: English Advanced
M.push({
  title: 'English Advanced',
  desc: 'Master advanced English skills: reading, writing, and critical thinking.',
  icon: '\u{1F1EC}\u{1F1E7}', color: 'sky', discipline: 'ingles', lang: 'en',
  lessons: [
    {title:'Reading Comprehension Strategies',sub:'Lesson 1',xp:30,quiz:{q:'What is the best strategy for understanding a difficult text?',o:['Read once quickly','Preview headings, read actively, summarize','Skip to the end','Only look at pictures'],c:1,exp:'Active reading with previewing and summarizing helps understand complex texts.'}},
    {title:'Writing Paragraphs',sub:'Lesson 2',xp:30,quiz:{q:'What is a topic sentence?',o:['The last sentence','A sentence introducing the main idea','A sentence with adjectives','The title'],c:1,exp:'A topic sentence introduces the main idea and guides the reader.'}},
    {title:'Phrasal Verbs That Matter',sub:'Lesson 3',xp:30,quiz:{q:'What does "give up" mean?',o:['To donate','To stop trying','To look up','To return'],c:1,exp:'"Give up" means to stop trying or quit.'}},
    {title:'Conditionals and Hypotheticals',sub:'Lesson 4',xp:30,quiz:{q:'Which uses the second conditional correctly?',o:['If I study, I will pass.','If I studied harder, I would pass.','If I had studied, I would have passed.','I study if I have time.'],c:1,exp:'Second conditional: If + past simple, would + verb for hypothetical situations.'}},
    {title:'Passive Voice in Action',sub:'Lesson 5',xp:30,quiz:{q:'Which sentence is passive voice?',o:['The dog chased the cat.','The cake was baked by my mother.','She is running.','They will arrive.'],c:1,exp:'Passive voice: the subject receives the action. Focus on receiver, not doer.'}},
    {title:'Debate and Opinion Writing',sub:'Lesson 6',xp:30,quiz:{q:'Best phrase for introducing a counterargument?',o:['I think','However, some people argue that...','In my opinion','Obviously'],c:1,exp:'Considering opposing views makes your argument stronger and more balanced.'}},
    {title:'Idioms and Cultural Expressions',sub:'Lesson 7',xp:30,quiz:{q:'What does "break the ice" mean?',o:['Damage frozen water','Start conversation in an awkward situation','Break something cold','Refuse to talk'],c:1,exp:'"Break the ice" means to relieve tension or start conversation.'}},
    {title:'Business English Basics',sub:'Lesson 8',xp:30,quiz:{q:'Most appropriate formal email greeting?',o:['Hey!','Dear Mr. Smith,','Yo, what\'s up?','Hi buddy'],c:1,exp:'"Dear Mr./Ms. [Name]," is standard for formal business emails.'}},
    {title:'Critical Reading: News in English',sub:'Lesson 9',xp:30,quiz:{q:'What to check first evaluating a news article?',o:['How many likes','Source, author credentials, evidence','If it matches your opinion','Article length'],c:1,exp:'Evaluating source credibility and evidence helps distinguish reliable journalism.'}},
    {title:'Creative Writing Workshop',sub:'Lesson 10',xp:35,quiz:{q:'What makes descriptive writing engaging?',o:['Long sentences','Sensory details (sight, sound, smell, touch, taste)','Only adjectives','Writing as much as possible'],c:1,exp:'Sensory details make writing vivid: "roses filled the warm air with sweet perfume."'}}
  ]
});

// Module 65: Ética e Futuro da IA
M.push({
  title: 'Ética e Futuro da IA',
  desc: 'Explore os dilemas éticos e o impacto da IA no futuro da humanidade.',
  icon: '\u{1F916}', color: 'lavender', discipline: 'ia',
  lessons: [
    {title:'O que é Ética na IA?',sub:'Aula 1',xp:30,quiz:{q:'Por que a ética na IA é importante?',o:['Robôs têm sentimentos','Decisões algorítmicas afetam milhões e podem perpetuar injustiças','IA é sempre perigosa','Cientistas querem controlar tudo'],c:1,exp:'Algoritmos afetam decisões em crédito, saúde, justiça e emprego. Sem ética, perpetuam preconceitos.'}},
    {title:'Viés Algorítmico',sub:'Aula 2',xp:30,quiz:{q:'Como viés algorítmico surge?',o:['A IA decide ser preconceituosa','Através de dados que refletem preconceitos históricos','Erro intencional','Não existe'],c:1,exp:'Se treinada com dados históricos preconceituosos, a IA reproduz esses padrões discriminatórios.'}},
    {title:'Privacidade na Era Digital',sub:'Aula 3',xp:30,quiz:{q:'O que é "capitalismo de vigilância"?',o:['Câmeras em lojas','Modelo que lucra coletando e vendendo dados pessoais','Segurança bancária','Proteção governamental'],c:1,exp:'Capitalismo de vigilância (Shoshana Zuboff): empresas lucram coletando e vendendo dados pessoais.'}},
    {title:'Deepfakes e Desinformação',sub:'Aula 4',xp:30,quiz:{q:'O que são deepfakes?',o:['Notícias falsas','Vídeos/áudios falsos criados por IA que parecem reais','Fotos editadas','Perfis falsos'],c:1,exp:'Deepfakes são conteúdos gerados por IA tão realistas que são difíceis de distinguir de reais.'}},
    {title:'IA e o Mercado de Trabalho',sub:'Aula 5',xp:30,quiz:{q:'Melhor estratégia para o impacto da IA no emprego?',o:['Evitar tecnologia','Desenvolver criatividade, empatia e pensamento crítico','Trabalhar só com IA','Ignorar'],c:1,exp:'Habilidades humanas difíceis de automatizar + conhecimento técnico = melhor preparação.'}},
    {title:'Carros Autônomos: Dilemas Éticos',sub:'Aula 6',xp:30,quiz:{q:'O problema do bonde em carros autônomos questiona:',o:['Combustível','Como IA deve decidir quando qualquer ação causa dano','Se devem ser elétricos','Velocidade máxima'],c:1,exp:'O dilema questiona como programar IA para escolher em acidentes inevitáveis. Sem resposta fácil.'}},
    {title:'IA na Saúde',sub:'Aula 7',xp:30,quiz:{q:'Benefício real da IA na medicina?',o:['Substituir médicos','Detectar doenças em exames com precisão igual/superior a médicos','Curar todas as doenças','Eliminar hospitais'],c:1,exp:'IA já supera médicos em detecção de certas doenças em exames de imagem.'}},
    {title:'Regulação de IA no Mundo',sub:'Aula 8',xp:30,quiz:{q:'O que é o AI Act da UE?',o:['Lei que proíbe IA','Primeira regulação abrangente classificando IA por nível de risco','Programa de pesquisa','Empresa de tecnologia'],c:1,exp:'AI Act (2024) classifica sistemas por risco e define regras para cada nível.'}},
    {title:'Superinteligência: Mito ou Realidade?',sub:'Aula 9',xp:30,quiz:{q:'O que é AGI?',o:['IA que usamos hoje','IA hipotética capaz de qualquer tarefa intelectual humana','Tipo de videogame','IA para uma tarefa só'],c:1,exp:'AGI é IA hipotética com capacidade geral comparável à humana, diferente da IA estreita atual.'}},
    {title:'Seu Papel no Futuro da IA',sub:'Aula 10',xp:35,quiz:{q:'Como jovens podem influenciar o futuro da IA?',o:['Não usando tecnologia','Aprendendo sobre IA, debatendo ética e exigindo transparência','Deixando para adultos','Usando IA só para diversão'],c:1,exp:'Jovens informados podem exigir transparência, debater ética e criar IA responsável.'}}
  ]
});

console.log('Total modules:', M.length);
console.log('Total lessons:', M.reduce((s,m) => s + m.lessons.length, 0));
fs.writeFileSync('./lessons/index.json', JSON.stringify(M));
console.log('index.json updated!');
