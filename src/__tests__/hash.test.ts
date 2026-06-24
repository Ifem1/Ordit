import { buildClaimPacket, hashClaimPacket } from "@/lib/ordit/hash";

const sampleForm = {
  org_id: "orgs_000001",
  dataset_id: "datasets_000001",
  dashboard_id: "dashboards_000001",
  insight_text: "Revenue grew 18% driven by enterprise segment expansion",
  metrics: "Revenue: $4.2M, Growth: 18%, Enterprise: 62% of revenue",
  assumptions: "CAC based on last 90 days",
  business_context: "Q4 budget allocation decision",
};

describe("buildClaimPacket", () => {
  it("builds a deterministic packet", () => {
    const packet = buildClaimPacket(sampleForm, "fixed-nonce");
    expect(packet.org_id).toBe("orgs_000001");
    expect(packet.insight_text).toBe("Revenue grew 18% driven by enterprise segment expansion");
    expect(packet.nonce).toBe("fixed-nonce");
  });

  it("trims whitespace from text fields", () => {
    const packet = buildClaimPacket(
      { ...sampleForm, insight_text: "  Revenue grew  " },
      "nonce",
    );
    expect(packet.insight_text).toBe("Revenue grew");
  });
});

describe("hashClaimPacket", () => {
  it("produces a hex string starting with 0x", async () => {
    const packet = buildClaimPacket(sampleForm, "test-nonce");
    const hash = await hashClaimPacket(packet);
    expect(hash).toMatch(/^0x[0-9a-f]+$/);
  });

  it("is deterministic for the same input", async () => {
    const packet = buildClaimPacket(sampleForm, "test-nonce");
    const hash1 = await hashClaimPacket(packet);
    const hash2 = await hashClaimPacket(packet);
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different insights", async () => {
    const p1 = buildClaimPacket(sampleForm, "nonce1");
    const p2 = buildClaimPacket({ ...sampleForm, insight_text: "Different insight" }, "nonce1");
    const h1 = await hashClaimPacket(p1);
    const h2 = await hashClaimPacket(p2);
    expect(h1).not.toBe(h2);
  });

  it("produces a 66-character hash (0x + 64 hex chars)", async () => {
    const packet = buildClaimPacket(sampleForm, "nonce");
    const hash = await hashClaimPacket(packet);
    expect(hash).toHaveLength(66);
  });
});
