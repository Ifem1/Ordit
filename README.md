# Ordit

**Trusted AI Consensus for Business Insights**

Ordit is a full-stack AI insight verification platform built on [GenLayer](https://genlayer.com). Different AI models produce different narratives from the same data — Ordit uses GenLayer Intelligent Contracts to determine whether AI-generated insights are actually supported by the underlying evidence, before they become business decisions.

![Dashboard Preview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop&q=80)

---

## Core Innovation

Traditional AI auditing is centralized — one model checks another. Ordit replaces this with **decentralized consensus verification**:

1. An analyst submits an AI-generated insight along with the underlying dataset, metrics, and business context
2. GenLayer validators **independently** evaluate whether the insight is factually supported, statistically sound, and free from hallucination
3. Validators reach consensus through GenLayer's **non-comparative equivalence principle** — each validator audits independently, then results are compared for agreement
4. The on-chain verdict (APPROVED, NEEDS_REVISION, UNSUPPORTED, or NEEDS_REVIEW) becomes an immutable audit trail

This means no single AI model controls the outcome. The verdict is a product of distributed agreement.

## Technical Foundation

| Layer | Technology |
|-------|-----------|
| Smart Contract | GenLayer Intelligent Contract (Python) |
| Consensus | `gl.eq_principle.prompt_non_comparative` |
| Frontend | Next.js 15 + TypeScript |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth |
| Deployment | Vercel |
| Network | GenLayer StudioNet |

### Deployment Status

| Component | Status |
|-----------|--------|
| Contract | [`0x52c55f700f39E4e83cF513cb7045e2FcaAddB66D`](https://studio.genlayer.com/contracts/0x52c55f700f39E4e83cF513cb7045e2FcaAddB66D) |
| Frontend | [ordit-iota.vercel.app](https://ordit-iota.vercel.app) |
| Network | GenLayer StudioNet |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Next.js)             │
│  Landing · Dashboard · Insight Audit · Case File │
│  Human Review · Audit Trail · Subscriptions      │
├─────────────────────────────────────────────────┤
│              Supabase (PostgreSQL)                │
│  organizations · datasets · dashboards           │
│  insight_audit_requests · audit_events           │
│  profiles · Row Level Security                   │
├─────────────────────────────────────────────────┤
│           GenLayer StudioNet                      │
│  OrditContract (Intelligent Contract)            │
│  Non-comparative consensus · 8D scoring          │
│  On-chain audit trail · Claim hash registry      │
└─────────────────────────────────────────────────┘
```

## Key Contract Methods

### `submit_and_audit_insight`
Single-call submission and consensus adjudication. Accepts the insight text, metrics, assumptions, business context, dataset/dashboard references, and a claim hash. Returns a structured verdict with 8-dimension scores and detailed findings.

### `human_review_decision`
Allows authorized org members to resolve insights flagged as NEEDS_REVIEW or NEEDS_REVISION. Tracks reviewer reputation on-chain.

### `mark_business_decision_activated`
Records when an APPROVED insight is acted upon as a real business decision — closing the accountability loop.

## 8-Dimension Audit Scoring

Every insight audit produces scores across 8 dimensions:

| Dimension | What it measures |
|-----------|-----------------|
| Evidence Support | How well the data supports the claims |
| Statistical Confidence | Strength of statistical evidence |
| Explainability | Clarity of methodology |
| Narrative Accuracy | Accuracy of language vs. data |
| Business Impact | Relevance and materiality |
| Hallucination Risk | Probability of fabricated content |
| Completeness | Whether all material factors were considered |
| Confidence | Overall assessment confidence |

## Notable Engineering Decisions

- **Non-comparative equivalence principle**: Each GenLayer validator audits independently. The equivalence check compares structured outputs for agreement on verdict and score ranges — avoiding the "echo chamber" problem of comparative consensus where validators see each other's work.

- **Claim hash registry**: Every insight submission is hashed. Approved hashes are recorded on-chain, preventing duplicate submissions and enabling instant lookup of previously verified claims. Blocked hashes prevent resubmission of rejected insights.

- **Verdict threshold enforcement**: Even if the AI consensus returns APPROVED, on-chain logic enforces safety thresholds — high hallucination risk or low evidence support automatically escalates the verdict regardless of the model's opinion.

- **Dual-layer data model**: Supabase mirrors on-chain state for fast queries and rich UI, while GenLayer provides the immutable source of truth. The `contractSync` module keeps both layers consistent.

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A GenLayer StudioNet wallet

### Setup

```bash
git clone https://github.com/Ifem1/Ordit.git
cd Ordit
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x52c55f700f39E4e83cF513cb7045e2FcaAddB66D
```

```bash
npm run dev
```

## License

MIT
