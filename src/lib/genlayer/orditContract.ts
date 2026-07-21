import { callGenLayerMethod } from "./client";
import { GENLAYER_CONFIG } from "./config";
import { getTxExplorerUrl } from "./explorer";
import {
  parseOrganization,
  parseDataset,
  parseDashboard,
  parseInsightRequest,
  parseDecision,
  parseAuditLog,
  parseIndex,
} from "./parsers";
import type {
  CreateOrganizationParams,
  RegisterDatasetParams,
  RegisterDashboardParams,
  SubmitInsightAuditParams,
  HumanReviewParams,
  ContractOrganization,
  ContractDataset,
  ContractDashboard,
  InsightAuditRequest,
  InsightDecision,
  AuditLogEntry,
} from "./types";

function addr(): string {
  return GENLAYER_CONFIG.contractAddress;
}

function now(): string {
  return new Date().toISOString();
}

// ── Owner / Status ─────────────────────────────────────────────────────────────

export async function getOwner(): Promise<string> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_owner");
  return result ?? "";
}

export async function isPaused(): Promise<boolean> {
  const { result } = await callGenLayerMethod<boolean>(addr(), "is_paused");
  return result ?? false;
}

export async function getContractSummary(): Promise<Record<string, unknown>> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_contract_summary");
  if (typeof result === "string" && result) {
    try { return JSON.parse(result); } catch { return {}; }
  }
  return (result as unknown as Record<string, unknown>) ?? {};
}

// ── Organizations ──────────────────────────────────────────────────────────────

export async function createOrganization(
  params: CreateOrganizationParams,
  sender: string,
): Promise<{ org: ContractOrganization; tx_hash: string; explorer_url: string }> {
  const { result, tx_hash } = await callGenLayerMethod<string>(
    addr(),
    "create_organization",
    {
      org_id: params.org_id ?? "",
      name: params.name,
      industry: params.industry,
      metadata_hash: params.metadata_hash,
      created_at: params.created_at ?? now(),
    },
    sender,
  );
  // create_organization returns the org_id string; fetch the full record
  const orgId = typeof result === "string" ? result : "";
  return {
    org: parseOrganization({ org_id: orgId, name: params.name, industry: params.industry, metadata_hash: params.metadata_hash }),
    tx_hash: tx_hash ?? "",
    explorer_url: getTxExplorerUrl(tx_hash ?? ""),
  };
}

export async function getOrganization(orgId: string): Promise<ContractOrganization> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_organization", { org_id: orgId });
  return parseOrganization(result);
}

export async function getOrganizationIndex(): Promise<string[]> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_organization_index");
  return parseIndex(result);
}

export async function getUserOrganizationIndex(wallet: string): Promise<string[]> {
  const { result } = await callGenLayerMethod<string>(
    addr(),
    "get_user_organization_index",
    { wallet },
  );
  return parseIndex(result);
}

export async function addOrganizationRole(
  orgId: string,
  wallet: string,
  role: string,
  sender: string,
): Promise<{ tx_hash: string; explorer_url: string }> {
  const { tx_hash } = await callGenLayerMethod(
    addr(),
    "add_organization_role",
    { org_id: orgId, wallet, role, added_at: now() },
    sender,
  );
  return { tx_hash: tx_hash ?? "", explorer_url: getTxExplorerUrl(tx_hash ?? "") };
}

export async function removeOrganizationRole(
  orgId: string,
  wallet: string,
  sender: string,
): Promise<{ tx_hash: string; explorer_url: string }> {
  const { tx_hash } = await callGenLayerMethod(
    addr(),
    "remove_organization_role",
    { org_id: orgId, wallet, removed_at: now() },
    sender,
  );
  return { tx_hash: tx_hash ?? "", explorer_url: getTxExplorerUrl(tx_hash ?? "") };
}

export async function setOrganizationStatus(
  orgId: string,
  status: string,
  sender: string,
): Promise<{ tx_hash: string; explorer_url: string }> {
  const { tx_hash } = await callGenLayerMethod(
    addr(),
    "set_organization_status",
    { org_id: orgId, status, updated_at: now() },
    sender,
  );
  return { tx_hash: tx_hash ?? "", explorer_url: getTxExplorerUrl(tx_hash ?? "") };
}

// ── Datasets ───────────────────────────────────────────────────────────────────

export async function registerDataset(
  params: RegisterDatasetParams,
  sender: string,
): Promise<{ dataset: ContractDataset; tx_hash: string; explorer_url: string }> {
  const { result, tx_hash } = await callGenLayerMethod<string>(
    addr(),
    "register_dataset",
    {
      dataset_id: params.dataset_id ?? "",
      org_id: params.org_id,
      name: params.name,
      source: params.source,
      schema_summary: params.schema_summary,
      metadata_hash: params.metadata_hash,
      registered_at: params.registered_at ?? now(),
    },
    sender,
  );
  const datasetId = typeof result === "string" ? result : "";
  return {
    dataset: parseDataset({ dataset_id: datasetId, org_id: params.org_id, name: params.name, source: params.source, schema_summary: params.schema_summary, metadata_hash: params.metadata_hash }),
    tx_hash: tx_hash ?? "",
    explorer_url: getTxExplorerUrl(tx_hash ?? ""),
  };
}

