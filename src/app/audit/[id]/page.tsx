export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import TxLink from "@/components/ordit/TxLink";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

const EVENT_LABELS: Record<string, string> = {
  ORGANIZATION_CREATED: "Organization created",
  DATASET_REGISTERED: "Dataset registered",
  DASHBOARD_REGISTERED: "Dashboard registered",
  INSIGHT_SUBMITTED: "Insight submitted",
  INSIGHT_ADJUDICATED: "Consensus adjudication complete",
  HUMAN_REVIEW_SUBMITTED: "Human review submitted",
  BUSINESS_DECISION_ACTIVATED: "Business decision activated",
  BUSINESS_DECISION_BLOCKED: "Business decision blocked",
  ROLE_ADDED: "Organization role added",
};

export default async function AuditTrailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: req } = await supabase
    .from("insight_audit_requests")
    .select("insight_text, onchain_id")
    .eq("id", id)
    .single();

  if (!req) notFound();

  const { data: events } = await supabase
    .from("audit_events")
    .select("*")
    .eq("request_id", id)
    .order("timestamp", { ascending: true });

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
          <p className="text-sm text-slate-400 truncate">{req.insight_text}</p>
          <p className="text-xs font-mono text-slate-600 mt-1">{req.onchain_id}</p>
        </div>

        {!events?.length ? (
          <Card className="text-center py-10">
            <p className="text-slate-400 text-sm">No audit events recorded yet.</p>
          </Card>
        ) : (
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/10" />

            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-indigo-500"
                    style={{ background: i === events.length - 1 ? "#6366f1" : "#1e1a52" }}
                  />

                  <Card className="ml-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {EVENT_LABELS[event.event_type] ?? event.event_type}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(event.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                          {" · "}<span className="font-mono">{event.actor?.slice(0, 8)}…</span>
                        </p>
                        {event.payload && Object.keys(event.payload).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300">
                              Event payload
                            </summary>
                            <pre className="mt-2 text-xs font-mono text-slate-400 overflow-auto">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      {event.tx_hash && (
                        <TxLink txHash={event.tx_hash} explorerUrl={event.explorer_url} />
                      )}
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
