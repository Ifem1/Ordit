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
  cited_sources: string[];
  evidence_gaps: string[];
  evidence_quality: string;
  recommendations: string[];
  required_changes: string[];
  rationale: string;
  audit_summary: string;
}

export interface EvidenceSource {
  label: string;
  url: string;
}

export interface ContractOrganization {
  id: string;
  name: string;
  industry: string;
  metadata_hash: string;
  owner: string;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED" | "INACTIVE";
  created_at: number;
}

export interface ContractDataset {
  id: string;
  org_id: string;
  name: string;
  source: string;
  schema_summary: string;
  metadata_hash: string;
  status: "ACTIVE" | "ARCHIVED" | "SUSPENDED";
  created_at: number;
}

export interface ContractDashboard {
  id: string;
  org_id: string;
  name: string;
  report_type: string;
  reporting_period: string;
  metadata_hash: string;
  status: "ACTIVE" | "ARCHIVED" | "SUSPENDED";
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
  status: "PENDING" | "APPROVED" | "UNSUPPORTED" | "NEEDS_REVISION" | "NEEDS_REVIEW" | "ACTIVATED" | "BLOCKED";
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
  evidence_sources: EvidenceSource[];
  evidence_files?: File[];
}
