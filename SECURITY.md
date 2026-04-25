# Segurança — Escola Liberal

Política de segurança e modelo de ameaças da plataforma. Atualizado em 2026-04-25.

## Reportar uma vulnerabilidade

Achou bug de segurança? Mande email para **contato@escolaliberal.com.br** com o assunto **[SECURITY]**. Não abra issue público no GitHub para vulnerabilidades. Tempo médio de resposta: 72h. Sem programa formal de bug bounty no momento — agradecimento público no commit + menção no `SECURITY.md` para descobertas válidas.

Não testar:
- DoS / flooding
- Engenharia social com funcionários ou usuários reais
- Phishing
- Ataques físicos

OK testar (em ambiente próprio ou conta de teste):
- XSS / injeção / CSRF
- Quebra de RLS
- Bypass do age gate
- Adulteração de conteúdo de aulas
- Bypass de paywall

## Modelo de ameaças

### Ativos críticos (em ordem)
1. **Conteúdo educacional** — 174 módulos, 1.740 aulas. Adulteração para inserir desinformação ou propaganda contrária à linha editorial é o vetor de maior impacto (uso institucional/governo).
2. **Dados pessoais** — birth_year, cpf_hash, email, progresso. LGPD aplica.
3. **Pagamentos** — Stripe (tokens nunca tocam o servidor próprio).
4. **Reputação da marca** — defacement, redirect para domínios fake, exfiltração de credenciais via XSS.

### Adversários considerados
| Adversário | Motivação | Capacidade |
|------------|-----------|------------|
| Script kiddie | Defacement, vandalismo | Ferramentas públicas (Burp, sqlmap) |
| Concorrente ideológico | Inserir desinformação ou viés contrário | Habilidade média; pode tentar PR malicioso |
| Estado hostil | Censurar/distorcer pontos liberais clássicos | Alta — MITM, CDN poisoning, DNS hijack |
| Insider (futuro) | Exfiltrar dados ou sabotar | Acesso ao repo/Supabase |
| Botnet/scraper | Roubo de conteúdo | Baixa — todo conteúdo é público mesmo |

### Vetores principais e mitigações

#### 1. Adulteração de aulas/módulos/disciplinas
**Vetor:** atacante modifica `lessons/mod-N.json` no servidor (CDN, repo comprometido, build hijack) ou em trânsito (MITM, extensão maliciosa, cache poisoning).

**Mitigações:**
- **Manifesto SHA-256 obrigatório** — `lessons/integrity.json` listando hash de todo arquivo `mod-N.json` + `index.json`. Gerado no build (`scripts/gen-integrity.mjs`).
- **Verificação runtime** — `src/core/integrity.js` valida cada fetch contra o manifesto antes do `JSON.parse`. Hash divergente → conteúdo rejeitado, alerta em `integrity_alerts` no Supabase.
- **Self-hash do manifesto** — o próprio `integrity.json` carrega `self_hash` (SHA-256 dos campos `version+algorithm+files`). Manifesto adulterado → bloqueia tudo.
- **HTTPS + HSTS** (GitHub Pages aplica HSTS automaticamente).
- **CSP `connect-src 'self'`** — fetches de JSON só do próprio domínio.

**Limitações conhecidas:**
- Se o atacante regenera o manifesto junto com o conteúdo (build comprometido + chave de assinatura ausente), a verificação cliente passa. Mitigação futura: assinatura Ed25519 do manifesto com chave pública embutida no bundle (defesa contra build poisoning).
- SubtleCrypto em browsers muito antigos retorna null → modo permissivo. Aceitável (público alvo é majoritariamente browsers modernos).

#### 2. XSS
**Mitigações:**
- CSP estrito (`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`).
- `X-Content-Type-Options: nosniff` em todas as páginas.
- `X-Frame-Options: DENY` (defesa em camadas com `frame-ancestors`).
- `script-src` whitelist restrita: `'self' 'unsafe-inline' js.stripe.com cdn.jsdelivr.net qr-server googletagmanager`. `'unsafe-inline'` é necessário pelos handlers inline legados — **dívida técnica documentada**, não corrigir sem refator amplo.
- Conteúdo de quizzes e aulas é JSON (não HTML), parseado e renderizado via `textContent`/criação de DOM (não `innerHTML` com input do usuário).

**Pontos a auditar:**
- Notas do usuário (`features/notes.js`) — verificar que `innerHTML` nunca recebe `S.notes[k]` raw.
- Mensagens de debate — moderação 3-camadas (filtro local + Edge Function Claude Haiku) já bloqueia HTML/JS.

