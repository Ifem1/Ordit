# Ordit

Ordit is a GenLayer-native AI insight auditing app. The frontend connects to an injected wallet such as Rabby or MetaMask, reads state directly from `OrditContract`, and sends write transactions through `genlayer-js`.

## Architecture

- Frontend: Next.js app router
- Identity: injected wallet address
- Source of truth: GenLayer `OrditContract`
- Evidence: validator-fetchable URLs, API endpoints, or content-addressed references
- Storage model: contract state and indexes, with raw large files kept outside the core trust path

The contract records organizations, roles, datasets, dashboards, audit requests, consensus decisions, human reviews, activations, claim status, reviewer reputation, and audit logs.

## Evidence Model

Users submit a claim plus source references. During adjudication, the Intelligent Contract fetches the submitted URLs inside GenVM and asks validators to weigh fetched evidence above user-entered metrics. User-uploaded evidence is intentionally not part of the core flow.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment:

```bash
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS=0x_your_deployed_contract_address
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Checks

```bash
npm run type-check
npm run lint
npm test -- --runInBand
genvm-lint check contracts/OrditContract.py --json
npm run build
```
