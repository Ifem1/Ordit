export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileSearch, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { VerdictBadge } from "@/components/ui/Badge";
import TxLink from "@/components/ordit/TxLink";

export default async function InsightAuditListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: requests } = await supabase
    .from("insight_audit_requests")
    .select("*, organizations(name)")
    .eq("submitter_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Insight Audits</h1>
          <p className="text-sm text-slate-400">GenLayer consensus verification requests</p>
        </div>
        <Link href="/insight/new">
          <Button><Plus className="w-4 h-4" /> Submit Audit</Button>
        </Link>
      </div>

      {!requests?.length ? (
        <Card className="text-center py-16">
          <FileSearch className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No audit requests yet.</p>
          <Link href="/insight/new"><Button>Submit your first insight</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link key={req.id} href={`/case/${req.id}`}>
              <Card hover className="group">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                      {req.insight_text}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-500">
                        {(req.organizations as { name?: string } | null)?.name}
                      </span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-600">{new Date(req.created_at).toLocaleDateString()}</span>
                      {req.tx_hash && (
                        <>
                          <span className="text-xs text-slate-600">·</span>
                          <TxLink txHash={req.tx_hash} explorerUrl={req.explorer_url} />
                        </>
                      )}
                    </div>
                  </div>
                  {req.verdict ? (
                    <VerdictBadge verdict={req.verdict} />
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                      {req.status}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
