# Review Response

## More Information Requested

Reviewer request:

```text
Please fix up this error
Failed to create organization

please manually test it to see if its fixed
```

Requested by Gen. Dave on July 31, 2026 at 10:00.

## Status

The reported issue has been fixed and manually tested.

I also recorded my testing and will attach the recording link when submitting this response.

Recording link:

```text
To be attached during submission.
```

## Key Fixes Made

### 1. Fixed Create Organization Wallet Write Error

The create organization failure was caused by the frontend wallet write path.

The app was passing the connected wallet into `genlayer-js` in a shape that could break browser wallet writes. I updated the frontend GenLayer client so injected wallet transactions route correctly through Rabby or MetaMask.

Updated file:

```text
src/lib/genlayer/client.ts
```

Result:

```text
Create Organization now works from the frontend with injected wallets.
```

### 2. Removed MetaMask Snap Prompt Requirement

MetaMask was asking for the `genlayer-wallet-plugin` Snap because the frontend was calling the GenLayer SDK wallet connect helper.

I removed that Snap-triggering path and replaced it with normal injected wallet chain handling:

```text
eth_chainId
wallet_switchEthereumChain
wallet_addEthereumChain
```

Result:

```text
MetaMask should use the normal injected wallet flow instead of asking for a GenLayer Snap.
```

### 3. Fixed Injected Wallet Transaction Routing

After removing the Snap path, MetaMask initially showed:

```text
Method not found: eth_sendTransaction
```

That happened because the transaction was being routed to the StudioNet RPC instead of the browser wallet provider.

I fixed the GenLayer client setup so:

```text
createClient receives the wallet as a string address for injected provider routing.
writeContract receives the account-shaped object needed by GenLayer transaction encoding.
```

Result:

```text
Transactions now route through the injected wallet provider correctly.
```

### 4. Fixed Submit Insight Audit Redirect

The Submit Insight Audit flow was completing on-chain, but after completion the frontend redirected to:

```text
/case
```

That route is invalid because the case page requires a request id:

```text
/case/<request-id>
```

I fixed the submit audit page to generate the request id before the contract call, write that same id to the contract, and redirect to the correct case details page.

Updated file:

```text
src/app/insight/new/page.tsx
```

Result:

```text
After submitting an insight audit, the user is now redirected to the correct result page instead of a 404 page.
```

## Manual Testing Completed

I manually tested the full frontend flow from beginning to end:

```text
1. Connected wallet
2. Created an organization
3. Confirmed the organization appeared under Organizations
4. Registered a dataset under that organization
5. Registered a dashboard under that organization
6. Submitted an insight audit using a public evidence URL
7. Confirmed the audit completed on the contract
8. Confirmed the audit appeared under Insight Audit
9. Opened the case details page
10. Confirmed the verdict and audit scores displayed correctly
```

Public evidence URL used during testing:

```text
https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv
```

I also tested another full flow using:

```text
https://raw.githubusercontent.com/plotly/datasets/master/2014_usa_states.csv
```

Both flows completed successfully.

## Production Verification

Production frontend:

```text
https://ordit-iota.vercel.app
```

Tested production pages:

```text
/organization/new
/dashboard
/insight/new
```

All returned:

```text
200 OK
```

Latest tested contract address:

```text
0xa318D47F272C1CBe7e3e165F95eEE002e1cE9005
```

## Automated Checks Passed

The following checks were run and passed:

```text
npm run type-check
npm test -- --runInBand
npm run lint
npm run build
```

The contract lint check was also previously verified:

```text
genvm-lint check contracts/OrditContract.py --json
```

`npm run lint` still reports only existing non-blocking warnings. There are no blocking lint errors.

## Relevant Commits

```text
50b87bf Fix injected wallet GenLayer writes
baa0c72 Avoid MetaMask snap prompt for wallet writes
3d9f373 Route injected wallet transactions through provider
ac068f0 Fix insight audit case redirect
```

## Final Note

The specific reported issue, `Failed to create organization`, has been fixed.

The frontend was manually tested after the fix, including the full organization, dataset, dashboard, and insight audit flow.

I recorded the test run and will attach the recording link when submitting this response.
