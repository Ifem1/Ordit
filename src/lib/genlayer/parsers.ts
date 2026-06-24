import type {
  ContractOrganization,
  ContractDataset,
  ContractDashboard,
  InsightAuditRequest,
  InsightDecision,
  AuditLogEntry,
} from "./types";
import type { InsightScores, InsightFindings, Verdict } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

// The new contract stores all values as JSON strings in TreeMap.
// GenLayer may return the raw JSON string as the result — parse it first.
function toRaw(result: unknown): Raw {
  if (result === null || result === undefined) return {};
  if (typeof result === "string") {
    if (result.trim() === "") return {};
    try {
      return JSON.parse(result) as Raw;
    } catch {
      return {};
    }
  }
  if (typeof result === "object") return result as Raw;
  return {};
}

// Pipe-separated index string → string array
export function parseIndex(result: unknown): string[] {
  if (typeof result === "string") {
    return result.trim() === "" ? [] : result.split("|").filter(Boolean);
  }
  if (Array.isArray(result)) return result.map(String);
  return [];
}

export function parseOrganization(result: unknown): ContractOrganization {
  const raw = toRaw(result);
  return {
    id: String(raw.org_id ?? raw.id ?? ""),
    name: String(raw.name ?? ""),
    industry: String(raw.industry ?? ""),
    metadata_hash: String(raw.metadata_hash ?? ""),
    owner: String(raw.owner ?? ""),
    status: raw.status ?? "ACTIVE",
    created_at: Number(raw.created_at ?? 0),
  };
}

export function parseDataset(result: unknown): ContractDataset {
  const raw = toRaw(result);
  return {
    id: String(raw.dataset_id ?? raw.id ?? ""),
    org_id: String(raw.org_id ?? ""),
    name: String(raw.name ?? ""),
    source: String(raw.source ?? ""),
    schema_summary: String(raw.schema_summary ?? ""),
    metadata_hash: String(raw.metadata_hash ?? ""),
    status: raw.status ?? "ACTIVE",
    created_at: Number(raw.created_at ?? 0),
  };
}

export function parseDashboard(result: unknown): ContractDashboard {
  const raw = toRaw(result);
  return {
    id: String(raw.dashboard_id ?? raw.id ?? ""),
    org_id: String(raw.org_id ?? ""),
    name: String(raw.name ?? ""),
    report_type: String(raw.report_type ?? ""),
    reporting_period: String(raw.reporting_period ?? ""),
    metadata_hash: String(raw.metadata_hash ?? ""),
    status: raw.status ?? "ACTIVE",
    created_at: Number(raw.created_at ?? 0),
  };
}

export function parseInsightRequest(result: unknown): InsightAuditRequest {
  const raw = toRaw(result);
  return {
    id: String(raw.request_id ?? raw.id ?? ""),
    org_id: String(raw.org_id ?? ""),
    dataset_id: String(raw.dataset_id ?? ""),
    dashboard_id: String(raw.dashboard_id ?? ""),
    insight_text: String(raw.insight_text ?? ""),
    claim_hash: String(raw.claim_hash ?? ""),
    submitter: String(raw.submitted_by ?? raw.submitter ?? ""),
    status: raw.status ?? "PENDING",
    submitted_at: Number(raw.submitted_at ?? 0),
  };
}

export function parseScores(raw: Raw): InsightScores {
  // New contract uses short field names (no _score suffix)
  return {
    evidence_support_score: Number(raw.evidence_support ?? raw.evidence_support_score ?? 0),
    statistical_confidence_score: Number(raw.statistical_confidence ?? raw.statistical_confidence_score ?? 0),
    explainability_score: Number(raw.explainability ?? raw.explainability_score ?? 0),
    narrative_accuracy_score: Number(raw.narrative_accuracy ?? raw.narrative_accuracy_score ?? 0),
    business_impact_score: Number(raw.business_impact ?? raw.business_impact_score ?? 0),
    hallucination_risk_score: Number(raw.hallucination_risk ?? raw.hallucination_risk_score ?? 0),
    completeness_score: Number(raw.completeness ?? raw.completeness_score ?? 0),
    confidence_score: Number(raw.confidence ?? raw.confidence_score ?? 0),
  };
}

export function parseFindings(raw: Raw): InsightFindings {
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
  return {
    supported_claims: arr(raw.supported_claims),
    unsupported_claims: arr(raw.unsupported_claims),
    missing_context: arr(raw.missing_context),
    misleading_statements: arr(raw.misleading_statements),
    contradictions: arr(raw.contradictions ?? []),
    risks: arr(raw.risks),
    recommendations: arr(raw.recommendations),
    required_changes: arr(raw.required_changes),
    rationale: String(raw.rationale ?? ""),
    audit_summary: String(raw.audit_summary ?? ""),
  };
}

export function parseDecision(result: unknown): InsightDecision {
  const raw = toRaw(result);
  const scoresRaw = typeof raw.scores === "object" && raw.scores !== null ? raw.scores as Raw : raw;
  const findingsRaw = typeof raw.findings === "object" && raw.findings !== null ? raw.findings as Raw : raw;
  return {
    id: String(raw.decision_id ?? raw.id ?? ""),
    request_id: String(raw.request_id ?? ""),
    verdict: (raw.verdict ?? "PENDING") as Verdict,
    scores: parseScores(scoresRaw),
    findings: parseFindings(findingsRaw),
    adjudicated_at: Number(raw.adjudicated_at ?? 0),
    tx_hash: String(raw.tx_hash ?? ""),
  };
}

export function parseAuditLog(result: unknown): AuditLogEntry {
  const raw = toRaw(result);
  return {
    id: String(raw.audit_id ?? raw.id ?? ""),
    request_id: String(raw.request_id ?? ""),
    event_type: String(raw.event_type ?? ""),
    actor: String(raw.actor ?? ""),
    payload: { summary: raw.summary ?? "", data_hash: raw.data_hash ?? "" },
    tx_hash: String(raw.tx_hash ?? raw.data_hash ?? ""),
    timestamp: Number(raw.created_at ?? raw.timestamp ?? 0),
  };
}
