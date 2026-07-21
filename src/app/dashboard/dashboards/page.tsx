"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MonitorDot, Plus, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";
import { getDashboardsForOrganizations, getOrganizationsForWallet } from "@/lib/ordit/contractQueries";
import type { ContractDashboard } from "@/types";

export default function DashboardsPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState<ContractDashboard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (address?: string) => {
    setLoading(true);
    const connected = address ?? (await getConnectedWallet())?.address ?? null;
    setWallet(connected);
    if (connected) {
      const orgs = await getOrganizationsForWallet(connected);
      setDashboards(await getDashboardsForOrganizations(orgs.map((org) => org.id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  if (!wallet && !loading) {
    return (
      <Card className="max-w-lg">
        <Wallet className="w-8 h-8 text-teal-400 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Connect wallet</h1>
        <p className="text-sm text-slate-400 mb-5">Dashboards are read from organizations visible to your wallet.</p>
        <Button onClick={async () => load((await connectInjectedWallet()).address)}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboards & Reports</h1>
          <p className="text-sm text-slate-400">On-chain report contexts for audit submissions</p>
        </div>
        <Link href="/dashboard/dashboards/new">
          <Button><Plus className="w-4 h-4" /> Register Dashboard</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Reading contract state...</p>
      ) : !dashboards.length ? (
        <Card className="text-center py-16">
          <MonitorDot className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No dashboards registered yet.</p>
          <Link href="/dashboard/dashboards/new"><Button>Register your first dashboard</Button></Link>
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
              <p className="text-xs text-slate-500 mb-1">{d.report_type}</p>
              <p className="text-xs text-slate-600 mb-3">{d.reporting_period}</p>
              <span className="font-mono text-xs text-slate-600">{d.id}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
