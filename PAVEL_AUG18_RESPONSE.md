# Response to Pavel Kolosov — 18 Aug 2026

## Validator verification

The consensus evaluator now instructs every validator to independently fetch the permitted sources, inspect their content, classify material claims, and verify the proposed verdict, material findings/scores, and citations. Ambiguous or unavailable evidence escalates to `NEEDS_REVIEW`; semantic equivalence is used rather than byte-identical prose.

## Citation integrity

The fetch-success fallback has been removed. A citation is accepted only as a structured `{url, content_hash, claim}` record whose URL was fetched successfully, whose content hash matches that fetch, and which names the supported or contradicted claim. Unfetched and fabricated citations are discarded.

## Evidence commitment

The evaluator returns the fetched evidence bundle. Each canonical source record includes URL, label, status, content hash and bounded adjudication content; the contract computes a SHA-256 source commitment and then a SHA-256 commitment over the ordered source commitments. The decision stores `fetched_evidence_commitment` and committed source metadata. This is distinct from the caller-supplied `evidence_manifest_hash`.

## Human trust model

Human review requires the explicit `REVIEWER` organization role and rejects `reviewer == submitted_by` on-chain. Activation and blocking require `OWNER` or `ADMIN`; ordinary membership and `ANALYST` are insufficient.

## Verification status

No StudioNet deployment, integration proof, production redeploy, or live transaction hashes are claimed by this response. Those require the GenLayer deployment credentials/tooling and a checked-in integration harness; they remain explicit blockers until actually executed.
