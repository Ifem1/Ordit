"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { VerdictBadge } from "@/components/ui/Badge";
import { humanReviewDecision } from "@/lib/genlayer/orditContract";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { createClient } from "@/lib/supabase/client";
import TxLink from "@/components/ordit/TxLink";
import { ShieldCheck, CheckCircle } from "lucide-react";

const VERDICTS = [
  { value: "APPROVED", label: "Approve", color: "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300" },
  { value: "NEEDS_REVISION", label: "Needs Revision", color: "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300" },
  { value: "REJECTED", label: "Reject", color: "border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300" },
] as const;

type ReviewVerdict = "APPROVED" | "NEEDS_REVISION" | "REJECTED";

export default function HumanReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [verdict, setVerdict] = useState<ReviewVerdict | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ tx_hash: string; explorer_url: string } | null>(null);

  const submit = async () => {
    if (!verdict) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const walletAddress = await getUserWalletAddress();

      const { data: req } = await supabase
        .from("insight_audit_requests")
        .select("onchain_id")
        .eq("id", id)
        .single();

      if (!req) throw new Error("Request not found");

      const res = await humanReviewDecision(
        {
          request_id: req.onchain_id,
          final_verdict: verdict as "APPROVED" | "UNSUPPORTED" | "NEEDS_REVISION",
          notes,
          review_evidence_hash: "",
          decided_at: new Date().toISOString(),
        },
        walletAddress,
      );
      setResult(res);

      // Mirror to Supabase
      await supabase.from("human_reviews").insert({
        request_id: id,
        reviewer_id: user.id,
        verdict,
        notes,
        tx_hash: res.tx_hash,
        explorer_url: res.explorer_url,
      });

      const newStatus = verdict === "APPROVED" ? "ADJUDICATED" : verdict === "REJECTED" ? "BLOCKED" : "NEEDS_REVIEW";
      const newVerdict = verdict === "APPROVED" ? "HUMAN_APPROVED" : verdict === "REJECTED" ? "HUMAN_REJECTED" : null;

      await supabase
        .from("insight_audit_requests")
        .update({
          status: newStatus,
          ...(newVerdict ? { verdict: newVerdict } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-1">Human Review</h1>
        <p className="text-sm text-slate-400 mb-6">
          Submit your review via <code className="text-indigo-400">human_review_decision</code> on the OrditContract.
        </p>

        {!result ? (
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <p className="text-sm font-medium text-white">Select your verdict</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {VERDICTS.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVerdict(v.value)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${v.color} ${
                    verdict === v.value ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-current" : ""
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {verdict && (
              <div className="mb-4">
                <VerdictBadge verdict={verdict} />
              </div>
            )}

            <Textarea
              label="Review Notes"
              placeholder="Explain your reasoning..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button
                loading={loading}
                disabled={!verdict}
                onClick={submit}
              >
                Submit Review
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center border-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Review Submitted</h2>
            <p className="text-slate-400 text-sm mb-4">Recorded on OrditContract.</p>
            <TxLink txHash={result.tx_hash} explorerUrl={result.explorer_url} label="View on StudioNet" className="justify-center mb-6" />
            <Button onClick={() => router.push(`/case/${id}`)}>Back to Case File</Button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
