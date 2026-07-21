# Deployment

## Contract

Deploy `contracts/OrditContract.py` to the intended GenLayer network, then inspect the schema before wiring a production deployment.

```bash
genlayer network set studionet
genlayer deploy --contract contracts/OrditContract.py
genlayer schema <contractAddress>
```

For production-like testing, use Bradbury with a funded wallet.

## Frontend

Set the deployed contract address:

```bash
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS=<contractAddress>
```

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run type-check
npm run lint
npm test -- --runInBand
genvm-lint check contracts/OrditContract.py --json
npm run build
```

## Wallets

Users need Rabby, MetaMask, or another injected wallet connected to the configured GenLayer network. Writes are signed by the wallet through `genlayer-js`; reads use a read-only client.
