# AOA MVP — Setup Guide

## Step 1: Create accounts (10 min)

1. **Supabase** → https://supabase.com — Create a project, copy URL + anon key + service role key
2. **Anthropic** → https://console.anthropic.com — Get API key
3. **Vapi** → https://vapi.ai — Create account, get API key
4. **Evolution API** → Self-host via Docker or use https://evolution-api.com cloud

## Step 2: Database setup (5 min)

1. Go to your Supabase project → SQL Editor
2. Paste the contents of `backend/src/config/schema.sql`
3. Run the query — this creates all tables + seeds the demo business
4. Go to Database → Replication → Confirm `leads` and `messages` are enabled

## Step 3: Backend (5 min)

```bash
cd backend
cp .env.example .env
# Fill in all API keys in .env
npm install
npm run dev
```

Test: `curl http://localhost:3000/health`

## Step 4: Frontend (5 min)

```bash
cd frontend
cp .env.example .env
# Fill in Supabase URL + anon key
npm install
npm run dev
```

Open: http://localhost:5173/dashboard

## Step 5: Connect WhatsApp (15 min)

1. Set up Evolution API instance
2. Connect your WhatsApp number (scan QR)
3. Configure webhook URL: `https://your-backend.railway.app/api/webhooks/evolution`
4. Send a test message to your WhatsApp number
5. Watch the lead appear on the dashboard

## Step 6: Connect Vapi Voice (15 min)

1. Create a new assistant in Vapi dashboard
2. Set language to Portuguese (Brazil)
3. Paste the system prompt from `backend/src/prompts/receptionist.js`
4. Set webhook URL: `https://your-backend.railway.app/api/webhooks/vapi`
5. Assign a phone number
6. Test by calling the number

## Step 7: Deploy

- Backend → Railway: `railway up` from /backend
- Frontend → Vercel: `vercel` from /frontend
- Update .env with production URLs

## Step 8: Solana Pay (optional for demo)

1. Install Phantom wallet
2. Switch to devnet (Settings → Developer Settings → Testnet Mode)
3. Get devnet SOL from https://faucet.solana.com
4. Get devnet USDC from https://spl-token-faucet.com
5. Set your Phantom devnet wallet address as SOLANA_MERCHANT_WALLET in .env
