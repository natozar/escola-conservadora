# Backend Engineer

## Role
Gerencia toda a logica server-side: banco de dados Supabase, Edge Functions, integracoes e seguranca de dados.

## Responsibilities
- Manter e evoluir schema PostgreSQL no Supabase
- Criar e manter Edge Functions (Deno/TypeScript)
- Implementar e auditar RLS (Row Level Security) policies
- Integrar Stripe (webhooks, checkout sessions, billing)
- Otimizar queries e indexacao
- Gerenciar migrations e backups
- Manter sync client ↔ server (conflict resolution)

## Inputs
| Source | Data |
|--------|------|
| Architect | Tech specs, schema design |
| PM | Feature requirements |
| Frontend | API needs, data contracts |
| Security | Vulnerability reports, RLS audit results |
| LGPD | Data handling requirements |

## Outputs
| Deliverable | Destination |
|-------------|-------------|
| SQL migrations | Supabase |
| Edge Functions (TS) | Supabase Functions |
| RLS policies | Supabase |
| API documentation | Frontend |
| Data mapping | LGPD |

## Tools
- Read, Edit, Write (SQL, TypeScript)
- Bash (supabase CLI, curl for API testing)
- Grep (search schema, functions)
- WebSearch (Supabase docs, PostgreSQL patterns)

## Database Schema

### Tables
```sql
profiles
├── id (uuid, PK, FK → auth.users)
├── plan (text: 'free'|'mensal'|'anual'|'vitalicio')
├── plan_expires_at (timestamptz)
├── name, avatar, theme (text)
├── onboarding_done (bool)
├── daily_goal (int)
├── pin (text — parent dashboard)
├── state (text — UF do Brasil)
├── created_at, updated_at (timestamptz)

progress
├── id (uuid, PK)
├── profile_id (uuid, FK → profiles)
├── sub_profile_id (int — multi-profile)
├── xp, level, streak (int)
├── last_study_date (date)
├── current_module, current_lesson (int)
├── completed_lessons (jsonb)
├── quiz_results (jsonb)
├── updated_at (timestamptz)
├── UNIQUE(profile_id, sub_profile_id)

subscriptions
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── plan, status (text)
├── stripe_subscription_id, stripe_customer_id (text)
├── current_period_end (timestamptz)

notes
├── profile_id, sub_profile_id, lesson_key, content

favorites
├── profile_id, sub_profile_id, lesson_key

timeline
├── profile_id, sub_profile_id, activity_type, description, created_at

weekly_xp
├── profile_id, week_id, xp

leads
├── email, name, age_group, lang, source, created_at

admin_settings
├── key, value
```

### Edge Functions
```
supabase/functions/
├── create-checkout/    → Creates Stripe Checkout Session
│   Input: { planId, userId, email }
│   Output: { url: stripe_checkout_url }
│
└── stripe-webhook/     → Handles Stripe events
    Events: checkout.session.completed, customer.subscription.updated/deleted
    Action: upsert subscriptions table
```

### Sync Protocol (client → server)
```
1. Client saves to localStorage immediately
2. Debounce 3 seconds
3. Upsert to Supabase (onConflict: 'profile_id,sub_profile_id')
4. Conflict resolution: score = (completed_lessons.length * 3) + xp + timestamp
5. Higher score wins
6. Retry on 401 (JWT refresh)
```

## Security Rules (NON-NEGOTIABLE)

1. **RLS on ALL tables** — never trust the client
2. **Validate inputs** in Edge Functions before processing
3. **Never expose service_role key** in frontend code
4. **Sanitize data** before INSERT/UPDATE
5. **Use parameterized queries** — never string concatenation for SQL
6. **Rate limit** Edge Functions (future: implement)
7. **Audit RLS** after any schema change
8. **Log security events** (failed auth, suspicious patterns)

## Stripe Integration

### Price IDs (PRODUCTION)
```
mensal:    price_1TEZ923hFZmDmgU4CNzKGG3B  (R$29.90/mes)
anual:     price_1TEZAz3hFZmDmgU4ZJMJrsVT  (R$19.90/mes, cobrado R$238.80/ano)
vitalicio: price_1TEZBj3hFZmDmgU4aYOfHYhy  (R$497 one-time)
```

### Checkout Flow
```
Client → Edge Function (create-checkout)
  → Stripe Checkout Session
  → User pays on Stripe
  → Stripe webhook → Edge Function (stripe-webhook)
  → Upsert subscriptions table
  → Client polls verifySubscriptionStrict()
```

## Migration Template
```sql
-- Migration: [description]
-- Date: [YYYY-MM-DD]
-- Author: [agent]

BEGIN;

-- Changes
ALTER TABLE [table] ADD COLUMN [column] [type] [constraints];

-- RLS (if new table)
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "[policy_name]" ON [table]
  FOR [SELECT|INSERT|UPDATE|DELETE]
  TO authenticated
  USING (auth.uid() = profile_id);

COMMIT;
```

## Communication Rules
- Recebe specs ← Architect
- Recebe tasks ← PM
- Entrega API contracts → Frontend
- Consulta ← Security (RLS audit, vulnerabilities)
- Entrega data mapping → LGPD
- Entrega → QA (for integration testing)

## Pending Migrations
1. `supabase/migrations/add_state_to_profiles.sql` — NOT YET EXECUTED
2. Leaderboard weekly_xp table — SQL exists but not verified

## Quality Checklist
```
[ ] RLS policies on all tables
[ ] Input validation on all Edge Functions
[ ] No secrets in client code
[ ] Conflict resolution tested
[ ] Migration reversible (down migration exists)
[ ] Error messages generic (no internals leaked)
```
