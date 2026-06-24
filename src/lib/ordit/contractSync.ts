import { createClient } from "@/lib/supabase/client";
import { getTxExplorerUrl } from "@/lib/genlayer/explorer";
import { GENLAYER_CONFIG } from "@/lib/genlayer/config";
import type {
  ContractOrganization,
  ContractDataset,
  ContractDashboard,
  InsightAuditRequest,
  InsightDecision,
} from "@/lib/genlayer/types";

const CONTRACT = GENLAYER_CONFIG.contractAddress;
const CHAIN = GENLAYER_CONFIG.chainId;

// Lazy client — avoids URL validation during build/SSR without real env vars
function getSupabase() {
  return createClient();
}

// ── Mirror organization to Supabase ───────────────────────────────────────────

export async function syncOrganization(
  org: ContractOrganization,
  txHash: string,
  ownerId: string,
) {
  const { error } = await getSupabase().from("organizations").upsert({
    onchain_id: org.id,
    contract_address: CONTRACT,
    chain_id: CHAIN,
    name: org.name,
    industry: org.industry,
    owner_id: ownerId,
    status: org.status,
    tx_hash: txHash,
    explorer_url: getTxExplorerUrl(txHash),
    sync_status: "synced",
    raw_contract_json: org,
    updated_at: new Date().toISOString(),
  }, { onConflict: "onchain_id" });

  if (error) {
    console.error("[syncOrganization] code:", error.code, "message:", error.message, "details:", error.details, "hint:", error.hint);
    throw new Error(`Supabase sync failed: ${error.message} (${error.code})`);
  }
}

// ── Mirror dataset to Supabase ─────────────────────────────────────────────────

export async function syncDataset(
  dataset: ContractDataset,
  txHash: string,
  supabaseOrgId: string,
) {
  const { error } = await getSupabase().from("datasets").upsert({
    onchain_id: dataset.id,
    org_id: supabaseOrgId,
    contract_address: CONTRACT,
    chain_id: CHAIN,
    name: dataset.name,
    source: dataset.source,
    schema_summary: dataset.schema_summary,
    metadata_hash: dataset.metadata_hash,
    status: dataset.status,
    tx_hash: txHash,
    explorer_url: getTxExplorerUrl(txHash),
    sync_status: "synced",
    raw_contract_json: dataset,
    updated_at: new Date().toISOString(),
  }, { onConflict: "onchain_id" });

  if (error) {
    console.error("[syncDataset] code:", error.code, "message:", error.message, "details:", error.details, "hint:", error.hint);
    throw new Error(`Dataset sync failed: ${error.message} (${error.code})`);
  }
}

// ── Mirror dashboard to Supabase ───────────────────────────────────────────────

export async function syncDashboard(
  dashboard: ContractDashboard,
  txHash: string,
  supabaseOrgId: string,
) {
  const { error } = await getSupabase().from("dashboards").upsert({
    onchain_id: dashboard.id,
    org_id: supabaseOrgId,
    contract_address: CONTRACT,
    chain_id: CHAIN,
    name: dashboard.name,
    report_type: dashboard.report_type,
    reporting_period: dashboard.reporting_period,
    metadata_hash: dashboard.metadata_hash,
    status: dashboard.status,
    tx_hash: txHash,
    explorer_url: getTxExplorerUrl(txHash),
    sync_status: "synced",
    raw_contract_json: dashboard,
    updated_at: new Date().toISOString(),
  }, { onConflict: "onchain_id" });

  if (error) {
    console.error("[syncDashboard] code:", error.code, "message:", error.message, "details:", error.details, "hint:", error.hint);
    throw new Error(`Dashboard sync failed: ${error.message} (${error.code})`);
  }
}

// ── Mirror audit request to Supabase ──────────────────────────────────────────

export async function syncInsightRequest(
  req: InsightAuditRequest,
  txHash: string,
  submitterId: string,
  supabaseOrgId: string,
) {
  const { error } = await getSupabase().from("insight_audit_requests").upsert({
    onchain_id: req.id,
    org_id: supabaseOrgId,
    contract_address: CONTRACT,
    chain_id: CHAIN,
    insight_text: req.insight_text,
    claim_hash: req.claim_hash,
    submitter_id: submitterId,
    status: req.status,
    tx_hash: txHash,
    explorer_url: getTxExplorerUrl(txHash),
    sync_status: "synced",
    raw_contract_json: req,
    updated_at: new Date().toISOString(),
  }, { onConflict: "onchain_id" });

  if (error) console.error("[syncInsightRequest]", error);
}

// ── Mirror decision to Supabase ────────────────────────────────────────────────

export async function syncDecision(decision: InsightDecision, supabaseRequestId: string) {
  const { error } = await getSupabase().from("insight_decisions").upsert({
    onchain_id: decision.id,
    request_id: supabaseRequestId,
    contract_address: CONTRACT,
    chain_id: CHAIN,
    verdict: decision.verdict,
    scores: decision.scores,
    findings: decision.findings,
    tx_hash: decision.tx_hash,
    explorer_url: getTxExplorerUrl(decision.tx_hash),
    adjudicated_at: new Date(decision.adjudicated_at * 1000).toISOString(),
    sync_status: "synced",
    raw_contract_json: decision,
    updated_at: new Date().toISOString(),
  }, { onConflict: "onchain_id" });

  if (error) console.error("[syncDecision]", error);
}

// ── Log audit event ────────────────────────────────────────────────────────────

export async function logAuditEvent(
  requestId: string,
  eventType: string,
  actor: string,
  payload: Record<string, unknown>,
  txHash: string,
) {
  const { error } = await getSupabase().from("audit_events").insert({
    request_id: requestId,
    event_type: eventType,
    actor,
    payload,
    tx_hash: txHash,
    explorer_url: getTxExplorerUrl(txHash),
    timestamp: new Date().toISOString(),
  });

  if (error) console.error("[logAuditEvent]", error);
}
