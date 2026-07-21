# Implementation Status

## Current

Ordit has been pivoted to a frontend + GenLayer contract architecture.

- App identity is an injected wallet address.
- Frontend reads contract state through `genlayer-js`.
- Writes are wallet-signed GenLayer transactions.
- Core pages no longer depend on an off-chain database mirror.
- Audit submissions require fetchable evidence source URLs.
- `OrditContract` fetches source URLs inside GenVM and includes evidence quality, cited sources, and evidence gaps in findings.

## Verified

- `npm run type-check`
- `npm run lint`
- `npm test -- --runInBand`
- `genvm-lint check contracts/OrditContract.py --json`
- `npm run build`

## Remaining

- Redeploy the contract and set `NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS`.
- Run contract direct tests for evidence-source validation.
- Run integration tests on the target GenLayer network.
- Decide whether future paid access should be implemented as an on-chain entitlement.
