# Protocols — Communication, Handoffs & Quality Gates

---

## 1. Agent Communication Matrix

How agents exchange information during execution.

### Direct Dependencies (Agent A produces → Agent B consumes)

```
CEO ─────────→ PM (priorities, roadmap)
PM ──────────→ ALL DEV agents (tasks, timelines)
Architect ───→ Frontend, Backend, Mobile, DevOps (tech specs)
UX ──────────→ Frontend (layouts, flows)
Branding ────→ Copywriter, Social, UX (tone, guidelines)
Marketing ───→ Copywriter, Social, Traffic (strategy, briefs)
Data ────────→ CEO, Business, Marketing (metrics, insights)
Backend ─────→ Frontend (API contracts, schema)
Frontend ────→ Mobile (UI changes needing SW/manifest updates)
Frontend ────→ QA (changed files for testing)
Mobile ──────→ QA (PWA-specific test requirements)
Security ────→ Backend, Frontend (vulnerability fixes)
Legal ───────→ Frontend (terms/disclaimer text changes)
LGPD ────────→ Backend (data handling requirements)
```

### Handoff Protocol

When Agent A completes work that Agent B needs:

```
HANDOFF FORMAT:
  FROM: [agent name]
  TO: [agent name]
  CONTEXT: [what was done]
  FILES_CHANGED: [list of files modified]
  ARTIFACTS: [outputs produced — specs, reports, code]
  NEXT_ACTION: [what the receiving agent should do]
  CONSTRAINTS: [any limits or warnings]
```

In practice, the orchestrator passes this context when spawning the next subagent.

---

## 2. Quality Gates

Every workflow must pass through relevant quality gates before completion.

### Gate: CODE_QUALITY
```
Applies to: any code change (JS, CSS, HTML)
Checks:
  [ ] No syntax errors
  [ ] No console.error in normal flow
  [ ] Functions are accessible from global scope (app.js pattern)
  [ ] CSS variables used (no hardcoded colors)
  [ ] i18n keys added for both PT and EN
  [ ] Safe DOM proxy considered for getElementById
  [ ] localStorage fallback for Supabase operations
  [ ] Offline-compatible (no feature requires network)
```

### Gate: PERFORMANCE
```
Applies to: any change that affects load/render
Checks:
  [ ] Lighthouse Performance >= 90
  [ ] Lighthouse Accessibility >= 90
  [ ] Lighthouse PWA >= 90
  [ ] First Contentful Paint < 2s
  [ ] Cumulative Layout Shift < 0.1
  [ ] No render-blocking resources added
  [ ] Images optimized (WebP, lazy-load)
```

### Gate: PWA_INTEGRITY
```
Applies to: any change to cached assets
Checks:
  [ ] SW_VERSION incremented in sw.js
  [ ] New assets added to appropriate cache strategy
  [ ] Offline still works (test with airplane mode)
  [ ] Install prompt still works
  [ ] manifest.json valid
  [ ] Splash screens render correctly
```

### Gate: SECURITY
```
Applies to: any change touching auth, data, or external APIs
Checks:
  [ ] No secrets in code (grep for keys, tokens, passwords)
  [ ] RLS policies cover new tables/columns
  [ ] Input sanitization on user-facing inputs
  [ ] CSP headers not weakened
  [ ] npm audit: zero critical/high
  [ ] Error messages don't leak internals
```

### Gate: LEGAL_COMPLIANCE
```
Applies to: any change to terms, privacy, data collection
Checks:
  [ ] LGPD Art. 14 compliance (minors)
  [ ] Proper disclaimers present
  [ ] Cookie consent for new tracking
  [ ] Data mapping updated if new data collected
  [ ] Brazilian law citations correct
  [ ] Consumer rights preserved (CDC)
```

### Gate: BRAND_CONSISTENCY
```
Applies to: any user-facing text or visual change
Checks:
  [ ] Tone matches brand guidelines (acolhedor, encorajador)
  [ ] "voce" not "tu" (PT-BR standard)
  [ ] Design tokens used (colors, fonts, spacing)
  [ ] Responsive across breakpoints
  [ ] Dark/light theme works
```

