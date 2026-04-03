# Escola Liberal — AI Agent System v2.0

## Architecture

**Framework:** Claude Code Native Orchestration
**Engine:** Claude Code subagents (Agent tool) + direct tool execution
**Agents:** 25 specialized roles in 7 departments
**Memory:** File-based (.agents/*.md) + project memory (MEMORY.md)
**Communication:** Orchestrator context passing + shared repository

```
                    USER REQUEST
                         |
                         v
              +--------------------+
              |   ORCHESTRATOR     |  <-- Reads intent, classifies risk,
              |   (orchestrator.md)|      selects agents, decomposes tasks
              +--------+-----------+
                       |
          +------------+------------+
          |            |            |
          v            v            v
     +---------+  +---------+  +---------+
     | Agent A |  | Agent B |  | Agent C |   <-- Parallel execution
     | (read)  |  | (code)  |  | (test)  |       when no dependencies
     +---------+  +---------+  +---------+
          |            |            |
          +------------+------------+
                       |
                       v
              +--------------------+
              |    QA GATE         |  <-- Validation + quality checks
              +--------+-----------+
                       |
                       v
              +--------------------+
              |    REPORT          |  <-- File-by-file summary to user
              +--------------------+
```

---

## Agent Directory (25 agents)

### Management
| # | Agent | File | Scope |
|---|-------|------|-------|
| 1 | CEO / Estrategista | `ceo.md` | Vision, roadmap, KPIs, go/no-go |
| 2 | Project Manager | `pm.md` | Task decomposition, timelines, dependencies |
| 3 | System Architect | `architect.md` | Tech decisions, patterns, ADRs |

### Development
| # | Agent | File | Scope |
|---|-------|------|-------|
| 4 | Frontend Engineer | `frontend.md` | HTML/CSS/JS, PWA, components, perf |
| 5 | Backend Engineer | `backend.md` | Supabase, Edge Functions, SQL, RLS |
| 6 | Mobile Specialist | `mobile.md` | SW, manifest, iOS/Android, offline |
| 7 | DevOps Engineer | `devops.md` | CI/CD, GitHub Actions, deploy, infra |
| 8 | QA Tester | `qa.md` | Playwright, Lighthouse, Axe, validation |

### Design
| # | Agent | File | Scope |
|---|-------|------|-------|
| 9 | UI/UX Designer | `uiux.md` | Layout, flows, design system, conversion |
| 10 | Branding Specialist | `branding.md` | Identity, tone, consistency |

### Marketing
| # | Agent | File | Scope |
|---|-------|------|-------|
| 11 | Marketing Strategist | `marketing.md` | Funnel, acquisition, channels |
| 12 | Copywriter | `copywriter.md` | Ad copy, CTAs, blog, emails |
| 13 | Social Media Manager | `social.md` | Content calendar, engagement |
| 14 | Traffic Manager | `traffic.md` | Paid ads, ROAS, audiences |

### Business
| # | Agent | File | Scope |
|---|-------|------|-------|
| 15 | Business Analyst | `business.md` | Market analysis, unit economics |
| 16 | Monetization Specialist | `monetization.md` | Pricing, paywall, conversion |
| 17 | Data Analyst | `data.md` | Metrics, dashboards, cohorts |

### Legal
| # | Agent | File | Scope |
|---|-------|------|-------|
| 18 | Legal Advisor | `legal.md` | Brazilian law, terms, compliance |
| 19 | LGPD Specialist | `lgpd.md` | Privacy, minors, data mapping |
| 20 | Copyright Specialist | `copyright.md` | IP, licensing, INPI |

### Specialists
| # | Agent | File | Scope |
|---|-------|------|-------|
| 21 | Security Specialist | `security.md` | Audits, CSP, vulnerabilities |
| 22 | Automation Engineer | `automation.md` | Workflows, scripts, CI/CD |
| 23 | AI Integrations | `ai-integrations.md` | Claude API, tutor, quiz gen |

---

## System Files

| File | Purpose |
|------|---------|
| `orchestrator.md` | Routing engine, execution modes, task lifecycle |
| `WORKFLOWS.md` | 12 predefined workflow templates |
| `PROTOCOLS.md` | Communication matrix, handoffs, quality gates |

---

## Quick Reference — Routing Table

| User says... | Agents activated | Mode |
|-------------|-----------------|------|
| "Nova feature X" | Architect + PM -> Frontend + Backend + QA | Hybrid |
| "Melhorar performance" | Frontend + Mobile + DevOps + QA | Autonomous |
| "Bug no mobile" | Mobile + QA | Autonomous |
| "Campanha marketing" | Marketing + Copywriter + Social + Traffic | Autonomous |
| "Revisar seguranca" | Security + LGPD + Backend | Hybrid |
| "Melhorar conversao" | UX + Copywriter + Data + Frontend | Hybrid |
| "Deploy" | DevOps + QA | Supervised |
| "Integrar AI" | AI Integrations + Architect + Backend + Frontend | Hybrid |
| "Revisar legal" | Legal + LGPD + Copyright | Autonomous |
| "Pricing" | Monetization + Business + Data | Autonomous |
| "SEO" | Marketing + Copywriter + Frontend + DevOps | Autonomous |
| "Pitch gov" | CEO + Business + Data + Marketing + Legal | Autonomous |
| "Escalar infra" | Architect + DevOps + Backend + Security | Hybrid |
| "Onboarding UX" | UX + Frontend + Data + Copywriter | Hybrid |
| "Auditoria completa" | Security + QA + Legal + LGPD + Copyright | Autonomous |
| "Refatorar app.js" | Architect + Frontend + QA | Hybrid |

---

## Execution Modes

| Mode | Risk | Behavior | Use when |
|------|------|----------|----------|
| **Autonomous** | Low | Execute without asking | Analysis, tests, docs, refactor |
| **Supervised** | High | Ask before every change | Auth, payments, data, deploy |
| **Hybrid** (default) | Mixed | Free execution + critical checkpoints | Most feature work |

---

## Tech Stack (LOCKED)

These decisions are final. Agents must NOT propose alternatives:

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Build | Vite 8 + Terser |
| Backend | Supabase (Auth + DB + Edge Functions) |
| Payments | Stripe |
| AI | Anthropic Claude API |
| Hosting | GitHub Pages |
| Testing | Playwright + Lighthouse + Axe |
| PWA | Service Worker v34 |

**Rule:** Zero npm runtime dependencies. Dev-only dependencies permitted.