export async function getDataset(datasetId: string): Promise<ContractDataset> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_dataset", { dataset_id: datasetId });
  return parseDataset(result);
}

export async function getOrgDatasetIndex(orgId: string): Promise<string[]> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_org_dataset_index", { org_id: orgId });
  return parseIndex(result);
}

// ── Dashboards ─────────────────────────────────────────────────────────────────

export async function registerDashboard(
  params: RegisterDashboardParams,
  sender: string,
): Promise<{ dashboard: ContractDashboard; tx_hash: string; explorer_url: string }> {
  const { result, tx_hash } = await callGenLayerMethod<string>(
    addr(),
    "register_dashboard",
    {
      dashboard_id: params.dashboard_id ?? "",
      org_id: params.org_id,
      name: params.name,
      report_type: params.report_type,
      reporting_period: params.reporting_period,
      metadata_hash: params.metadata_hash,
      registered_at: params.registered_at ?? now(),
    },
    sender,
  );
  const dashboardId = typeof result === "string" ? result : "";
  return {
    dashboard: parseDashboard({ dashboard_id: dashboardId, org_id: params.org_id, name: params.name, report_type: params.report_type, reporting_period: params.reporting_period, metadata_hash: params.metadata_hash }),
    tx_hash: tx_hash ?? "",
    explorer_url: getTxExplorerUrl(tx_hash ?? ""),
  };
}

export async function getDashboard(dashboardId: string): Promise<ContractDashboard> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_dashboard", { dashboard_id: dashboardId });
  return parseDashboard(result);
}

export async function getOrgDashboardIndex(orgId: string): Promise<string[]> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_org_dashboard_index", { org_id: orgId });
  return parseIndex(result);
}

// ── Insight Auditing ───────────────────────────────────────────────────────────

export async function submitAndAuditInsight(
  params: SubmitInsightAuditParams,
  sender: string,
): Promise<{ request: InsightAuditRequest; decision: InsightDecision; tx_hash: string; explorer_url: string }> {
  const ts = now();
  const { result, tx_hash } = await callGenLayerMethod<string>(
    addr(),
    "submit_and_audit_insight",
    {
      request_id: params.request_id ?? "",
      org_id: params.org_id,
      dataset_id: params.dataset_id,
      dashboard_id: params.dashboard_id,
      insight_text: params.insight_text,
      metrics: params.metrics,
      assumptions: params.assumptions,
      business_context: params.business_context,
      claim_hash: params.claim_hash,
      evidence_manifest_hash: params.evidence_manifest_hash ?? "",
      evidence_source_urls: params.evidence_source_urls,
      submitted_at: params.submitted_at ?? ts,
      adjudicated_at: params.adjudicated_at ?? ts,
    },
    sender,
  );
  // submit_and_audit_insight returns the decision JSON string
  const decision = parseDecision(result);
  const request = parseInsightRequest({ request_id: decision.request_id, org_id: params.org_id, dataset_id: params.dataset_id, dashboard_id: params.dashboard_id, insight_text: params.insight_text, claim_hash: params.claim_hash, status: decision.verdict === "APPROVED" ? "APPROVED" : "ADJUDICATED" });
  return {
    request,
    decision,
    tx_hash: tx_hash ?? "",
    explorer_url: getTxExplorerUrl(tx_hash ?? ""),
  };
}

export async function submitInsightAuditRequest(
  params: Omit<SubmitInsightAuditParams, "adjudicated_at">,
  sender: string,
): Promise<{ request_id: string; tx_hash: string; explorer_url: string }> {
  const { result, tx_hash } = await callGenLayerMethod<string>(
    addr(),
    "submit_insight_audit_request",
    {
      request_id: params.request_id ?? "",
      org_id: params.org_id,
      dataset_id: params.dataset_id,
      dashboard_id: params.dashboard_id,
      insight_text: params.insight_text,
      metrics: params.metrics,
      assumptions: params.assumptions,
      business_context: params.business_context,
      claim_hash: params.claim_hash,
      evidence_manifest_hash: params.evidence_manifest_hash ?? "",
      evidence_source_urls: params.evidence_source_urls,
      submitted_at: params.submitted_at ?? now(),
    },
    sender,
  );
  return {
    request_id: typeof result === "string" ? result : "",
    tx_hash: tx_hash ?? "",
    explorer_url: getTxExplorerUrl(tx_hash ?? ""),
  };
}

