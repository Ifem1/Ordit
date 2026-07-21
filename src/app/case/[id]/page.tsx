"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { VerdictBadge } from "@/components/ui/Badge";
import ScoreGrid from "@/components/ordit/ScoreGrid";
import FindingsPanel from "@/components/ordit/FindingsPanel";
import Button from "@/components/ui/Button";
import { getInsightRequest, getLatestDecisionForRequest, getOrganization } from "@/lib/genlayer/orditContract";
import { ArrowLeft, Clock, GitMerge, Shield, FileText, CheckCircle, User, Link2 } from "lucide-react";
import type { ContractOrganization, InsightAuditRequest, InsightDecision } from "@/types";

export default function CaseFilePage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<InsightAuditRequest | null>(null);
  const [decision, setDecision] = useState<InsightDecision | null>(null);
  const [org, setOrg] = useState<ContractOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const req = await getInsightRequest(id);
        if (!req.id) throw new Error("Case not found on contract");
        const [orgData, decisionData] = await Promise.all([
          getOrganization(req.org_id),
          getLatestDecisionForRequest(req.id),
        ]);
        setRequest(req);
        setOrg(orgData.id ? orgData : null);
        setDecision(decisionData.id ? decisionData : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read case");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <AppShell><p className="text-slate-500 text-sm">Reading case from contract...</p></AppShell>;
  }

  if (error || !request) {
    return <AppShell><Card className="text-red-300 text-sm">{error ?? "Case not found"}</Card></AppShell>;
  }

  const canHumanReview = request.status === "NEEDS_REVIEW" || request.status === "NEEDS_REVISION";
  const canActivate = request.status === "APPROVED";
  const isActivated = request.status === "ACTIVATED";

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <Link href="/insight" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to audits
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                <span className="font-mono">{request.id}</span>
                <span>{org?.name}</span>
                <Clock className="w-3 h-3" />
                <span>{request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() : "On-chain"}</span>
              </div>
              <h1 className="text-xl font-bold text-white leading-snug">{request.insight_text}</h1>
            </div>
            {decision?.verdict && <VerdictBadge verdict={decision.verdict} />}
          </div>
        </div>

        <Card className="border-indigo-500/20 flex items-center gap-3 py-3">
          <GitMerge className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-sm text-slate-300">
            Verdict determined by GenLayer validators using contract state and fetched evidence sources.
          </span>
        </Card>

        <div className="flex items-center gap-2 text-xs">
          {["PENDING", "APPROVED", "ACTIVATED"].map((s, i) => {
            const active = request.status === s || (s === "APPROVED" && ["NEEDS_REVIEW", "NEEDS_REVISION", "UNSUPPORTED"].includes(request.status));
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="h-px w-8 bg-white/10" />}
                <span className={`px-2.5 py-1 rounded-full border ${active ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "text-slate-600 border-slate-800"}`}>{s}</span>
              </div>
            );
          })}
        </div>

        {decision?.scores && (
          <Card>
            <h2 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Consensus Scores
            </h2>
            <ScoreGrid scores={decision.scores} />
          </Card>
        )}

        {decision?.findings && (
          <div>
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Audit Findings
            </h2>
            <FindingsPanel findings={decision.findings} />
          </div>
        )}

        {decision?.findings && (
          <Card>
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-teal-400" />
              Evidence Review
            </h2>
            <p className="text-sm text-slate-300 mb-4">{decision.findings.evidence_quality || "No evidence quality note returned."}</p>
            <div className="space-y-3">
              {decision.findings.cited_sources.map((source) => (
                <a key={source} href={source} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-300 hover:text-indigo-200 break-all">
                  {source}
                </a>
              ))}
              {decision.findings.evidence_gaps.map((gap) => (
                <p key={gap} className="text-xs text-amber-300">{gap}</p>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h2 className="text-sm font-semibold text-slate-400 mb-4">Submitted Claim</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Claim Hash</p>
              <p className="text-xs font-mono text-slate-500">{request.claim_hash}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Dataset</p>
              <p className="text-xs font-mono text-slate-500">{request.dataset_id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Dashboard</p>
              <p className="text-xs font-mono text-slate-500">{request.dashboard_id}</p>
            </div>
          </div>
        </Card>

        {(canHumanReview || canActivate) && !isActivated && (
          <Card className="border-amber-500/10">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Actions Available
            </h2>
            <div className="flex gap-3">
              {canHumanReview && <Link href={`/review/${request.id}`}><Button variant="secondary">Submit Human Review</Button></Link>}
              {canActivate && <Link href={`/case/${request.id}/activate`}><Button variant="teal"><CheckCircle className="w-4 h-4" /> Activate Business Decision</Button></Link>}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
