import type { SubmitInsightAuditForm } from "@/types";

// Deterministic claim packet hashing using SubtleCrypto (browser) or node crypto

export interface ClaimPacketInput {
  org_id: string;
  dataset_id: string;
  dashboard_id: string;
  insight_text: string;
  metrics: string;
  assumptions: string;
  business_context: string;
  evidence_manifest?: string;
  nonce: string;
}

export function buildClaimPacket(
  form: SubmitInsightAuditForm & { evidence_manifest?: string },
  nonce?: string,
): ClaimPacketInput {
  return {
    org_id: form.org_id,
    dataset_id: form.dataset_id,
    dashboard_id: form.dashboard_id,
    insight_text: form.insight_text.trim(),
    metrics: form.metrics.trim(),
    assumptions: form.assumptions.trim(),
    business_context: form.business_context.trim(),
    evidence_manifest: form.evidence_manifest ?? "",
    nonce: nonce ?? Date.now().toString(),
  };
}

export async function hashClaimPacket(packet: ClaimPacketInput): Promise<string> {
  const canonical = JSON.stringify(packet, Object.keys(packet).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);

  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Server-side fallback using node:crypto
  const { createHash } = await import("node:crypto");
  return "0x" + createHash("sha256").update(canonical).digest("hex");
}
