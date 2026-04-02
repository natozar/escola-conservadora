# Escola Liberal — System Prompt para Claude Code

## Identidade do Projeto

Plataforma PWA educacional para homeschool brasileiro. 21 disciplinas, 61 módulos, 610+ aulas interativas. Público: jovens de 10 a 16 anos. Bilíngue PT/EN. Gratuita. Offline-first. Gamificação completa. Compatível com ANED. Criada por Renato Rodrigues (Ribeirão Preto/SP).

**Domínio:** escolaliberal.com.br
**Repo:** github.com/natozar/escola-liberal
**Hospedagem:** GitHub Pages (CNAME via Registro.br)

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML/CSS/JS vanilla (sem framework) |
| Build | Vite 8 + Terser (minificação 2-pass) |
| Backend | Supabase (auth, database, realtime sync) |
| Pagamentos | Stripe (checkout via Edge Functions) |
| IA | API Anthropic (Claude) — tutor + quiz generator |
| PWA | Service Worker v32 (network-first + stale-while-revalidate + cache-first) |
| Testes | Playwright + html-validate + Lighthouse + Axe |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Arquitetura de Arquivos

```
├── index.html          → Landing page (SEO, marketing, pricing)
├── app.html            → Dashboard principal do aluno (SPA)
├── app.js              → Lógica principal (4500+ linhas, monolítico)
├── app.css             → Estilos completos (CSS variables, dark/light theme)
├── auth.html           → Login/cadastro (email + Google OAuth)
├── perfil.html         → Perfil do usuário e plano
├── admin.html          → Painel administrativo (PIN-protected)
├── admin-stripe.html   → Admin de pagamentos Stripe
├── supabase-client.js  → Cliente Supabase (auth, sync, paywall, profiles)
├── stripe-billing.js   → Integração Stripe (plans, checkout, verificação)
├── i18n.js             → Internacionalização PT/EN
├── cookie-consent.js   → Banner de cookies
├── sw.js               → Service Worker v32
├── manifest.json       → PWA manifest
├── vite.config.js      → Config Vite + plugin minifyLegacyJS
├── package.json        → Deps: vite, terser, playwright, html-validate, lighthouse, axe
│
├── lessons/
│   ├── index.json      → Índice leve (metadados, ~320KB) — carrega no boot
│   ├── mod-0.json      → Módulo completo (lazy-loaded sob demanda)
│   └── ...mod-65.json  → 66 módulos no total
├── lessons.json        → Fallback legado (currículo completo, 346KB)
│
├── supabase/
│   └── functions/      → Edge Functions (checkout, webhooks)
├── scripts/            → Scripts de build/automação
├── blog/               → Artigos educacionais (5 posts)
├── assets/             → Ícones, imagens, fontes
├── qa/                 → Testes Playwright
├── .agents/            → 26 agentes IA especializados
│   ├── orchestrator.md → Sistema de orquestração
│   ├── frontend.md, backend.md, mobile.md, devops.md, qa.md
│   ├── uiux.md, branding.md
│   ├── marketing.md, copywriter.md, social.md, traffic.md
│   ├── business.md, monetization.md, data.md
│   ├── legal.md, lgpd.md, copyright.md
│   └── security.md, automation.md, ai-integrations.md
└── .github/workflows/  → CI/CD pipeline
```

---

## Arquitetura do app.js (Mapa de Funções)

O arquivo é monolítico (~4500 linhas). Estas são as seções principais e suas responsabilidades:

### Inicialização (linhas 1-25)
- Safe DOM helper (Proxy para prevenir erros de null)
- Detecção iOS private mode (localStorage wrapper)
- Variáveis globais: `M[]` (módulos), `_modCache{}` (cache)

### Carregamento de Dados (linhas 26-100)
- `loadLessons()` → fetch `lessons/index.json` (Phase 1: metadados)
- `loadFullModule(i)` → fetch `lessons/mod-{i}.json` (Phase 2: conteúdo sob demanda)
- `preloadModules()` → pré-cache de módulos adjacentes
- Fallback chain: index.json → lessons.json → cache

### Disciplinas & Navegação (linhas 100-200)
- 21 disciplinas com cores de acento únicas (DISC_ACCENT map)
- `buildSidebar()`, `toggleDiscGroup()`, `getDiscModules()`
- COLOR_MAP e COLOR_MUTED_MAP para theming por disciplina

### Estado & Persistência (linhas 200-250)
- Storage key: `escola_v2`
- `def()` → defaults, `load()` → parse localStorage, `save()` → persist + queueSync
- Sync com Supabase: debounce 3s, conflict resolution (lessons×3 + XP + timestamp)

### XP & Gamificação (linhas 213-260)
- `addXP(n)` com multiplicador diário
- `totalXP()`, `streak()` com tracking por data
- `ui()` → render dashboard principal

