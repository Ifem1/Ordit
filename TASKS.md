# Tasks

## Completed

- Contract-first GenLayer architecture
- Injected wallet identity and writes
- Contract-backed organization, dataset, dashboard, audit, review, activation, and audit-trail flows
- Validator-fetchable evidence source URLs for audit submissions
- Contract-side evidence fetching and evidence-quality findings
- Removed off-chain database and storage dependency from the app path

## Next

- Redeploy `OrditContract.py` because the audit method signatures changed
- Regenerate or inspect the deployed contract schema before using the updated frontend
- Add direct GenLayer tests for evidence-source normalization and missing/failed URL handling
- Add integration tests for validator evidence fetching on StudioNet or Localnet
- Consider a non-authoritative indexer later only if search/pagination becomes painful
