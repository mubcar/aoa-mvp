# AOA — Analyze, Optimize, Automate

> AI-powered lead recovery platform for home service SMBs in Brazil.  
> Never miss a lead. Never lose revenue. Built on Claude AI + Solana Pay.

## The Problem

Home service providers (HVAC, plumbing, solar, landscaping) lose ~40% of inbound leads because they're physically on jobs when prospects call or message on WhatsApp. By the time they check, prospects hired someone else.

## The Solution

AOA deploys AI agents on WhatsApp and voice that:
- Answer every message and call instantly, 24/7, in natural Brazilian Portuguese
- Qualify the prospect (service needed, urgency, location, schedule)
- Capture the lead into a real-time provider dashboard
- Generate a Solana Pay USDC deposit link to convert interest into commitment

## Tech Stack

- **AI**: Anthropic Claude API (Sonnet) — lead qualification in Portuguese
- **WhatsApp**: Evolution API (open-source)
- **Voice**: Vapi.ai — Portuguese voice agents
- **Backend**: Node.js + Fastify
- **Database**: Supabase (PostgreSQL + Realtime)
- **Frontend**: React + Vite + TailwindCSS
- **Payments**: Solana Pay SDK + USDC escrow
- **Deploy**: Railway (backend) + Vercel (frontend)

## Project Structure

```
aoa-mvp/
├── backend/          # Fastify API server
│   └── src/
│       ├── routes/       # API endpoints
│       ├── services/     # Claude AI, Solana Pay, Evolution API
│       ├── webhooks/     # WhatsApp & Vapi handlers
│       ├── config/       # Environment & Supabase client
│       └── prompts/      # AI system prompts
├── frontend/         # React dashboard
│   └── src/
│       ├── components/   # Lead cards, metrics, conversation thread
│       ├── pages/        # Dashboard, lead detail, metrics
│       ├── hooks/        # Supabase realtime hooks
│       └── lib/          # Supabase client, API helpers
├── solana/           # Solana program (escrow)
├── docs/             # Architecture docs, demo script
└── CLAUDE.md         # Master build prompt
```

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env    # Fill in API keys
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Hackathon

Built for the [Colosseum Frontier Hackathon](https://colosseum.com/frontier) — April 6 to May 11, 2026.

## License

MIT
