# Ordit Update Review

## Current Status

Ordit is now running as a frontend plus GenLayer contract application. The app reads and writes through the deployed GenLayer contract using `genlayer-js` and injected wallets such as Rabby or MetaMask.

Production is live on Vercel:

```text
https://ordit-iota.vercel.app
```

Latest tested GenLayer contract:

```text
0xa318D47F272C1CBe7e3e165F95eEE002e1cE9005
```

## Contract Updates

- Redeployed `OrditContract.py` to StudioNet.
- Fixed the audit consensus path so validator-side evidence fetching happens directly inside the equivalence-principle execution path.
- Removed the previous nondeterministic helper pattern that caused GenVM lint warnings and contributed to validator disagreement.
- Verified the deployed schema matches the frontend call shape for `submit_and_audit_insight`.
- Confirmed `submit_and_audit_insight` accepts 13 parameters:
  - `request_id`
  - `org_id`
  - `dataset_id`
  - `dashboard_id`
  - `insight_text`
  - `metrics`
  - `assumptions`
  - `business_context`
  - `claim_hash`
  - `evidence_manifest_hash`
  - `evidence_source_urls`
  - `submitted_at`
  - `adjudicated_at`

## Evidence Fetching

- The contract requires at least one fetchable evidence source URL for insight audits.
- Validators fetch source URLs inside GenVM using `gl.nondet.web.get`.
- The final decision records cited sources and evidence quality on-chain.
- The tested flow cited:

```text
https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv
```

## Frontend Updates

- Frontend reads contract state directly through `genlayer-js`.
- App identity is now the connected wallet address.
- Dashboard data is wallet-scoped:
  - organizations are loaded from `get_user_organization_index`
  - datasets are loaded from each org
  - dashboards are loaded from each org
  - audit requests are loaded from each org
  - verdicts are loaded from request decisions
- The production frontend bundle was verified to contain the new contract address.
- The old contract address was verified absent from the production route bundles.

## Vercel Updates

Required Vercel environment variables:

```env
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS=0xa318D47F272C1CBe7e3e165F95eEE002e1cE9005
NEXT_PUBLIC_APP_URL=https://ordit-iota.vercel.app
```

Production deployment verified:

```text
https://ordit-iota.vercel.app
```

Checked routes:

```text
/dashboard
/insight
/organization
```

All returned `200`.

## Full-Cycle Test

The latest full-cycle GenLayer test passed:

```text
Wallet: 0xD41D3B896501f49F8d0382fa6a03c1E93951a7a6
Organization: ORG-FIX-202607211851
Dataset: DATASET-FIX-202607211851
Dashboard: DASH-FIX-202607211851
Audit Request: REQ-FIX-202607211851
Decision: DEC-1
Verdict: APPROVED
Audit TX: 0x0e58212697a7824294e86907cc144f1e6da47fc260955d7ab344f65315e20742
```

Readback confirmed:

```text
get_user_organization_index -> ORG-FIX-202607211851
get_org_dataset_index -> DATASET-FIX-202607211851
get_org_dashboard_index -> DASH-FIX-202607211851
get_org_request_index -> REQ-FIX-202607211851
get_request_decision_id -> DEC-1
get_latest_decision_for_request -> APPROVED
```

## Quality Gates

Passed:

```text
genvm-lint check contracts/OrditContract.py --json
npm run type-check
npm test -- --runInBand
npm run lint
npm run build
```

Known remaining lint warnings:

```text
src/__tests__/parsers.test.ts
- parseDashboard unused
- parseInsightRequest unused

src/components/ui/ScoreRing.tsx
- color unused
```

These are warnings only and did not block the build.

## GitHub

Latest pushed commit:

```text
c301d29 Fix GenLayer audit consensus fetch path
```

Branch:

```text
main
```

Remote:

```text
origin/main
```

## Important Note

The app is wallet-scoped. Records created by one wallet only appear for that wallet unless another wallet is explicitly added to the organization role index. This is expected behavior for the current frontend and contract model.
