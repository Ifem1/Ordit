# ORDIT — ARCHITECTURE

## Overview

Ordit is a GenLayer-first AI insight auditing platform. Organizations submit AI-generated narratives alongside underlying data to the OrditContract. GenLayer validators independently reach consensus on whether the insight is supported by the evidence.

**Stack:**
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Auth + Storage + DB Mirror:** Supabase
- **AI Consensus Logic:** GenLayer Intelligent Contract (Python)
- **Network:** StudioNet (Chain ID: 61999)
- **RPC:** https://studio.genlayer.com/api
- **Explorer:** https://explorer-studio.genlayer.com

---

## Architectural Principles

1. **GenLayer is the source of truth** for all business logic: org creation, dataset/dashboard registration, insight adjudication, human review, decision activation, audit trails.

2. **Supabase is a read mirror** for UI performance: it stores cached copies of on-chain data, auth profiles, uploaded files, and usage analytics. Supabase never determines whether an insight is approved.

3. **No extra backend** — no Express, NestJS, Firebase, or custom servers. Only Next.js API routes where absolutely needed (none required currently).

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/page.tsx               # Sign in / Sign up
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard
│   │   └── dashboards/             # Dashboard registry
│   ├── organization/               # Org management
│   ├── dataset/                    # Dataset management
│   ├── insight/                    # Audit request submission
│   ├── case/[id]/                  # Case file (core product)
│   ├── review/[id]/                # Human review
│   ├── audit/[id]/                 # Audit trail
│   └── subscription/               # Plan management
├── components/
│   ├── ui/                         # Design system primitives
│   ├── layout/                     # AppShell, Navbar, Logo
│   └── ordit/                      # Domain-specific components
├── lib/
│   ├── genlayer/                   # GenLayer integration layer
│   │   ├── config.ts               # Chain config
│   │   ├── client.ts               # JSON-RPC client
│   │   ├── orditContract.ts        # All contract method wrappers
│   │   ├── types.ts                # TypeScript interfaces
│   │   ├── parsers.ts              # Contract response parsers
│   │   └── explorer.ts             # Explorer URL builders
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   └── server.ts               # Server Supabase client
│   └── ordit/
│       ├── hash.ts                 # Deterministic claim packet hashing
│       ├── claimPacket.ts          # Evidence manifest builder
│       └── contractSync.ts         # Supabase mirror sync
├── types/index.ts                  # Shared TypeScript types
└── middleware.ts                   # Auth route protection
contracts/
└── OrditContract.py                # GenLayer Intelligent Contract
supabase/
└── migrations/001_ordit_schema.sql # Full database schema
```

---

## Data Flow

### Insight Audit (Happy Path)

```
User fills InsightAuditForm
  → buildClaimPacket() + hashClaimPacket()
  → submitAndAuditInsight() → OrditContract.submit_and_audit_insight()
      → OrditContract.submit_insight_audit_request()  [records request]
      → OrditContract.adjudicate_insight_request()    [GL validators run]
          → gl.exec_prompt() sends insight+data to GenLayer validators
          → Validators independently evaluate claims
          → GenLayer reaches consensus on verdict + scores + findings
          → Decision stored on-chain
  → Returns { request, decision, tx_hash }
  → syncInsightRequest() → Supabase mirror
  → User redirected to /case/[id]
```

### Decision Types

| Verdict | Meaning |
|---|---|
| APPROVED | All major claims are data-backed |
| NEEDS_REVISION | Core insight valid but some claims need updating |
| UNSUPPORTED | Claims not supported by the evidence |
| NEEDS_REVIEW | Ambiguous — escalated to human review |

---

## Contract Methods Map

| Category | Methods |
|---|---|
| Owner | get_owner, is_paused, get_contract_summary, pause, unpause |
| Organizations | create_organization, add_organization_role, remove_organization_role, set_organization_status, get_organization, get_organization_role, get_organization_index |
| Datasets | register_dataset, update_dataset_summary, set_dataset_status, get_dataset, get_organization_dataset_index |
| Dashboards | register_dashboard, update_dashboard_summary, set_dashboard_status, get_dashboard, get_organization_dashboard_index |
| Insight Auditing | submit_insight_audit_request, adjudicate_insight_request, submit_and_audit_insight, get_insight_request, get_request_decision_id, get_decision, get_latest_decision_for_request |
| Human Review | human_review_decision, mark_business_decision_activated, mark_business_decision_blocked, get_escalation, get_human_review, get_activated_decision |
| Audit | get_audit_log, get_request_audit_index, get_organization_request_index, get_reviewer_reputation, is_claim_hash_approved, is_claim_hash_blocked |

---

## Supabase Tables

| Table | Purpose |
|---|---|
| profiles | User accounts + subscription tier |
| subscriptions | Plan management |
| organizations | Mirror of on-chain orgs |
| organization_roles | Member roles |
| datasets | Mirror of on-chain datasets |
| dashboards | Mirror of on-chain dashboards |
| insight_audit_requests | Mirror of audit submissions + cached verdicts |
| insight_decisions | Mirror of GenLayer decisions |
| human_reviews | Human review records |
| activated_decisions | Activated business decisions |
| audit_events | Full event log with tx hashes |
| contract_transactions | Transaction index |
| evidence_files | Uploaded evidence file manifests |

---

## Design System

- **Style:** Glassmorphism on dark (#080812 base)
- **Primary color:** Indigo (#4f46e5 / #6366f1)
- **Accent color:** Teal (#0d9488 / #14b8a6)
- **Headings:** Sora (Google Fonts)
- **Body:** Inter Tight (Google Fonts)
- **Logo:** "O" wordmark with magnifying glass SVG icon, gradient (indigo → teal)
