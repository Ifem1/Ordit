# Architecture

Ordit now uses a contract-first GenLayer architecture.

```txt
Injected wallet
      |
Next.js frontend
      |
genlayer-js read/write clients
      |
OrditContract on GenLayer
```

## Source Of Truth

`contracts/OrditContract.py` is the authority for:

- organizations and wallet roles
- datasets and dashboards
- insight audit requests
- validator consensus decisions
- human review decisions
- activated business decisions
- audit logs
- approved and blocked claim hashes
- reviewer reputation

Frontend pages read contract indexes and detail methods directly.

## Evidence

The audit flow accepts validator-fetchable source URLs. The Intelligent Contract fetches those URLs during GenVM adjudication, summarizes source content, and asks validators to score the claim against fetched evidence first.

Large or private files should not be placed on-chain. Use public/signed URLs, IPFS/Arweave gateways, API endpoints, hashes, or attestations that validators can inspect.

## Wallet Access

Rabby/MetaMask signs writes through `genlayer-js`. The app does not generate browser private keys.