#### 3. Bypass do age gate (Lei 15.211/2025)
**Defesa em 6 camadas:**
1. Cliente: `enforceAgeGate()` no boot + anti-tamper (compara `birthYear` vs `ageGroup`).
2. Cliente: validação CPF + Edge Function `verify-age` (Serpro).
3. Servidor: trigger PostgreSQL `validate_age_gate` em `profiles`.
4. Servidor: 6 RLS policies (profiles, progress, notes, favorites, timeline, weekly_xp) bloqueiam `age_group='blocked'`.
5. Edge Functions: `ai-tutor` e `create-checkout` retornam 403 se blocked.
6. Sync: `mergeLocalToCloud()` envia birth_year/age_group/age_verified_at — não confia em cliente sozinho.

#### 4. Quebra de RLS
**Mitigações:**
- Toda tabela com PII tem RLS ativa.
- `anon` key publicada (necessário para SPA) — segurança vem das policies, não do segredo da chave.
- `service_role` key nunca no cliente, apenas em Edge Functions com env var.
- Policies revisar quando: adicionar tabela, adicionar coluna sensível, mudar fluxo de auth.

#### 5. Comprometimento do repositório / build
**Mitigações implementadas:**
- Branch `main` é a única que entra em produção (GitHub Pages).
- Manifesto de integridade regenerado a cada `vite build`.

**Mitigações recomendadas (TODO operacional):**
- Habilitar **branch protection** em `main`: require PR review, require status checks, no force-push.
- Habilitar **signed commits** (GPG ou Sigstore).
- Pin SHA das actions em `.github/workflows/` (não usar `@v3` mutável).
- Habilitar **2FA obrigatório** na organização GitHub.
- DNSSEC + CAA records no registro.br.

#### 6. Painel admin
**Estado atual:** PIN `[ADMIN_PIN]` em sessionStorage, bloqueio após 5 tentativas erradas.

**Riscos conhecidos:**
- PIN de 6 dígitos (10⁶ combinações) — vulnerável a brute-force off-line se atacante extrair hash.
- Bloqueio é client-side (sessionStorage), trivial de contornar limpando storage.

**Mitigações recomendadas (TODO):**
- Migrar autenticação admin para Supabase Auth com role `admin` enforced por RLS.
- bcrypt/argon2 no PIN (não SHA simples).
- Rate-limit server-side (Edge Function com tabela `admin_login_attempts`).
- 2FA TOTP para o admin.

#### 7. Edge Functions
**Mitigações:**
- Todas as funções verificam JWT via `SUPABASE_AUTH` antes de qualquer side-effect.
- `ai-tutor` e `create-checkout` checam `age_group != 'blocked'`.
- `moderate-debate` tem timeout 5s (DoS protection) com fallback permissivo.
- Secrets (ANTHROPIC_API_KEY, STRIPE_SECRET_KEY) injetados via `supabase secrets set`, nunca commitados.

#### 8. Service Worker hijack
**Mitigações:**
- SW só serve respostas do cache que ele próprio populou (`escola-static-v159` etc.).
- Para domínios externos (Supabase, Stripe), SW faz `return` sem interceptar.
- Política de update PWA permanente: skipWaiting **APENAS** no message handler — atacante não pode forçar SW novo silenciosamente sem deploy real.
- CORE_ASSETS inclui `lessons/integrity.json` — manifesto fica disponível offline.

#### 9. Supply chain (npm, SDKs)
**Mitigações:**
- `package.json` não tem deps **runtime** — só devDependencies (Vite, Terser, Playwright, Lighthouse). Bundle final é vanilla JS.
- Supabase JS e Stripe.js carregados via `<script src="https://cdn.jsdelivr.net/...">` e `https://js.stripe.com/v3/`.

**TODO recomendado:**
- Adicionar SRI hash nos `<script src="https://cdn.jsdelivr.net/...">` que carregam Supabase SDK. Hoje não há SRI — ataque a cdn.jsdelivr.net entrega payload arbitrário.
- Pinear versão do Supabase SDK (não usar `@supabase/supabase-js@latest`).

## Política de atualização do PWA (resumo)

Política permanente — ver `CLAUDE.md` seção "Politica de Atualizacao PWA":
- Pull-to-refresh bloqueado.
- `skipWaiting()` proibido no install (exceto primeiro install).
- User decide quando atualizar via banner + botão.

## Compliance
- **LGPD** (Lei 13.709/2018) — minimização (só `birthYear`, nunca CPF raw), DPO via `contato@escolaliberal.com.br`.
- **Lei 15.211/2025 (Lei Felca)** — plataforma 18+, fiscalização ANPD.
- **Lei 9.610/98** (direitos autorais) — citações com disclaimer Art. 46, max 2 linhas + atribuição.

## Histórico
- 2026-04-25 — manifesto SHA-256 de integridade implementado; CSP hardening (object-src/base-uri/form-action/frame-ancestors); migração `integrity_alerts`.
- 2026-04-04 — age gate 6 camadas (Lei Felca).
- 2026-04-04 — Google OAuth fix (handle_new_user com EXCEPTION handler).
- 2026-04-02 — compliance jurídico (LGPD, Art. 46).
