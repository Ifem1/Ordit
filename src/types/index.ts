// ── Verdict & Scores ──────────────────────────────────────────────────────────

export type Verdict =
  | "APPROVED"
  | "NEEDS_REVISION"
  | "UNSUPPORTED"
  | "NEEDS_REVIEW"
  | "HUMAN_APPROVED"
  | "HUMAN_REJECTED"
  | "PENDING";

export interface InsightScores {
  evidence_support_score: number;
  statistical_confidence_score: number;
  explainability_score: number;
  narrative_accuracy_score: number;
  business_impact_score: number;
  hallucination_risk_score: number;
  completeness_score: number;
  confidence_score: number;
}

export interface InsightFindings {
  supported_claims: string[];
  unsupported_claims: string[];
  missing_context: string[];
  misleading_statements: string[];
  contradictions: string[];
  risks: string[];
  recommendations: string[];
  required_changes: string[];
  rationale: string;
  audit_summary: string;
}

// ── Contract Types ─────────────────────────────────────────────────────────────

export interface ContractOrganization {
  id: string;
  name: string;
  industry: string;
  metadata_hash: string;
  owner: string;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  created_at: number;
}

export interface ContractDataset {
  id: string;
  org_id: string;
  name: string;
  source: string;
  schema_summary: string;
  metadata_hash: string;
  status: "ACTIVE" | "ARCHIVED";
  created_at: number;
}

export interface ContractDashboard {
  id: string;
  org_id: string;
  name: string;
  report_type: string;
  reporting_period: string;
  metadata_hash: string;
  status: "ACTIVE" | "ARCHIVED";
  created_at: number;
}

export interface InsightAuditRequest {
  id: string;
  org_id: string;
  dataset_id: string;
  dashboard_id: string;
  insight_text: string;
  claim_hash: string;
  submitter: string;
  status: "PENDING" | "ADJUDICATED" | "NEEDS_REVIEW" | "ACTIVATED" | "BLOCKED";
  submitted_at: number;
}

export interface InsightDecision {
  id: string;
  request_id: string;
  verdict: Verdict;
  scores: InsightScores;
  findings: InsightFindings;
  adjudicated_at: number;
  tx_hash: string;
}

export interface HumanReview {
  id: string;
  request_id: string;
  reviewer: string;
  verdict: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  notes: string;
  reviewed_at: number;
}

export interface AuditLogEntry {
  id: string;
  request_id: string;
  event_type: string;
  actor: string;
  payload: Record<string, unknown>;
  tx_hash: string;
  timestamp: number;
}

// ── Supabase Row Types ─────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: "free" | "pro";
  audit_count_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseOrganization {
  id: string;
  onchain_id: string;
  contract_address: string;
  chain_id: number;
  name: string;
  industry: string;
  owner_id: string;
  status: string;
  tx_hash: string;
  explorer_url: string;
  sync_status: "pending" | "synced" | "failed";
  raw_contract_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDataset {
  id: string;
  onchain_id: string;
  org_id: string;
  contract_address: string;
  chain_id: number;
  name: string;
  source: string;
  schema_summary: string;
  metadata_hash: string;
  status: string;
  tx_hash: string;
  explorer_url: string;
  sync_status: "pending" | "synced" | "failed";
  raw_contract_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupabaseDashboard {
  id: string;
  onchain_id: string;
  org_id: string;
  contract_address: string;
  chain_id: number;
  name: string;
  report_type: string;
  reporting_period: string;
  metadata_hash: string;
  status: string;
  tx_hash: string;
  explorer_url: string;
  sync_status: "pending" | "synced" | "failed";
  raw_contract_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupabaseInsightAuditRequest {
  id: string;
  onchain_id: string;
  org_id: string;
  dataset_id: string;
  dashboard_id: string;
  contract_address: string;
  chain_id: number;
  insight_text: string;
  claim_hash: string;
  submitter_id: string;
  status: string;
  verdict: Verdict | null;
  scores: InsightScores | null;
  findings: InsightFindings | null;
  tx_hash: string;
  explorer_url: string;
  sync_status: "pending" | "synced" | "failed";
  raw_contract_json: Record<string, unknown>;
  adjudicated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EvidenceFile {
  id: string;
  request_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: "free" | "pro";
  status: "active" | "cancelled" | "past_due";
  current_period_end: string;
  created_at: string;
}

// ── Form Types ─────────────────────────────────────────────────────────────────

export interface CreateOrganizationForm {
  name: string;
  industry: string;
}

export interface RegisterDatasetForm {
  org_id: string;
  name: string;
  source: string;
  schema_summary: string;
}

export interface RegisterDashboardForm {
  org_id: string;
  name: string;
  report_type: string;
  reporting_period: string;
}

export interface SubmitInsightAuditForm {
  org_id: string;
  dataset_id: string;
  dashboard_id: string;
  insight_text: string;
  metrics: string;
  assumptions: string;
  business_context: string;
  evidence_files?: File[];
}
