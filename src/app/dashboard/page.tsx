export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Database,
  MonitorDot,
  FileSearch,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { VerdictBadge } from "@/components/ui/Badge";
import TxLink from "@/components/ordit/TxLink";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Fetch summary counts
  const [
    { count: orgCount },
    { count: datasetCount },
    { count: dashboardCount },
    { count: requestCount },
    { data: recentRequests },
  ] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
    supabase.from("datasets").select("*", { count: "exact", head: true }),
    supabase.from("dashboards").select("*", { count: "exact", head: true }),
    supabase.from("insight_audit_requests").select("*", { count: "exact", head: true }).eq("submitter_id", user.id),
    supabase
      .from("insight_audit_requests")
      .select("id, insight_text, status, verdict, tx_hash, explorer_url, created_at")
      .eq("submitter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Organizations", value: orgCount ?? 0, icon: Building2, href: "/organization", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Datasets", value: datasetCount ?? 0, icon: Database, href: "/dataset", color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Dashboards", value: dashboardCount ?? 0, icon: MonitorDot, href: "/dashboard/dashboards", color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Audit Requests", value: requestCount ?? 0, icon: FileSearch, href: "/insight", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">
          GenLayer consensus verification overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card hover className="flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/organization/new">
          <Card hover className="flex items-center gap-3 border-indigo-500/10 hover:border-indigo-500/30">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">New Organization</div>
              <div className="text-xs text-slate-500">Register on-chain</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </Card>
        </Link>
        <Link href="/dataset/new">
          <Card hover className="flex items-center gap-3 border-teal-500/10 hover:border-teal-500/30">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Database className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Register Dataset</div>
              <div className="text-xs text-slate-500">Upload & register</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </Card>
        </Link>
        <Link href="/insight/new">
          <Card hover className="flex items-center gap-3 border-purple-500/10 hover:border-purple-500/30">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Submit Audit</div>
              <div className="text-xs text-slate-500">Run consensus</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </Card>
        </Link>
      </div>

      {/* Recent audit requests */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Recent Audit Requests</h2>
          <Link href="/insight" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            View all →
          </Link>
        </div>

        {!recentRequests?.length ? (
          <div className="text-center py-10 text-slate-500">
            <FileSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No audit requests yet.</p>
            <Link href="/insight/new">
              <button className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
                Submit your first insight →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <Link key={req.id} href={`/case/${req.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                      {req.insight_text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {req.tx_hash && (
                        <TxLink txHash={req.tx_hash} explorerUrl={req.explorer_url} />
                      )}
                      <span className="text-xs text-slate-600">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {req.verdict ? (
                    <VerdictBadge verdict={req.verdict} />
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3 animate-pulse" /> Pending
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
