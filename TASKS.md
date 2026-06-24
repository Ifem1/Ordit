# ORDIT — TASKS

## Status Key
- ✅ Complete
- 🔄 In Progress  
- ⏳ Pending
- ❌ Blocked

---

## Phase 1: Foundation ✅

- [x] Scaffold Next.js 15 App Router project
- [x] Install all dependencies (Supabase, Viem, Framer Motion, Radix UI, Zod, etc.)
- [x] Create full folder structure (lib/, components/, app/, contracts/)
- [x] Configure TypeScript paths
- [x] Configure globals.css with glassmorphism design system
- [x] Set up environment variables (.env.local, .env.example)

## Phase 2: GenLayer Integration ✅

- [x] `lib/genlayer/config.ts` — StudioNet chain config
- [x] `lib/genlayer/client.ts` — JSON-RPC client + callGenLayerMethod
- [x] `lib/genlayer/orditContract.ts` — All required contract wrappers
- [x] `lib/genlayer/types.ts` — TypeScript interfaces
- [x] `lib/genlayer/parsers.ts` — Contract response parsers
- [x] `lib/genlayer/explorer.ts` — StudioNet explorer URL builders
- [x] `lib/ordit/hash.ts` — Deterministic claim packet hashing
- [x] `lib/ordit/claimPacket.ts` — Evidence manifest builder
- [x] `lib/ordit/contractSync.ts` — Supabase mirror sync functions

## Phase 3: GenLayer Intelligent Contract ✅

- [x] `contracts/OrditContract.py`
  - [x] Owner / Status (get_owner, is_paused, get_contract_summary, pause, unpause)
  - [x] Organizations (create, add_role, remove_role, set_status, get, get_index)
  - [x] Datasets (register, update, set_status, get, get_index)
  - [x] Dashboards (register, update, set_status, get, get_index)
  - [x] Insight Auditing (submit, adjudicate via gl.exec_prompt, submit_and_audit)
  - [x] Human Review (human_review_decision, mark_activated, mark_blocked)
  - [x] Audit trail (get_audit_log, get_request_audit_index, get_org_request_index)
  - [x] Claim hash tracking (is_approved, is_blocked, reviewer_reputation)

## Phase 4: Supabase ✅

- [x] `lib/supabase/client.ts` — Browser client
- [x] `lib/supabase/server.ts` — Server client (SSR)
- [x] `supabase/migrations/001_ordit_schema.sql` — All 13 tables with RLS
  - profiles, subscriptions, organizations, organization_roles
  - datasets, dashboards, insight_audit_requests, insight_decisions
  - human_reviews, activated_decisions, audit_events
  - contract_transactions, evidence_files
- [x] Auth middleware (src/middleware.ts)
- [x] Auto-profile creation trigger

## Phase 5: UI System ✅

- [x] Glassmorphism design system (globals.css)
- [x] OrditLogo (SVG — O with magnifying glass + gradient wordmark)
- [x] Button (primary, secondary, ghost, danger, teal + loading state)
- [x] Card (glassmorphism, hover, glow variants)
- [x] Badge + VerdictBadge
- [x] Input, Textarea, Select
- [x] ScoreRing (animated circular progress)
- [x] Modal
- [x] Spinner
- [x] ScoreGrid (8-dimension score display)
- [x] FindingsPanel (supported/unsupported claims, recommendations, rationale)
- [x] TxLink (StudioNet explorer links)
- [x] Navbar (sidebar navigation)
- [x] AppShell (layout wrapper)

## Phase 6: Pages ✅

- [x] Landing Page (hero, features, verdicts, pricing)
- [x] Auth (sign in / sign up)
- [x] Dashboard (stats, quick actions, recent audits)
- [x] Organizations (list + new form)
- [x] Datasets (list + new form with file upload)
- [x] Dashboards (list + new form)
- [x] Insight Audit (list + submit form)
- [x] Case File (verdict, scores, findings, evidence, actions)
- [x] Activate Business Decision
- [x] Human Review
- [x] Audit Trail (timeline with explorer links)
- [x] Subscription (free/pro plans)

## Phase 7: Testing ⏳

- [ ] Install Jest + @testing-library/react
- [ ] Unit tests: parsers.ts
- [ ] Unit tests: hash.ts
- [ ] Integration tests: Supabase sync functions
- [ ] E2E smoke test flow

## Phase 8: Deployment ⏳

- [ ] Create Supabase project + run migration SQL
- [ ] Deploy OrditContract to StudioNet (Chain ID 61999)
- [ ] Set NEXT_PUBLIC_ORDIT_CONTRACT_ADDRESS in .env.local
- [ ] Create Supabase storage bucket "evidence" (public)
- [ ] Deploy to Vercel / production
- [ ] Verify full smoke test flow