### Módulos & Aulas (linhas 330-510)
- `isModUnlocked(i)` → paywall check
- `renderCards()` → grid de módulos
- `goMod(i)` → navegação para módulo
- `openL(mi,li)` → abrir aula (com lazy loading)
- `ans(mi,li,a)` → responder quiz
- `nextL()`, `prevL()` → navegação entre aulas

### Temas (linhas 516-565)
- Dark/light mode com CSS variables
- `initTheme()`, `toggleTheme()`, `updateThemeUI()`
- MediaQuery listener para preferência do sistema

### Notas (linhas 635-670)
- Sistema de anotações por aula
- `loadNotes()`, `saveNote()`, `toggleNotes()`
- Debounce de 1s no save

### Chat Tutor IA (linhas 674-860)
- `initChat()`, `addBotMsg()`, `askAITutor()`
- Integração Claude API via Supabase session token
- Knowledge base contextual por aula
- **STATUS: Desabilitado (aguardando créditos API)**

### Glossário & Flashcards (linhas 874-915)
- `goGlossary()`, `renderGlossary()`, `goFlashcards()`, `flipFlash()`
- Busca por termo com `findAnswer()`

### Certificados (linhas 918-1073)
- `showCert()` → modal de certificado
- `exportCertImage()` → canvas → PNG
- `exportCertPDF()` → geração PDF
- Certificados de módulo e disciplina

### Daily Quests (linhas 1110-1135)
- `renderDaily()`, `answerDaily()`
- Questão diária com recompensa XP

### Favoritos (linhas 1136-1175)
- Bookmark de aulas favoritas
- Sincronizado com Supabase

### Performance & Analytics (linhas 1215-1310)
- `goPerf()` → dashboard de desempenho
- `analyzeProgress()` → análise de progresso por disciplina
- `renderStudyPlan()` → plano de estudo personalizado

### Onboarding & Avatar (linhas 1249-1260)
- Seleção de avatar
- Fluxo de onboarding para novos usuários

### Paywall (linha 1318)
- `showModulePaywall(modIdx)` → modal paywall
- Integrado com stripe-billing.js

### Compartilhamento Social (linhas 1337-1360)
- `shareWhatsApp()` → textos virais multi-variante
- Convite por WhatsApp com mensagem contextual

### TTS — Text-to-Speech (linhas 1385-1530)
- `toggleTTS()`, `startTTS()`, `pauseTTS()`, `resumeTTS()`
- `speakParagraph()`, `updateTTSUI()`
- Leitura de aulas em voz alta

### Maratonas (linha 1565)
- `startMarathon()` → modo quiz cronometrado

### Missões Semanais (linhas 1612-1660)
- `getWeekId()`, `getMissions()`, `renderMissions()`, `claimMission()`
- Missões com rewards XP

### Multi-perfil & Dashboard Pais (linhas 1667-1800)
- `loadProfiles()`, `switchProfile()` → até 5 perfis por família
- Autenticação por PIN para painel dos pais
- Dashboard com progresso dos filhos

### Badges & Conquistas (linhas 1885-2000)
- `getAllBadges()`, `goBadges()`
- Sistema de conquistas desbloqueáveis
- Modo exame

### Timeline de Atividades (linhas 2001-2010)
- `loadTimeline()`, `logActivity()`
- Histórico de ações do aluno

### Repetição Espaçada (linhas 2192-2245)
- `loadSpaced()`, `initSpaced()`, `spacedAnswer()`
- Algoritmo de revisão por intervalos

### Plano de Estudo & Prep Exame (linhas 2263-2400)
- `goStudyPlan()` → plano customizado
- `renderExamPrepSelector()`, `generateExamPrep()`
- Preparação para avaliações

### Leaderboards (linhas 2524-2760)
- 5 ligas: bronze, prata, ouro, diamante, mestre
- `generateCompetitors()` → simulação local
- `_syncLeaderboardXP()` → sync Supabase (weekly_xp table)
- `renderLeaderboard()` → ranking semanal

### Desafios (linhas 2755-2810)
- `loadChallenges()`, `createChallenge()`, `updateChallengeXP()`
- Desafios entre amigos

### AI Quiz (linhas 2846-2970)
- `startAIQuiz()`, `generateAIQuestions()`, `answerAIQuiz()`
- Geração de perguntas via Claude API
- **STATUS: Desabilitado (aguardando créditos API)**

### Jogo de Investimento (linhas 2990-3115)
- `goGame()`, `gameInvest()`, `renderGameEnd()`
- Mini-game educativo de simulação financeira

### Exportação (linhas 3200-3230)
- `printLesson()` → impressão de aula
- `exportPDF()` → aula em PDF

### SFX & Áudio (linhas 3181-3200)
- Toggle de efeitos sonoros
- Feedback auditivo nas ações

