# ORDIT — DEPLOYMENT GUIDE

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase account (supabase.com)
- GenLayer Studio account (studio.genlayer.com)

---

## Step 1: Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Copy your **Project URL** and **anon key** from Project Settings → API
3. Open the **SQL Editor** and run the full contents of:
   ```
   supabase/migrations/001_ordit_schema.sql
   ```
4. Create a **Storage bucket** named `evidence` (set to public):
   - Go to Storage → New Bucket → name: `evidence`, Public: ✓

---

## Step 2: GenLayer Contract Deployment

1. Go to https://studio.genlayer.com
2. Connect your wallet to **StudioNet** (Chain ID: 61999)
3. Upload `contracts/OrditContract.py`
4. Deploy the contract
5. Copy the deployed contract address
6. Set in `.env.local`:
   ```
   NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS=0x_your_contract_address
   ```

---

## Step 3: Environment Configuration

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS=0x_your_deployed_address

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Step 5: Verification Smoke Test

1. Sign up at /auth
2. Create an organization (/organization/new)
3. Register a dataset (/dataset/new) — upload a CSV
4. Register a dashboard (/dashboard/dashboards/new)
5. Submit an insight audit (/insight/new) — paste an AI-generated summary
6. Wait for GenLayer consensus (~30–60s)
7. View the case file (/case/[id])
8. Check the verdict, scores, and findings
9. If NEEDS_REVIEW → submit human review (/review/[id])
10. If APPROVED → activate the business decision
11. View the audit trail (/audit/[id])
12. Verify Supabase mirrors in your Supabase dashboard
13. Verify StudioNet explorer links open correctly

---

## Step 6: Production Deployment (Vercel)

```bash
npm run build  # verify build passes
```

1. Push to GitHub
2. Import project in Vercel
3. Set all environment variables in Vercel dashboard
4. Set NEXT_PUBLIC_APP_URL to your production domain
5. Deploy

---

## TypeScript & Lint

```bash
npm run build    # TypeScript check + build
npx eslint src/  # Lint
```

---

## Notes

- The Supabase RLS policies ensure users can only see their own data
- Verdicts are determined exclusively by the GenLayer contract — never by Supabase
- Evidence files are stored in Supabase Storage, their URLs are submitted to the contract as the `evidence_manifest`
- The claim hash is a SHA-256 of all submitted fields — it enables claim deduplication on-chain
