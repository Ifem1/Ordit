import {
  parseOrganization,
  parseDataset,
  parseDashboard,
  parseInsightRequest,
  parseDecision,
  parseScores,
  parseFindings,
  parseAuditLog,
} from "@/lib/genlayer/parsers";

describe("parseOrganization", () => {
  it("parses a full organization object", () => {
    const raw = {
      id: "orgs_000001",
      name: "Acme Corp",
      industry: "Finance",
      metadata_hash: "0xabc123",
      owner: "0xuser1",
      status: "ACTIVE",
      created_at: 1700000000,
    };
    const result = parseOrganization(raw);
    expect(result.id).toBe("orgs_000001");
    expect(result.name).toBe("Acme Corp");
    expect(result.status).toBe("ACTIVE");
  });

  it("handles missing fields gracefully", () => {
    const result = parseOrganization({});
    expect(result.id).toBe("");
    expect(result.name).toBe("");
    expect(result.status).toBe("ACTIVE");
  });

  it("uses org_id if id is missing", () => {
    const result = parseOrganization({ org_id: "orgs_000002" });
    expect(result.id).toBe("orgs_000002");
  });
});

describe("parseDataset", () => {
  it("parses a full dataset object", () => {
    const raw = {
      id: "datasets_000001",
      org_id: "orgs_000001",
      name: "Q3 Sales",
      source: "Salesforce",
      schema_summary: "Revenue, units sold, region",
      metadata_hash: "0xdef456",
      status: "ACTIVE",
      created_at: 1700000001,
    };
    const result = parseDataset(raw);
    expect(result.id).toBe("datasets_000001");
    expect(result.name).toBe("Q3 Sales");
    expect(result.source).toBe("Salesforce");
  });
});

describe("parseScores", () => {
  it("parses all 8 score dimensions", () => {
    const raw = {
      evidence_support_score: 85,
      statistical_confidence_score: 70,
      explainability_score: 90,
      narrative_accuracy_score: 80,
      business_impact_score: 75,
      hallucination_risk_score: 15,
      completeness_score: 88,
      confidence_score: 82,
    };
    const result = parseScores(raw);
    expect(result.evidence_support_score).toBe(85);
    expect(result.hallucination_risk_score).toBe(15);
    expect(result.confidence_score).toBe(82);
  });

  it("defaults to 0 for missing scores", () => {
    const result = parseScores({});
    expect(result.evidence_support_score).toBe(0);
    expect(result.confidence_score).toBe(0);
  });
});

describe("parseFindings", () => {
  it("parses all finding arrays", () => {
    const raw = {
      supported_claims: ["Revenue grew 18% YoY"],
      unsupported_claims: ["Market share increased"],
      missing_context: ["CAC not provided"],
      misleading_statements: [],
      contradictions: [],
      risks: ["Seasonal adjustment missing"],
      recommendations: ["Add CAC data"],
      required_changes: ["Revise market share claim"],
      rationale: "The insight overstates market position.",
      audit_summary: "Mostly supported but market share claim is unsupported.",
    };
    const result = parseFindings(raw);
    expect(result.supported_claims).toHaveLength(1);
    expect(result.unsupported_claims).toHaveLength(1);
    expect(result.risks).toHaveLength(1);
    expect(result.rationale).toContain("overstates");
  });

  it("defaults arrays to empty", () => {
    const result = parseFindings({});
    expect(result.supported_claims).toEqual([]);
    expect(result.recommendations).toEqual([]);
    expect(result.rationale).toBe("");
  });
});

describe("parseDecision", () => {
  it("parses a verdict correctly", () => {
    const raw = {
      id: "decisions_000001",
      request_id: "requests_000001",
      verdict: "APPROVED",
      scores: { evidence_support_score: 90, confidence_score: 85 },
      findings: { rationale: "Well supported", audit_summary: "Approved" },
      adjudicated_at: 1700000100,
      tx_hash: "0xabc",
    };
    const result = parseDecision(raw);
    expect(result.verdict).toBe("APPROVED");
    expect(result.scores.evidence_support_score).toBe(90);
  });

  it("defaults verdict to PENDING", () => {
    const result = parseDecision({});
    expect(result.verdict).toBe("PENDING");
  });
});

describe("parseAuditLog", () => {
  it("parses audit log entry", () => {
    const raw = {
      id: "audit_entries_000001",
      request_id: "requests_000001",
      event_type: "INSIGHT_ADJUDICATED",
      actor: "0xuser1",
      payload: { verdict: "APPROVED" },
      tx_hash: "0xabc123",
      timestamp: 1700000200,
    };
    const result = parseAuditLog(raw);
    expect(result.event_type).toBe("INSIGHT_ADJUDICATED");
    expect(result.actor).toBe("0xuser1");
    expect(result.payload).toEqual({ verdict: "APPROVED" });
  });
});
