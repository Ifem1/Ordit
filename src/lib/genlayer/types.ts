import type {
  ContractOrganization,
  ContractDataset,
  ContractDashboard,
  InsightAuditRequest,
  InsightDecision,
  HumanReview,
  AuditLogEntry,
} from "@/types";

// ── JSON-RPC primitives ────────────────────────────────────────────────────────

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: unknown[];
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

// ── Transaction result ─────────────────────────────────────────────────────────

export interface TransactionResult {
  tx_hash: string;
  status: "success" | "pending" | "failed";
  block_number?: number;
  gas_used?: number;
  return_value?: unknown;
}

// ── Contract call params ───────────────────────────────────────────────────────

export interface CreateOrganizationParams {
  org_id: string;
  name: string;
  industry: string;
  metadata_hash: string;
  created_at: string;
}

export interface RegisterDatasetParams {
  dataset_id: string;
  org_id: string;
  name: string;
  source: string;
  schema_summary: string;
  metadata_hash: string;
  registered_at: string;
}

export interface RegisterDashboardParams {
  dashboard_id: string;
  org_id: string;
  name: string;
  report_type: string;
  reporting_period: string;
  metadata_hash: string;
  registered_at: string;
}

export interface SubmitInsightAuditParams {
  request_id: string;
  org_id: string;
  dataset_id: string;
  dashboard_id: string;
  insight_text: string;
  metrics: string;
  assumptions: string;
  business_context: string;
  claim_hash: string;
  evidence_manifest_hash: string;
  submitted_at: string;
  adjudicated_at: string;
}

export interface HumanReviewParams {
  request_id: string;
  final_verdict: "APPROVED" | "UNSUPPORTED" | "NEEDS_REVISION";
  notes: string;
  review_evidence_hash: string;
  decided_at: string;
}

// ── Re-export contract types ───────────────────────────────────────────────────

export type {
  ContractOrganization,
  ContractDataset,
  ContractDashboard,
  InsightAuditRequest,
  InsightDecision,
  HumanReview,
  AuditLogEntry,
};
