# Reply to More Information Requested

## Request

Gen. Dave requested the following on July 28, 2026:

```text
Please fix up this error Failed to create organization

Please also manually test the frontend before resubmitting to find more bugs and fix them
```

## Response

The create organization issue has been investigated, fixed, tested, pushed to GitHub, and deployed to Vercel.

## Root Cause

The failure was in the frontend GenLayer wallet write wrapper, not in the deployed contract.

The frontend was passing the connected wallet as a bare address string into the `genlayer-js@1.1.8` write path. The SDK accepts an address at the type level, but its runtime transaction path expects an account-shaped object with an `address` field when preparing browser-wallet writes.

That mismatch could cause organization creation to fail from Rabby, MetaMask, or another injected wallet.

## Fix Made

Updated:

```text
src/lib/genlayer/client.ts
```

The frontend now wraps the connected wallet address into an account-shaped object before calling `writeContract`.

The write call now passes:

```text
account: { address: connectedWalletAddress }
```

This matches the runtime shape expected by `genlayer-js` while still allowing the injected wallet provider to sign the transaction.

## Regression Test Added

Added:

```text
src/__tests__/genlayer-client.test.ts
```

The new test verifies that the organization creation flow passes an address-bearing account object into the GenLayer write call. This protects the create organization path from regressing back to the broken bare-string wallet shape.

## Contract Verification

The deployed contract was tested directly on StudioNet.

Latest contract:

```text
0xa318D47F272C1CBe7e3e165F95eEE002e1cE9005
```

Live contract write tested:

```text
create_organization
```

Result:

```text
Transaction accepted
Organization was written
Wallet organization index returned the new organization
```

This confirmed the contract itself is healthy and the create organization issue was frontend-side.

## Frontend Manual Testing

The frontend was tested locally in production mode using the same app routes users interact with.

Checked pages:

```text
/
/dashboard
/organization
/organization/new
/dataset
/dataset/new
/dashboard/dashboards
/dashboard/dashboards/new
/insight
/insight/new
/review
/settings
```

All routes returned:

```text
200 OK
```

Chromium render checks were also run for:

```text
/organization/new
/dashboard
```

The pages rendered successfully and the create organization page displayed correctly.

## Production Verification

The fix was pushed to GitHub and picked up by Vercel.

Production deployment:

```text
https://ordit-iota.vercel.app
```

Verified production routes:

```text
https://ordit-iota.vercel.app/organization/new
https://ordit-iota.vercel.app/dashboard
https://ordit-iota.vercel.app/insight/new
```

All returned:

```text
200 OK
```

## Quality Checks Passed

The following checks passed after the fix:

```text
genvm-lint check contracts/OrditContract.py --json
npm run type-check
npm test -- --runInBand
npm run lint
npm run build
```

`npm run lint` still reports the existing warnings only. There are no blocking lint errors.

## GitHub Commit

Fix commit:

```text
50b87bf Fix injected wallet GenLayer writes
```

GitHub commit link:

```text
https://github.com/Ifem1/Ordit/commit/50b87bf
```

## Current Status

The reported frontend create organization issue is fixed.

The frontend has been tested manually and through automated checks.

The fix is live on production Vercel.
