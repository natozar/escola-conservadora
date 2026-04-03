# Workflow Templates

Predefined execution plans for common operations.
Each workflow defines: agents, order, inputs, outputs, and quality gates.

---

## WF-01: New Feature

```
Trigger: "Adicionar [feature]", "Nova feature", "Implementar [X]"
Mode: Hybrid
Duration: Medium (multi-step)

PHASE 1 — DESIGN (sequential)
  Task 1.1: Architect → analyze feasibility, define approach
    Input: feature description
    Output: tech spec (files to change, approach, risks)

  Task 1.2: PM → decompose into subtasks
    Input: tech spec
    Output: task list with priorities

  Task 1.3: UX → define user flow (if UI involved)
    Input: feature description
    Output: flow description, component layout

PHASE 2 — IMPLEMENT (parallel where possible)
  Task 2.1: Backend → database/API changes
    Input: tech spec
    Output: migrations, Edge Functions, RLS

  Task 2.2: Frontend → UI implementation
    Input: tech spec + UX flow
    Output: HTML/CSS/JS changes
    Depends: 2.1 (if API needed)

  Task 2.3: Mobile → PWA compatibility
    Input: frontend changes
    Output: SW updates, manifest changes
    Depends: 2.2

PHASE 3 — VALIDATE
  Task 3.1: QA → test all changes
    Input: changed files
    Output: test results, bug list

  Task 3.2: Fix any bugs found → loop back to Phase 2

CHECKPOINT: Present results to user before merge
```

---

## WF-02: Bug Fix

```
Trigger: "Bug", "Corrigir", "Fix", "Não funciona", "Quebrou"
Mode: Autonomous (unless auth/payment/data)
Duration: Short

  Task 1: Diagnose → read error, find root cause
    Agent: relevant specialist (Frontend/Backend/Mobile)
    Output: diagnosis + proposed fix

  Task 2: Fix → implement minimal change
    Agent: same as Task 1
    Output: code change

  Task 3: Validate → verify fix doesn't break anything
    Agent: QA
    Output: test results

  Task 4: Report → file-by-file changes
```

---

## WF-03: Performance Optimization

```
Trigger: "Performance", "Lento", "Otimizar", "Lighthouse"
Mode: Autonomous
Duration: Medium

  Task 1: Measure baseline
    Agent: QA (Lighthouse audit)
    Output: current scores

  Task 2: Analyze bottlenecks (parallel)
    Agent A: Frontend → JS bundle, CSS, render blocking
    Agent B: Mobile → SW cache, offline perf
    Agent C: DevOps → build config, asset optimization

  Task 3: Implement fixes
    Agents: Frontend + Mobile + DevOps

  Task 4: Measure after
    Agent: QA (Lighthouse audit)
    Output: before/after comparison

  Gate: Scores must improve or stay same. Never regress.
```

---

## WF-04: Marketing Campaign

```
Trigger: "Campanha", "Marketing", "Lançamento", "Divulgação"
Mode: Autonomous
Duration: Medium

  Task 1: Strategy
    Agent: Marketing Strategist
    Output: campaign brief (objective, audience, channels, budget)

  Task 2: Content creation (parallel)
    Agent A: Copywriter → ad copy, email copy, landing copy
    Agent B: Social → content calendar, post scripts
    Agent C: Traffic → campaign structure, audiences, budget split

  Task 3: Implementation
    Agent: Frontend (if landing page changes needed)

  Task 4: Review
    Agent: Branding → voice/tone consistency check
```

---

## WF-05: Legal/Compliance Audit

```
Trigger: "Legal", "LGPD", "Compliance", "Termos"
Mode: Autonomous (review) / Supervised (changes)
Duration: Medium

  Task 1: Audit (parallel)
    Agent A: Legal → terms, disclaimers, consumer law
    Agent B: LGPD → data mapping, consent, minors
    Agent C: Copyright → IP inventory, licenses, fair use

  Task 2: Consolidate findings
    Output: compliance report with action items

  Task 3: Implement fixes (if approved)
    Agent: Frontend (for HTML changes) + Backend (for data handling)

  Task 4: Re-audit
    Agents: Legal + LGPD + Copyright
```

---

## WF-06: Security Audit

