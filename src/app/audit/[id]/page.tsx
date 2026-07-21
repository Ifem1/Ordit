export const dynamic = "force-dynamic";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { getAuditLog, getInsightRequest, getRequestAuditIndex } from "@/lib/genlayer/orditContract";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

const EVENT_LABELS: Record<string, string> = {
  ORGANIZATION_CREATED: "Organization created",
  DATASET_REGISTERED: "Dataset registered",
  DASHBOARD_REGISTERED: "Dashboard registered",
  INSIGHT_AUDIT_REQUEST_CREATED: "Insight submitted",
  GENLAYER_CONSENSUS_DECISION: "Consensus adjudication complete",
  HUMAN_REVIEW_DECISION: "Human review submitted",
  BUSINESS_DECISION_ACTIVATED: "Business decision activated",
  BUSINESS_DECISION_BLOCKED: "Business decision blocked",
  ORG_ROLE_ADDED: "Organization role added",
};

export default async function AuditTrailPage({ params }: Props) {
  const { id } = await params;
  const req = await getInsightRequest(id);
  const auditIds = await getRequestAuditIndex(id);
  const events = await Promise.all(auditIds.map((auditId) => getAuditLog(auditId)));

  return (
    <AppShell>
      <div className="max-w-3xl">
        <Link href={`/case/${id}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Case File
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            Audit Trail
          </h1>
          <p className="text-sm text-slate-400 truncate">{req.insight_text || "Contract audit trail"}</p>
          <p className="text-xs font-mono text-slate-600 mt-1">{id}</p>
        </div>

        {!events.length ? (
          <Card className="text-center py-10">
            <p className="text-slate-400 text-sm">No audit events recorded yet.</p>
          </Card>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/10" />
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-indigo-500" style={{ background: i === events.length - 1 ? "#6366f1" : "#1e1a52" }} />
                  <Card className="ml-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{EVENT_LABELS[event.event_type] ?? event.event_type}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {event.timestamp ? new Date(event.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "On-chain"}
                          {" · "}<span className="font-mono">{event.actor?.slice(0, 10)}</span>
                        </p>
                        {event.payload && Object.keys(event.payload).length > 0 && (
                          <pre className="mt-2 text-xs font-mono text-slate-400 overflow-auto">{JSON.stringify(event.payload, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
