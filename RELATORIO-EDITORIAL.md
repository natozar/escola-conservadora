# Relatorio Editorial — Curriculo Escola Liberal

Data: 2026-04-25
Auditor: Editor-chefe (revisao automatizada + amostragem qualitativa)
Escopo: 174 modulos × 10 aulas = 1.740 aulas em 29 disciplinas

---

## Sumario Executivo

**Estado geral:** curriculo solido, com vies liberal-classico/austriaco coerente,
disciplinas balanceadas (6 mods cada). Sequencia de aulas DENTRO dos modulos
amostrados e majoritariamente pedagogica. Identificados 4 problemas estruturais
(corrigidos) e 6 decisoes editoriais pendentes (precisam de julgamento humano).

---

## ✅ Correcoes Aplicadas (automaticas)

### 1. IDs ausentes em 28 modulos (mod-38 a mod-65)
Todos esses modulos estavam sem campo `id` no `lessons/index.json` e nos arquivos
`mod-N.json`. Sem ID, qualquer codigo que fizesse `m.id` recebia `undefined`,
causando colisoes potenciais.

**Acao:** ID semantico gerado via slugify do `title` (ex: `economia-dos-paises`,
`founding-fathers-constitution`, `python-para-iniciantes`).

### 2. Colisao de ID `finance` (mod-3 e mod-23)
- **mod-3** (disciplina economia): "Financas Pessoais" usava `id:finance`
- **mod-23** (disciplina financas): "Financas na Pratica" usava `id:finance`

**Acao:** mod-3 renomeado para `economia-financas`. mod-23 mantem `finance`.

### 3. Ortografia `espanol` -> `espanhol`
Em portugues, escreve-se "espanhol" (com h). A disciplina e os 6 modulos
estavam grafados sem h, o que e erro ortografico em PT-BR.

**Acao:**
- `src/core/disciplines.js`: chave da disciplina renomeada `espanol` -> `espanhol`
- 6 modulos atualizados (campo `discipline` + IDs `espanol-*` -> `espanhol-*`)
- Verificado: nenhum codigo-fonte referenciava a string `espanol` por literal

### 4. Sequencia de aulas em mod-0 (O que e Dinheiro?)
**Antes:** macro 1-5 -> pessoal 6-7 -> macro 8-9 -> futuro 10. As aulas de juros
compostos e poupanca quebravam o fio do contexto macroeconomico.

**Depois:** macro completo (1-5 + impostos + banco central) -> pessoal (juros +
poupanca) -> futuro (Bitcoin). Fluxo logico contiguo.

```
1. A Vida Antes do Dinheiro
2. O Surgimento da Moeda
3. O que Da Valor ao Dinheiro?
4. O Padrao-Ouro
5. O que e Inflacao?
6. Impostos e o Estado          [movido]
7. Banco Central                [movido]
8. Juros Compostos              [movido]
9. Poupanca vs. Consumismo      [movido]
10. O Futuro do Dinheiro
```

---

## 🟡 Decisoes Editoriais Pendentes (precisam de aprovacao)

### A. Sobreposicao entre disciplinas

#### A.1 economia mod-3 (Financas Pessoais) ⇄ disciplina `financas` inteira
A disciplina `economia` tem um modulo dedicado a "Financas Pessoais" — mas existe
uma disciplina inteira chamada `financas` com 6 modulos sobre o tema. Conteudo
provavel sobreposto.

**Recomendacao:** transformar economia mod-3 em modulo de macro economia
("Macroeconomia Aplicada" ou "Politicas Economicas"), deixando `financas` como
unico lugar para topicos pessoais. **OU** consolidar todos em `financas`.

#### A.2 economia mod-2 (Empreendedorismo) ⇄ disciplina `empreendedorismo`
Mesmo padrao. economia tem 1 modulo de empreendedorismo, e `empreendedorismo` tem
6. Provavel duplicidade conceitual.

**Recomendacao:** substituir economia mod-2 por "Comercio Internacional" ou
"Mercado de Trabalho" — temas economicos puros.

#### A.3 economia mod-5 (Pensamento Critico) ⇄ disciplina `logica`
"Pensamento Critico" e um modulo da disciplina `economia`, mas as aulas dentro
dele sao 90% falacias economicas (janela quebrada, soma zero, valor-trabalho).
Cabe em economia, mas o nome confunde com `logica`.

**Recomendacao:** renomear para "Falacias Economicas" ou "Mitos Economicos".

### B. Titulos similares entre modulos

#### B.1 Marketing
- mod-71: "Marketing Digital: Fundamentos"
- mod-91: "Marketing Digital"

Sao modulos diferentes na mesma disciplina. Nomes confundem.

**Recomendacao:** ler ambos e decidir:
- (a) Consolidar em um modulo unico
- (b) Renomear mod-91 para "Estrategia de Marketing Digital" ou "Marketing Digital Avancado"

#### B.2 Logica — Falacias
- mod-44: "Falacias e Manipulacao"
- mod-146: "Falacias e Manipulacao Argumentativa"

Tema quase identico.

**Recomendacao:** renomear mod-146 para "Tecnicas de Persuasao Etica" ou
"Argumentacao Profissional", focando no lado positivo (como argumentar bem) em
contraste com mod-44 (como detectar falacias).

