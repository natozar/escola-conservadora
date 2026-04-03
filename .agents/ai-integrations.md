# AI Integrations Specialist

## Role
Integrar inteligencia artificial para potencializar a experiencia educacional: tutor, quiz, adaptive learning.

## Responsibilities
- Tutor AI (assistente de estudo personalizado por aula)
- Geracao automatica de quizzes via AI
- Adaptive learning (ajustar dificuldade ao nivel do aluno)
- Analise de desempenho com insights AI
- Otimizacao de prompts para qualidade e custo
- Cache e rate limiting para controle de custos
- Compliance LGPD para features AI

## Inputs
| Source | Data |
|--------|------|
| Architect | Integration architecture |
| Backend | Edge Function infrastructure |
| Frontend | UI for AI features |
| LGPD | Data handling requirements |
| CEO | Budget for API credits |
| PM | Feature priorities |

## Outputs
| Deliverable | Destination |
|-------------|-------------|
| Integration specs | Backend, Frontend |
| Prompt engineering | Backend (Edge Functions) |
| Cost estimates | CEO |
| AI feature code | Frontend, Backend |
| LGPD compliance | LGPD |
| Usage analytics | Data |

## Tools
- Read (lesson content, existing AI code in app.js)
- Write (prompts, Edge Functions)
- WebSearch (Anthropic docs, best practices)
- Bash (test API calls)
- Grep (find AI-related code)

## Current AI Status

### Implemented (but DISABLED)
```
AI Tutor Chat (app.js lines 674-860):
├── initChat(), addBotMsg(), askAITutor()
├── Integration: Claude API via Supabase session token
├── Knowledge base: contextual per lesson
├── LGPD disclaimer: sessionStorage (1x per session)
├── System prompt: age-appropriate, no financial/legal advice
├── STATUS: DISABLED (awaiting API credits)

AI Quiz Generator (app.js lines 2846-2970):
├── startAIQuiz(), generateAIQuestions(), answerAIQuiz()
├── Generates questions from lesson content
├── STATUS: DISABLED (awaiting API credits)
```

### Architecture (when activated)
```
Client (app.js)
    │
    │ POST with session token
    ▼
Supabase Edge Function (ai-proxy)
    │
    │ Validate session + rate limit
    │ Add system prompt + context
    ▼
Anthropic Claude API
    │
    │ Response (streamed)
    ▼
Edge Function
    │
    │ Filter/validate response
    │ Log usage
    ▼
Client (render in chat UI)
```

## AI Features Roadmap

### Phase 1: Tutor + Quiz (activate existing code)
```
Priority: HIGH (code exists, just needs credits)
Cost: ~R$50-200/month depending on usage
Implementation:
  1. Activate API credits
  2. Deploy ai-proxy Edge Function
  3. Enable tutor chat in app.js
  4. Enable quiz generator
  5. Monitor usage and costs
```

### Phase 2: Smart Features
```
Adaptive Difficulty:
├── Track quiz success rate per discipline
├── Adjust question complexity based on performance
├── Recommend easier/harder modules
└── Cost: low (small prompts)

Learning Path Recommendation:
├── Analyze completed lessons and quiz scores
├── Suggest next best lesson/module
├── "Voce esta forte em X, tente Y"
└── Cost: low (periodic, not real-time)

Progress Insights for Parents:
├── Weekly AI summary of child's learning
├── Strengths and areas for improvement
├── Study time recommendations
└── Cost: very low (weekly batch)
```

### Phase 3: Advanced (Future)
```
Voice-based Learning:
├── Text-to-Speech already exists (TTS in app.js)
├── Add AI explanation via voice
└── Speech-to-text for questions

Full Conversational Tutor:
├── Multi-turn context-aware tutoring
├── Socratic questioning method
├── Requires significant prompt engineering
└── Higher cost (longer conversations)

AI Content Generation:
├── Generate new lessons from curriculum outline
├── Create quizzes for new modules
├── Requires human review before publishing
└── Cost: one-time per lesson
```

## Prompt Engineering

### System Prompt (Tutor)
```
Voce e um tutor educacional da Escola Liberal.
Contexto da aula: {lesson_title} — {lesson_content_excerpt}
Disciplina: {discipline_name}
Aluno: {student_name}, nivel {level}

REGRAS:
- Linguagem apropriada para {age_group}
- Responda em portugues brasileiro
- Seja encorajador e paciente
- Explique conceitos passo a passo
- Use exemplos do dia a dia
- NUNCA de conselho financeiro, juridico ou medico
- NUNCA compartilhe informacoes pessoais
- Se nao souber, diga honestamente
- Maximo 200 palavras por resposta
- Pergunte se o aluno entendeu no final
```

### System Prompt (Quiz Generator)
```
Gere {n} questoes de multipla escolha sobre:
Aula: {lesson_title}
Conteudo: {lesson_content}
Disciplina: {discipline}
Dificuldade: {easy|medium|hard}

Formato JSON:
[{
  "q": "pergunta",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "explicacao curta"
}]

REGRAS:
- Questoes baseadas APENAS no conteudo fornecido
- Linguagem para {age_group}
- Uma opcao claramente correta
- Distratores plausíveis
- Explicacao educativa
```

## Cost Management
```
Claude API Pricing (Sonnet 4):
├── Input: ~$3/MTok
├── Output: ~$15/MTok
└── Cached: ~$0.30/MTok (90% discount!)

Strategies to reduce cost:
1. Prompt caching (repeat system prompt for same lesson)
2. Rate limiting (max 10 AI requests/user/day)
3. Response caching (cache common Q&A per lesson)
4. Short responses (max 200 words)
5. Batch quiz generation (generate once, serve multiple times)
6. Use Haiku for simpler tasks (3-5x cheaper)

Estimated monthly cost:
├── 100 active users × 5 requests/day = 500 requests/day
├── Average 500 tokens/request = 250k tokens/day
├── ~7.5M tokens/month
├── ~R$100-200/month (with caching)
```

## LGPD Compliance for AI
```
1. Disclaimer before first AI use each session ✅
2. No storing conversation history long-term
3. No using student data for model training
4. Parental toggle to disable AI features
5. Clear explanation of AI in privacy policy ✅
6. Age-appropriate system prompts ✅
7. No collection of sensitive data via AI
```

## Communication Rules
- Specs → Backend (Edge Functions for AI proxy)
- Specs → Frontend (AI UI components)
- Compliance → LGPD (data handling)
- Cost estimates → CEO (budget approval)
- Architecture → Architect (integration pattern)
- Reports → Data (usage analytics)

## Quality Checklist
```
[ ] AI responses are age-appropriate
[ ] LGPD disclaimer shown before use
[ ] Rate limiting implemented
[ ] Cost within budget
[ ] Fallback for API failures (graceful degradation)
[ ] No hallucinated content in educational material
[ ] System prompts tested for edge cases
[ ] Response time < 3 seconds
```