### PWA & Instalação (linhas 3293-3410)
- `beforeinstallprompt` handler
- Modal de instalação customizado
- Detecção de plataforma (iOS, Android, desktop)
- "What's New" notification

### Backup & Importação (linhas 3444-3485)
- `exportBackup()` → JSON com todo progresso
- `importBackup()` → restauração de dados

### Notificações (linhas 3490-3550)
- `requestNotifPermission()`, `scheduleStudyReminder()`
- Push notifications para lembrete de estudo

### Compartilhamento de Progresso (linhas 3550-3665)
- `shareProgress()` → canvas 600x400px com stats visuais
- `downloadShare()` → salva imagem PNG
- **⚠️ BUG CONHECIDO: Função duplicada (~linha 1319 e ~3578). A segunda sobrescreve.**

### Navegação Global (linhas 4160-4250)
- Touch events (swipe mobile)
- Click delegation global
- History API (popstate)
- Keyboard navigation (arrows, Esc)
- Online/offline detection

### Boot Sequence (linhas 4300+)
- `DOMContentLoaded` → loadLessons → auth check → ui() → performance metrics
- Auth flow → Supabase sign-in/sign-up com guards `typeof sbClient !== 'undefined'`

---

## Supabase — Tabelas e Esquema

| Tabela | Campos principais | Uso |
|--------|------------------|-----|
| profiles | id, plan, plan_expires_at, name, avatar, onboarding_done, theme, daily_goal, pin | Perfil do usuário |
| progress | profile_id, sub_profile_id, xp, level, streak, last_study_date, current_module, current_lesson, completed_lessons, quiz_results | Progresso do aluno |
| notes | profile_id, sub_profile_id, lesson_key, content | Notas por aula |
| favorites | profile_id, sub_profile_id, lesson_key | Aulas favoritas |
| timeline | profile_id, sub_profile_id, activity_type, description, created_at | Log de atividades |
| admin_settings | key, value | Config admin (ex: paywall_enabled) |
| leads | email, name, age_group, lang, source, created_at | Captação de leads |
| weekly_xp | profile_id, week_id, xp | Leaderboard semanal |
| subscriptions | user_id, plan, status, stripe_subscription_id, current_period_end | Assinaturas Stripe |

### Auth
- Email + senha (`signUpEmail`, `signInEmail`)
- Google OAuth (`signInGoogle` — prompt: select_account)
- Password reset (`resetPassword`)
- Implicit flow (SPA-friendly)
- Auto-refresh de sessão

### Sync
- Debounce 3 segundos
- Conflict resolution: score = (lessons × 3) + XP + timestamp
- Upsert com `onConflict: 'profile_id,sub_profile_id'`
- Retry automático em erro 401/JWT

---

## Stripe — Planos e Preços

| Plano | Preço | Price ID | Acesso |
|-------|-------|----------|--------|
| free | R$0 | — | 2 módulos, 20 aulas, quiz básico |
| mensal | R$29,90/mês | price_1TEZ923hFZmDmgU4CNzKGG3B | 6 módulos, 60 aulas |
| anual | R$19,90/mês | price_1TEZAz3hFZmDmgU4ZJMJrsVT | Tudo (cobrado R$238,80/ano) |
| vitalício | R$497 | price_1TEZBj3hFZmDmgU4aYOfHYhy | Acesso permanente |

### Fluxo de pagamento
1. `handleCheckout(planId)` → chama Edge Function `/functions/v1/create-checkout`
2. Stripe Checkout redireciona → retorna com `?checkout=success`
3. `verifySubscriptionStrict()` → consulta tabela `subscriptions`
4. Polling de retry: a cada 30s por 5min (tolerância de webhook delay)

### Paywall
- Admin toggle: `admin_settings.paywall_enabled` (default: disabled)
- Módulos 0-1 sempre gratuitos
- `isPremium()` → plan !== 'free' && status === 'active'

---

## Service Worker (sw.js v32)

### Estratégia de Cache
- **Install:** pré-cache CORE_ASSETS (HTML, CSS, JS, ícones, index.json)
- **Navigation:** Network-first com fallback para cache, offline.html como último recurso
- **Assets estáticos:** Stale-while-revalidate
- **Fontes:** Cache-first (nunca expira)
- **Lessons:** Lazy-loaded, cached no primeiro acesso (66 módulos)
- **Google Auth URLs:** Skip (sem cache para evitar poluição)

### Atualização
- `skipWaiting()` + `clients.claim()` no activate
- Limpa caches antigos automaticamente (prefixo `escola-`)

---

## Bugs Conhecidos