### C. Sequencia ENTRE modulos dentro de uma disciplina

A ordem dos modulos dentro de cada disciplina segue o numero do arquivo
(`mod-N.json`), o que reflete a ordem historica em que foram criados — nao
necessariamente a ordem pedagogica ideal. Exemplos:

#### C.1 filosofia
Atual: 7-22-61-103-104-105
- mod-7: Aprender a Pensar (introdutorio)
- mod-22: Etica e Dilemas Modernos (tematico)
- mod-61: Filosofia Politica e Liberdade (tematico)
- mod-103: Filosofia Antiga (Socrates) (historico, FUNDAMENTAL)
- mod-104: Filosofia Moderna (Descartes, Kant)
- mod-105: Filosofia Contemporanea

**Problema:** o aluno chega em "Etica" antes de saber quem foi Aristoteles. O
historico (103-105) e fundacional, deveria vir antes.

**Ordem ideal:** 7 (intro) -> 103 (antiga) -> 104 (moderna) -> 105 (contemp) ->
22 (etica) -> 61 (politica).

#### C.2 matematica
Atual: 6-14-15-73-74-160
- mod-6: Numeros e Operacoes
- mod-14: Fracoes e Decimais
- mod-15: Geometria
- mod-73: Estatistica
- mod-74: Matematica Financeira
- mod-160: Algebra para a Vida

**Problema:** Algebra (mod-160) e ferramenta basica que sustenta estatistica e
matematica financeira, mas vem POR ULTIMO. O aluno precisa entender variavel
antes de calcular juros compostos com formula.

**Ordem ideal:** 6 -> 14 -> 15 -> 160 -> 74 -> 73 (algebra antes de aplicacoes).

#### C.3 financas
Atual: 23-27-37-69-70-161
- mod-23: Financas na Pratica
- mod-27: Mentalidades de Prosperidade

**Problema:** mentalidade deveria vir antes da pratica (mindset -> acao).

**Ordem ideal:** 27 -> 23 -> 37 -> 69 -> 70 -> 161

#### C.4 logica
Atual: 36-44-45-145-146-147
- mod-145: Logica Formal: Argumentos Validos (FUNDACAO)
- mod-44/146: Falacias (DEPENDE de saber argumento valido)

**Problema:** logica formal vem mod-4 quando deveria ser mod-1 (junto com 36).

**Ordem ideal:** 36 -> 145 -> 44 -> 146 -> 45 -> 147

**OBSTACULO TECNICO PARA C.x:** o app provavelmente lista os modulos pela ordem
no `index.json` (que reflete os numeros de arquivo `mod-N.json`). Reordenar a
exibicao requer:
- (a) Adicionar campo `order` numerico em cada modulo + atualizar
  `getDiscModules()` em disciplines.js para ordenar por esse campo
- (b) **OU** renomear arquivos fisicamente (`mod-103.json` -> `mod-7b.json`),
  o que afeta integrity manifest, watermarks, SW cache

**Recomendacao:** adicionar campo `order` (opcao a) — minimamente invasivo,
preserva URLs e cache.

### D. Sobre `historia` vs `history`

Atualmente coexistem:
- `historia` (PT, foco Brasil): mod-12 a mod-17 + outros
- `history` (EN, foco EUA): mod-13, mod-40, mod-41 + outros

**Conteudo legitimamente diferente** (historia do Brasil ≠ historia americana),
mas a separacao por idioma e atipica — outras disciplinas tem o conteudo em PT
mesmo no app bilingue (a traducao e na UI, nao no conteudo).

**Recomendacao:**
- (a) Manter como esta (foco geografico explicito)
- (b) Renomear `history` -> `historia-eua` ou consolidar em `historia` com
  marcacao de regiao por modulo
- (c) Criar `historia-mundial` como nova disciplina cobrindo Roma, Egito,
  Idade Media, etc, com `history` se tornando subconjunto traduzido

---

## 📊 Estatistica final pos-fix

```
Total de modulos:        174
Disciplinas:              29
Modulos por disciplina:    6 (uniforme)
Aulas por modulo:         10 (padrao)
Total de aulas:        1.740
Modulos sem ID:            0  (era 28)
IDs duplicados:            0  (era 1)
Erros ortograficos:        0  (era 1)
```

---

## Proximos passos sugeridos

**Curto prazo (esta sessao):**
- [x] Aplicar fixes A-D estruturais
- [x] Rebuild + verificar integrity manifest
- [x] Bump SW

**Medio prazo (proxima sessao, exige decisao):**
- [ ] Decidir sobreposicao economia ⇄ financas/empreendedorismo (item A)
- [ ] Renomear modulos com titulos similares (item B)
- [ ] Implementar campo `order` para reordenar disciplinas (item C)
- [ ] Decidir estrutura `historia`/`history` (item D)

**Longo prazo (expansao):**
- Conforme CLAUDE.md, `Identidade do Projeto` diz "21 disciplinas, 66 modulos"
  mas a realidade e 29 disciplinas, 174 modulos. Atualizar tagline ou consolidar.
- Distribuicao desigual ja foi mitigada (todos com 6 mods agora), mas a
  PROFUNDIDADE varia: algumas disciplinas tem aulas curtas, outras densas.
  Auditar XP medio por aula como proxy de profundidade.
