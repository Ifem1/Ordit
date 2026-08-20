# Ordit

Ordit is a GenLayer-native AI insight auditing app. The frontend connects to an injected wallet such as Rabby or MetaMask, reads state directly from `OrditContract`, and sends write transactions through `genlayer-js`.

## Architecture

- Frontend: Next.js app router
- Identity: injected wallet address
- Source of truth: GenLayer `OrditContract`
- Evidence: validator-fetchable URLs, API endpoints, or content-addressed references
- Storage model: contract state and indexes, with raw large files kept outside the core trust path

The contract records organizations, roles, datasets, dashboards, audit requests, consensus decisions, human reviews, activations, claim status, reviewer reputation, and audit logs.

## Evidence and consensus trust model

Users submit a claim plus source references and an optional user manifest commitment. During adjudication, each validator independently re-fetches the permitted URLs, examines the returned content, classifies material claims as supported, contradicted, ambiguous, or unevaluable, and checks the verdict, material scores, findings, and citations. Semantic agreement is sufficient; validators do not need byte-identical prose. Missing or ambiguous evidence escalates to `NEEDS_REVIEW`.

Successful fetching is not citation support. Accepted citations are canonical records containing the fetched URL, the fetched-content SHA-256, and the claim/finding they support or contradict. The contract stores source metadata and source commitments rather than large raw documents. The consensus-produced `fetched_evidence_commitment` is SHA-256 over the canonical ordered source commitments; it is distinct from the caller's `evidence_manifest_hash`.

`ANALYST` submits insights. Only an explicit `REVIEWER` may resolve human-review cases, and the submitter cannot review their own request. Only `OWNER` or `ADMIN` may activate or block a business decision.

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

The repository currently has no checked-in StudioNet deployment or GenLayer integration harness. A deployment address, transaction hashes, explorer link, and production URL must be recorded here only after a fresh deployment and live trust-path run.