---

## 3. Execution Modes — Detailed Behavior

### Autonomous Mode
```
Trigger: low-risk tasks (analysis, tests, docs, styling, content)
Behavior:
  1. Read relevant files
  2. Execute changes directly
  3. Run validation checks
  4. Report results to user

User interaction: NONE during execution
Rollback: git revert if needed
```

### Supervised Mode
```
Trigger: high-risk tasks (auth, payments, data deletion, deploy, security)
Behavior:
  1. Read relevant files
  2. Present FULL PLAN to user:
     - What will change
     - Why
     - Risk assessment
     - Rollback plan
  3. WAIT for explicit "go" / "sim" / "execute"
  4. Execute exactly as planned
  5. Run validation
  6. Report results

User interaction: BEFORE every significant change
Rollback: always prepared before execution
```

### Hybrid Mode (DEFAULT)
```
Trigger: medium-risk tasks (features, UI, database additive, SW)
Behavior:
  1. Read relevant files
  2. Execute freely for low-risk subtasks
  3. PAUSE at critical checkpoints:
     - Auth flow modification
     - Payment flow modification
     - Data deletion
     - Security config change
     - Production deploy
     - Schema migration (destructive)
     - SW cache strategy change
  4. Present checkpoint to user
  5. Wait for approval
  6. Continue execution
  7. Run validation
  8. Report results

User interaction: ONLY at checkpoints
```

---

## 4. Error Handling

### When a task fails:
```
Attempt 1: Execute task
  → Failed? Diagnose error, adjust approach
Attempt 2: Re-execute with fix
  → Failed? Different approach
Attempt 3: Try alternative strategy
  → Failed? ESCALATE TO USER

Escalation format:
  "Tentei 3 abordagens para [task]:
  1. [approach 1] — falhou porque [reason]
  2. [approach 2] — falhou porque [reason]
  3. [approach 3] — falhou porque [reason]

  Opcoes:
  A) [option A with trade-offs]
  B) [option B with trade-offs]
  C) Abandonar esta tarefa

  Qual preferem?"
```

### When agents conflict:
```
Resolution hierarchy:
  1. Security concerns → Security agent wins
  2. Legal concerns → Legal agent wins
  3. Technical feasibility → Architect decides
  4. Priority/scope → PM decides
  5. Strategic direction → CEO decides
  6. Everything else → user decides
```

---

## 5. Documentation Protocol

### After every significant change:
```
1. Report file-by-file changes (in Portuguese)
2. Note any risks or warnings
3. Suggest follow-up actions
4. Update SW_VERSION if assets changed
```

### After every workflow completion:
```
1. Summary of what was accomplished
2. Files changed with descriptions
3. Quality gate results
4. Known limitations or trade-offs
5. Recommended next steps
```

---

## 6. Git Protocol

```
Commits:
  - Prefix: feat: | fix: | legal: | perf: | refactor: | docs: | test: | chore:
  - Language: English for prefix, Portuguese for description is OK
  - One logical change per commit
  - Never commit secrets or .env files

Branches:
  - main: production (GitHub Pages serves from here)
  - feature/*: new features
  - fix/*: bug fixes
  - refactor/*: code restructuring

Push:
  - ALWAYS ask user before pushing to main
  - Feature branches: push freely
```

---

## 7. Inter-Agent Dependency Timing

```
PARALLEL (no dependencies — run simultaneously):
  Frontend + Backend (when working on different files)
  Legal + LGPD + Copyright (audit tasks)
  Marketing + Social + Traffic (campaign planning)
  Data + Business (analysis tasks)

SEQUENTIAL (must wait for previous):
  Architect → Frontend (needs tech spec first)
  UX → Frontend (needs flow design first)
  Backend → Frontend (needs API contract first)
  Any agent → QA (needs code changes first)
  QA → DevOps (needs tests passing first for deploy)
  Marketing → Copywriter (needs brief first)
  CEO → PM (needs priorities first)
```
