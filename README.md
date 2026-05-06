# Hermes Automações

> Assistente Virtual que responde seu WhatsApp 24h por dia, 7 dias por semana.  
> Para o Mercado de Plantas — paisagistas, viveiristas e vendedores.

## O Problema

Quem trabalha no mercado de plantas está no viveiro, no projeto, na entrega. Não tem como ficar no celular o dia inteiro. Enquanto isso, clientes mandam mensagem no WhatsApp às 22h, no domingo, no feriado — e ninguém responde. **40% desses clientes vão pro concorrente que respondeu mais rápido.**

## A Solução

Hermes Automações coloca uma IA no WhatsApp da sua empresa que:

- Responde em segundos, 24h por dia, 7 dias por semana
- Conhece seu catálogo (plantas, vasos, substrato, fertilizante, serviços)
- Qualifica o cliente (nome, o que quer, localização, horário preferido)
- Manda o resumo direto no grupo do WhatsApp da sua equipe para fechar a venda

## Como Funciona

1. **Conversa de setup** — Nossa equipe mapeia seu catálogo, preços e área de atendimento. Criamos seu grupo no WhatsApp.
2. **Configuramos tudo** — A IA é treinada especificamente no seu negócio em até 48h.
3. **Clientes chegam prontos** — A IA atende, qualifica e manda o resumo no grupo. Só fechar.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Fastify (ESM) |
| IA | Anthropic Claude API (Sonnet) — qualificação em Português brasileiro |
| WhatsApp | Evolution API (open-source) |
| Banco de dados | Supabase (PostgreSQL + Realtime) |
| Frontend | React + Vite + TailwindCSS |
| Deploy | Vercel (frontend + backend serverless) |

## Estrutura do Projeto

```
hermes-automacoes/
├── backend/
│   └── src/
│       ├── routes/        # leads, webhooks, test-chat
│       ├── services/      # Claude AI, Evolution API (WhatsApp)
│       ├── config/        # Supabase client, features
│       └── prompts/       # System prompt do assistente virtual
├── frontend/
│   └── src/
│       ├── pages/         # Landing page
│       └── components/    # UI components
└── README.md
```

## Variáveis de Ambiente

```env
# Backend
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE_NAME=
WEBHOOK_SECRET=

# Frontend
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

## Rodando Localmente

```bash
# Backend
cd backend
cp .env.example .env   # Preencher as chaves
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Deploy

Frontend e backend são deployados separadamente na Vercel:

```bash
cd frontend && vercel deploy --prod
cd backend  && vercel deploy --prod
```

## Plano

**R$297/mês** — Acesso completo, sem fidelidade, cancele quando quiser.  
Começa com uma conversa de setup de 30 minutos.

👉 [hermes-automacoes.vercel.app](https://hermes-automacoes.vercel.app)

## Licença

MIT