```
Trigger: "Segurança", "Security", "Audit", "Vulnerabilidade"
Mode: Hybrid
Duration: Medium

  Task 1: Code scan (parallel)
    Agent A: Security → CSP, headers, secrets, XSS, injection
    Agent B: Backend → RLS policies, API security, input validation
    Agent C: QA → npm audit, dependency check

  Task 2: Report
    Output: vulnerability list (critical/high/medium/low)

  Task 3: Fix critical+high (sequential)
    Agents: relevant specialists

  CHECKPOINT: Present findings to user before fixing medium/low
```

---

## WF-07: Deploy to Production

```
Trigger: "Deploy", "Publicar", "Subir pra produção"
Mode: Supervised (ALWAYS)
Duration: Short

  Task 1: Pre-deploy checks (parallel)
    Agent A: QA → all tests pass, Lighthouse scores OK
    Agent B: DevOps → build succeeds, no warnings
    Agent C: Security → no secrets, CSP valid

  CHECKPOINT: Show checklist to user. Require explicit "go"

  Task 2: Deploy
    Agent: DevOps → git push, verify GitHub Pages

  Task 3: Post-deploy verify
    Agent: QA → smoke test production URL

  Task 4: Report
    Output: deploy status + production URL
```

---

## WF-08: Refactor app.js

```
Trigger: "Refatorar", "Modularizar", "Separar app.js"
Mode: Hybrid
Duration: Long

  Task 1: Map dependencies
    Agent: Architect → analyze function dependency graph

  Task 2: Plan module split
    Agent: Architect → define ES module boundaries
    Output: module map with imports/exports

  CHECKPOINT: Present module plan to user

  Task 3: Extract modules (sequential, one at a time)
    Agent: Frontend
    Per module: extract → test → verify offline → commit

  Task 4: Full regression
    Agent: QA → all tests, Lighthouse, offline check

  Rule: Never break offline functionality during refactor
```

---

## WF-09: Content Update (Lessons)

```
Trigger: "Adicionar aulas", "Novo módulo", "Atualizar conteúdo"
Mode: Autonomous
Duration: Medium

  Task 1: Plan content
    Agent: PM → define module/lesson structure

  Task 2: Generate content
    Agent: Backend → create/update lesson JSON files

  Task 3: Update index
    Agent: Backend → update lessons/index.json

  Task 4: Update SW cache
    Agent: Mobile → increment SW_VERSION, update CORE_ASSETS if needed

  Task 5: Validate
    Agent: QA → verify lessons load, quiz works, offline cache
```

---

## WF-10: AI Integration

```
Trigger: "AI tutor", "Quiz AI", "Claude API", "Integrar AI"
Mode: Hybrid
Duration: Long

  Task 1: Architecture review
    Agent: AI Integrations + Architect
    Output: integration plan, cost estimate, rate limits

  CHECKPOINT: Cost approval from user

  Task 2: Backend
    Agent: Backend → Edge Function for API proxy

  Task 3: Frontend
    Agent: Frontend → UI for AI features

  Task 4: Compliance
    Agent: LGPD → verify disclaimers, parental consent, data handling

  Task 5: Test
    Agent: QA → functional + cost monitoring
```

---

## WF-11: Pricing/Monetization Change

```
Trigger: "Preço", "Pricing", "Plano", "Paywall"
Mode: Supervised (ALWAYS)
Duration: Medium

  Task 1: Analysis
    Agent: Monetization + Business + Data
    Output: pricing recommendation with rationale

  CHECKPOINT: User approval required

  Task 2: Implement (sequential)
    Agent A: Backend → Stripe price IDs, subscription logic
    Agent B: Frontend → paywall UI, plan display
    Agent C: Legal → terms update if needed

  Task 3: Validate
    Agent: QA → test full checkout flow
```

---

## WF-12: Pitch/Presentation Prep

```
Trigger: "Pitch", "Apresentação", "Governo", "Reunião"
Mode: Autonomous
Duration: Medium

  Task 1: Data collection (parallel)
    Agent A: Data → engagement metrics, growth numbers
    Agent B: Business → market analysis, competitive positioning
    Agent C: CEO → strategic narrative, KPIs

  Task 2: Content
    Agent: Marketing + Copywriter → pitch deck content, talking points

  Task 3: Presentation mode
    Agent: Frontend → verify admin presentation mode works

  Output: compiled data + talking points + admin dashboard ready
```