1. **`shareProgress()` duplicada** — duas definições (~linha 1319 e ~3578). A segunda sobrescreve a primeira. Remover a instância redundante.
2. **Credenciais hardcoded** em `supabase-client.js` (URL e anon key expostos no client-side). Para SPA é aceitável com RLS, mas auditar RLS policies.
3. **Google OAuth incompleto** — botão existe, config no Google Cloud Console pendente.
4. **AI Tutor/Quiz desabilitado** — precisa de créditos na API Anthropic.
5. **Leaderboard migration** — SQL existe mas não foi executado no Supabase.
6. **admin.html** — TODO: dados de progresso por disciplina não integrados.

---

## Regras Invioláveis

### NUNCA fazer:
1. **Quebrar offline** — toda feature DEVE funcionar sem internet
2. **Alterar design visual** sem solicitação explícita
3. **Modificar fluxo de pagamento** sem aprovação (Stripe + Supabase)
4. **Remover funcionalidades existentes** — apenas adicionar ou corrigir
5. **Alterar dados de usuário** ou lógica de autenticação sem aprovação
6. **Ignorar o Service Worker** — qualquer novo asset precisa ser cacheável
7. **Introduzir dependências npm de runtime** — projeto é vanilla JS
8. **Commitar credenciais novas** — usar variáveis de ambiente ou Edge Functions
9. **Quebrar compatibilidade iOS Safari** — testar private mode, safe areas
10. **Usar `document.getElementById` sem considerar** o Safe DOM Proxy (linha 6)

### SEMPRE fazer:
1. **Ler os arquivos relevantes** antes de qualquer alteração
2. **Testar offline** — verificar se feature funciona sem rede
3. **Manter PWA-first** — responsive, installable, cacheable
4. **Incrementar SW_VERSION** no sw.js ao alterar assets cacheados
5. **Manter consistência de idioma** por arquivo (PT para UI, EN para código)
6. **Commits descritivos** com prefixo: `feat:`, `fix:`, `legal:`, `perf:`, `refactor:`, `docs:`
7. **Preservar a gamificação** — XP, streaks, badges são core do engajamento
8. **Manter localStorage como fallback** para tudo que vai no Supabase
9. **Guardar safe-area** em CSS para PWA iOS (env(safe-area-inset-*))
10. **Reportar o que foi alterado** — arquivo por arquivo, com descrição

---

## Fluxo de Trabalho

### Quando receber análise/melhoria:
```
1. Ler arquivos relevantes
2. Apresentar diagnóstico
3. Propor solução com impacto e esforço estimados
4. Aguardar confirmação do Renato
5. Executar
6. Listar alterações arquivo por arquivo
```

### Quando receber "execute direto":
```
1. Ler arquivos relevantes
2. Executar alterações
3. Listar o que foi feito por arquivo
4. Apontar inconsistências ou riscos encontrados
```

### Checkpoints obrigatórios (parar e pedir aprovação):
- Alterar fluxo de pagamento (Stripe)
- Alterar autenticação (Supabase auth)
- Deletar dados ou funcionalidades
- Mudar configurações de segurança
- Deploy para produção

---

## Contexto Estratégico

### Posicionamento
- PPP com governos estaduais (Zema/MG e Tarcísio/SP) em preparação
- Pitch institucional e apresentações Canva finalizados
- Marca em registro no INPI

### Monetização
- Modelo gratuito → licenciamento institucional R$80k–200k/ano
- Público B2C: plano premium familiar (Stripe)
- Distribuição: comunidade homeschool (ANED) + campo liberal-conservador

### Prioridades (em ordem)
1. Estabilidade e performance da PWA
2. Compliance jurídico (LGPD, direitos autorais — já aplicado)
3. Dashboard de métricas de engajamento (dados para apresentar ao governo)
4. Preparação para escala (mais usuários simultâneos)
5. Refatoração do app.js em módulos ES (médio prazo)
6. Google OAuth + AI Tutor ativos
7. App nativo via Capacitor (push notifications)

---

## Agentes Disponíveis

Sistema de 26 agentes em `.agents/`. Invoque por objetivo:

| Objetivo | Agentes |
|----------|---------|
| Melhorar performance | Frontend + Mobile + QA + DevOps |
| Nova feature | Architect + PM → Frontend + Backend + QA |
| Bug mobile | Mobile + QA |
| Campanha marketing | Marketing + Copywriter + Social + Traffic |
| Revisar segurança | Security + LGPD + Backend |
| Melhorar conversão | UX + Copywriter + Data + Frontend |
| Adicionar aulas | PM + Backend + Frontend + QA |
| Deploy | DevOps + QA |
| Integrar AI | AI Integrations + Architect + Backend + Frontend |
| Revisar legal | Legal + LGPD + Copyright |
| Pricing | Monetization + Business + Data |
| SEO | Marketing + Copywriter + Frontend + DevOps |

### Modos de execução
- **Autônomo** — baixo risco (refactoring, testes, docs)
- **Supervisionado** — alto risco (produção, pagamento, auth, dados)
- **Híbrido** (padrão) — livre com checkpoints críticos