export async function adjudicateInsightRequest(
  requestId: string,
  sender: string,
): Promise<{ decision: InsightDecision; tx_hash: string; explorer_url: string }> {
  const { result, tx_hash } = await callGenLayerMethod<string>(
    addr(),
    "adjudicate_insight_request",
    { request_id: requestId, adjudicated_at: now() },
    sender,
  );
  return {
    decision: parseDecision(result),
    tx_hash: tx_hash ?? "",
    explorer_url: getTxExplorerUrl(tx_hash ?? ""),
  };
}

export async function getInsightRequest(requestId: string): Promise<InsightAuditRequest> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_insight_request", { request_id: requestId });
  return parseInsightRequest(result);
}

export async function getLatestDecisionForRequest(requestId: string): Promise<InsightDecision> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_latest_decision_for_request", { request_id: requestId });
  return parseDecision(result);
}

export async function getDecision(decisionId: string): Promise<InsightDecision> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_decision", { decision_id: decisionId });
  return parseDecision(result);
}

export async function getEscalation(requestId: string): Promise<Record<string, unknown>> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_escalation", { request_id: requestId });
  if (typeof result === "string" && result) {
    try { return JSON.parse(result); } catch { return {}; }
  }
  return {};
}

// ── Human Review ───────────────────────────────────────────────────────────────

export async function humanReviewDecision(
  params: HumanReviewParams,
  sender: string,
): Promise<{ tx_hash: string; explorer_url: string }> {
  const { tx_hash } = await callGenLayerMethod(
    addr(),
    "human_review_decision",
    {
      request_id: params.request_id,
      final_verdict: params.final_verdict,
      notes: params.notes,
      review_evidence_hash: params.review_evidence_hash ?? "",
      decided_at: params.decided_at ?? now(),
    },
    sender,
  );
  return { tx_hash: tx_hash ?? "", explorer_url: getTxExplorerUrl(tx_hash ?? "") };
}

export async function markBusinessDecisionActivated(
  requestId: string,
  activationSummary: string,
  sender: string,
): Promise<{ tx_hash: string; explorer_url: string }> {
  const { tx_hash } = await callGenLayerMethod(
    addr(),
    "mark_business_decision_activated",
    {
      request_id: requestId,
      activation_summary: activationSummary,
      activated_at: now(),
    },
    sender,
  );
  return { tx_hash: tx_hash ?? "", explorer_url: getTxExplorerUrl(tx_hash ?? "") };
}

export async function markBusinessDecisionBlocked(
  requestId: string,
  blockReason: string,
  sender: string,
): Promise<{ tx_hash: string; explorer_url: string }> {
  const { tx_hash } = await callGenLayerMethod(
    addr(),
    "mark_business_decision_blocked",
    { request_id: requestId, block_reason: blockReason, blocked_at: now() },
    sender,
  );
  return { tx_hash: tx_hash ?? "", explorer_url: getTxExplorerUrl(tx_hash ?? "") };
}

export async function getHumanReview(requestId: string): Promise<Record<string, unknown>> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_human_review", { request_id: requestId });
  if (typeof result === "string" && result) {
    try { return JSON.parse(result); } catch { return {}; }
  }
  return {};
}

export async function getActivatedDecision(requestId: string): Promise<Record<string, unknown>> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_activated_decision", { request_id: requestId });
  if (typeof result === "string" && result) {
    try { return JSON.parse(result); } catch { return {}; }
  }
  return {};
}

// ── Audit ──────────────────────────────────────────────────────────────────────

export async function getAuditLog(auditId: string): Promise<AuditLogEntry> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_audit_log", { audit_id: auditId });
  return parseAuditLog(result);
}

export async function getRequestAuditIndex(requestId: string): Promise<string[]> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_request_audit_index", { request_id: requestId });
  return parseIndex(result);
}

export async function getOrgRequestIndex(orgId: string): Promise<string[]> {
  const { result } = await callGenLayerMethod<string>(addr(), "get_org_request_index", { org_id: orgId });
  return parseIndex(result);
}

export async function isClaimHashApproved(claimHash: string): Promise<boolean> {
  const { result } = await callGenLayerMethod<string>(addr(), "is_claim_hash_approved", { claim_hash: claimHash });
  return typeof result === "string" ? result !== "" : Boolean(result);
}

export async function isClaimHashBlocked(claimHash: string): Promise<boolean> {
  const { result } = await callGenLayerMethod<string>(addr(), "is_claim_hash_blocked", { claim_hash: claimHash });
  return typeof result === "string" ? result !== "" : Boolean(result);
}

export async function getReviewerReputation(
  orgId: string,
  reviewerWallet: string,
): Promise<Record<string, unknown>> {
  const { result } = await callGenLayerMethod<string>(
    addr(),
    "get_reviewer_reputation",
    { org_id: orgId, reviewer_wallet: reviewerWallet },
  );
  if (typeof result === "string" && result) {
    try { return JSON.parse(result); } catch { return {}; }
  }
  return {};
}
