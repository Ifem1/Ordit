export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { VerdictBadge } from "@/components/ui/Badge";
import ScoreGrid from "@/components/ordit/ScoreGrid";
import FindingsPanel from "@/components/ordit/FindingsPanel";
import TxLink from "@/components/ordit/TxLink";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Clock,
  GitMerge,
  Shield,
  FileText,
  CheckCircle,
  User,
} from "lucide-react";
import type { InsightScores, InsightFindings } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CaseFilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: req } = await supabase
    .from("insight_audit_requests")
    .select("*, organizations(name, industry)")
    .eq("id", id)
    .single();

  if (!req) notFound();

  const decision = req.findings && req.scores
    ? { verdict: req.verdict, scores: req.scores as InsightScores, findings: req.findings as InsightFindings }
    : null;

  const canHumanReview =
    req.status === "NEEDS_REVIEW" || (req.verdict === "NEEDS_REVISION" && req.status !== "ACTIVATED");
  const canActivate =
    req.verdict === "APPROVED" || req.verdict === "HUMAN_APPROVED";
  const isActivated = req.status === "ACTIVATED";

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <Link href="/insight" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to audits
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                <span className="font-mono">{req.onchain_id}</span>
                <span>·</span>
                <span>{(req.organizations as { name?: string } | null)?.name}</span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                <span>{new Date(req.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}</span>
              </div>
              <h1 className="text-xl font-bold text-white leading-snug">{req.insight_text}</h1>
            </div>
            {req.verdict && <VerdictBadge verdict={req.verdict} />}
          </div>
        </div>

        {/* GenLayer source badge */}
        <Card className="border-indigo-500/20 flex items-center gap-3 py-3">
          <GitMerge className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-sm text-slate-300">
            Verdict determined by <strong className="text-indigo-300">GenLayer consensus</strong> — not Supabase, not the frontend.
          </span>
          {req.tx_hash && (
            <div className="ml-auto">
              <TxLink txHash={req.tx_hash} explorerUrl={req.explorer_url} label="View on StudioNet" />
            </div>
          )}
        </Card>

        {/* Status timeline */}
        <div className="flex items-center gap-2 text-xs">
          {["PENDING", "ADJUDICATED", "ACTIVATED"].map((s, i) => {
            const active = req.status === s || (s === "ADJUDICATED" && req.status === "NEEDS_REVIEW");
            const past =
              (s === "PENDING" && req.status !== "PENDING") ||
              (s === "ADJUDICATED" && (req.status === "ACTIVATED" || req.status === "BLOCKED"));
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`h-px w-8 ${past ? "bg-indigo-500/50" : "bg-white/10"}`} />}
                <span
                  className={`px-2.5 py-1 rounded-full border ${
                    active
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : past
                      ? "text-slate-400 border-slate-700"
                      : "text-slate-600 border-slate-800"
                  }`}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>

        {/* Score grid */}
        {decision?.scores && (
          <Card>
            <h2 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Consensus Scores
            </h2>
            <ScoreGrid scores={decision.scores} />
          </Card>
        )}

        {/* Findings */}
        {decision?.findings && (
          <div>
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Audit Findings
            </h2>
            <FindingsPanel findings={decision.findings} />
          </div>
        )}

        {/* Submitted data */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-400 mb-4">Submitted Evidence</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Underlying Metrics</p>
              <p className="text-sm text-slate-300">{req.raw_contract_json?.metrics as string ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Assumptions</p>
              <p className="text-sm text-slate-300">{req.raw_contract_json?.assumptions as string ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Business Context</p>
              <p className="text-sm text-slate-300">{req.raw_contract_json?.business_context as string ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Claim Hash</p>
              <p className="text-xs font-mono text-slate-500">{req.claim_hash}</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        {(canHumanReview || canActivate) && !isActivated && (
          <Card className="border-amber-500/10">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Actions Available
            </h2>
            <div className="flex gap-3">
              {canHumanReview && (
                <Link href={`/review/${req.id}`}>
                  <Button variant="secondary">Submit Human Review</Button>
                </Link>
              )}
              {canActivate && (
                <Link href={`/case/${req.id}/activate`}>
                  <Button variant="teal">
                    <CheckCircle className="w-4 h-4" /> Activate Business Decision
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {isActivated && (
          <Card className="border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Business Decision Activated</p>
                <p className="text-xs text-slate-500">This insight has been approved and activated as a business decision.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Audit trail link */}
        <div className="flex justify-end">
          <Link href={`/audit/${req.id}`} className="text-sm text-slate-500 hover:text-indigo-300 transition-colors">
            View full audit trail →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
