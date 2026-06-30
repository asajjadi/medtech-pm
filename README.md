# MedTech PM — learn medical device project management by doing

A guided project-management tool for people **new to medical device development**. It pairs a
real project board with an AI **Coach** and in-context learning, so a newcomer with general PM
experience can run a medical device project end-to-end while the tool teaches the "why" — design
controls, ISO/IEC standards, risk management, regulatory submissions — as they go.

> ⚠️ **Educational tool, not regulatory advice.** The guidance and AI responses here are for
> learning. They are not regulatory, legal, or compliance advice. Always confirm requirements
> against the current standards and your company's Quality Management System.

## Features

- **Guided first-run** — a welcome wizard walks through the 7-phase device lifecycle and can
  scaffold a starter project with the standard tasks every project needs.
- **AI Coach** — ask plain-language questions ("What is design input?", "What's a 510(k)?",
  "What should I do next?") and get mentor-style answers grounded in your actual project.
- **Phase guides + glossary** — every lifecycle phase has an in-context explainer; jargon is
  defined in a searchable glossary.
- **Board & timeline** — manage tasks across Concept → Design Input → Design Output → V&V →
  Design Transfer → Regulatory → Production.
- **Multiple projects** — each project has its own isolated board, timeline, and history.
- **Audit trail** — every create/update/delete is recorded append-only with who/what/when and
  before/after values (a first step toward 21 CFR Part 11–style record-keeping).
- **Autonomous agent** — an optional scheduled job that reviews the board and can create/update
  items via an LLM tool-use loop.
- **Free local AI** — runs on a local [Ollama](https://ollama.com) model by default (no API key,
  no cost), or switch to the Anthropic API for higher quality.

## Project structure

```
medtech-pm/
├── client/                React frontend (Vite)
│   └── src/
│       ├── components/     Board, Timeline, Coach, Onboarding, Glossary, ItemModal, …
│       └── lib/            API client, constants, educational content, toasts
├── server/                Express backend
│   └── src/
│       ├── routes/         REST endpoints (items, projects, ai, audit)
│       ├── providers/      Swappable LLM backends (ollama, anthropic)
│       ├── agent/          Autonomous scheduled agent + tests
│       ├── store.js        File-based store (locking + atomic writes; swap for a DB later)
│       └── audit.js        Append-only audit trail
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- For free local AI: [Ollama](https://ollama.com) with a tool-capable model
  (`ollama pull llama3.2`). For higher quality instead: an
  [Anthropic API key](https://console.anthropic.com).

### Install
```bash
cd server && npm install
cd ../client && npm install
```

### Configure
```bash
cd server
cp .env.example .env
# Default: LLM_PROVIDER=ollama (free, local). To use Claude instead, set
# LLM_PROVIDER=anthropic and add your ANTHROPIC_API_KEY.
```

### Run
```bash
# terminal 1
cd server && npm run dev
# terminal 2
cd client && npm run dev
```
Client: `http://localhost:5173` · Server: `http://localhost:3001`

### Tests
```bash
cd server && npm test     # offline agent-loop test, no API key required
```

### (Optional) autonomous agent
```bash
cd server
ENABLE_AGENT=true AGENT_AUTONOMOUS=true npm run dev
```
See `server/src/agent/README.md` for delivery options (webhook/Slack) and details.

## Status & roadmap

This is an advanced prototype. The novel part — the guided, learn-while-you-build experience —
works today. The path toward a marketable educational product is mostly standard engineering:

1. **Database** (Postgres) to replace the file store — durability and concurrency.
2. **Accounts & multi-tenancy** — auth, per-user data isolation.
3. **Hosting + hosted AI** — deploy so others can use it; a hosted model for users without Ollama.
4. **Hardening** — automated tests + CI, input validation, rate limiting, error monitoring.
5. **Expert-reviewed content** — for a teaching tool in a regulated field, content accuracy is the product.

## License

TBD.
