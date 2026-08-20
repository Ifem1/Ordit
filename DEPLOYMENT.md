# Deployment

## Contract

The current StudioNet deployment was built from commit `58908b0a7fb9861a8311b4a9b8570711cf82dbc1`.

- Contract address: `0xd4B2374dfe85A8E5bca55e7535bB6cd23A10D65e`
- Deployment transaction: `0xa5ae29a703f1def138719ace42f3e9356c818fee941ddb7a3462e39d0167e4d7`
- Explorer: [StudioNet contract](https://genlayer-explorer.vercel.app/address/0xd4B2374dfe85A8E5bca55e7535bB6cd23A10D65e)

To deploy a later contract revision, inspect its schema before wiring it to production.

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
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://genlayer-explorer.vercel.app
NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS=0xd4B2374dfe85A8E5bca55e7535bB6cd23A10D65e
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
