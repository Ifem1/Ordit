export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MonitorDot, Plus, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: dashboards } = await supabase
    .from("dashboards")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboards & Reports</h1>
          <p className="text-sm text-slate-400">Registered dashboard contexts for audit submissions</p>
        </div>
        <Link href="/dashboard/dashboards/new">
          <Button><Plus className="w-4 h-4" /> Register Dashboard</Button>
        </Link>
      </div>

      {!dashboards?.length ? (
        <Card className="text-center py-16">
          <MonitorDot className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No dashboards registered yet.</p>
          <Link href="/dashboard/dashboards/new">
            <Button>Register your first dashboard</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboards.map((d) => (
            <Card key={d.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <MonitorDot className="w-4 h-4 text-purple-400" />
                </div>
                <Badge variant={d.status === "ACTIVE" ? "success" : "muted"}>{d.status}</Badge>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{d.name}</h3>
              <p className="text-xs text-slate-500 mb-1">
                {(d.organizations as { name?: string } | null)?.name} · {d.report_type}
              </p>
              <p className="text-xs text-slate-600 mb-3">{d.reporting_period}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-mono">{d.onchain_id}</span>
                {d.explorer_url && (
                  <a href={d.explorer_url} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-400">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
