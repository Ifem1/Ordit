"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Database, MonitorDot, FileSearch, ArrowRight, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { VerdictBadge } from "@/components/ui/Badge";
import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";
import {
  getDashboardsForOrganizations,
  getDatasetsForOrganizations,
  getOrganizationsForWallet,
  getRequestsForOrganizations,
} from "@/lib/ordit/contractQueries";
import type { ContractDashboard, ContractDataset, ContractOrganization, InsightAuditRequest, InsightDecision } from "@/types";

type RequestWithDecision = InsightAuditRequest & { decision?: InsightDecision };

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<ContractOrganization[]>([]);
  const [datasets, setDatasets] = useState<ContractDataset[]>([]);
  const [dashboards, setDashboards] = useState<ContractDashboard[]>([]);
  const [requests, setRequests] = useState<RequestWithDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (address?: string) => {
    setLoading(true);
    setError(null);
    try {
      const connected = address ?? (await getConnectedWallet())?.address ?? null;
      setWallet(connected);
      if (!connected) return;
      const ownedOrgs = await getOrganizationsForWallet(connected);
      const orgIds = ownedOrgs.map((org) => org.id);
      const [orgDatasets, orgDashboards, orgRequests] = await Promise.all([
        getDatasetsForOrganizations(orgIds),
        getDashboardsForOrganizations(orgIds),
        getRequestsForOrganizations(orgIds),
      ]);
      setOrgs(ownedOrgs);
      setDatasets(orgDatasets);
      setDashboards(orgDashboards);
      setRequests(orgRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read contract state");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const stats = [
    { label: "Organizations", value: orgs.length, icon: Building2, href: "/organization", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Datasets", value: datasets.length, icon: Database, href: "/dataset", color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Dashboards", value: dashboards.length, icon: MonitorDot, href: "/dashboard/dashboards", color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Audit Requests", value: requests.length, icon: FileSearch, href: "/insight", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  if (!wallet && !loading) {
    return (
      <Card className="max-w-lg">
        <Wallet className="w-8 h-8 text-teal-400 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Connect wallet</h1>
        <p className="text-sm text-slate-400 mb-5">
          Ordit reads your organizations, audits, and verdicts directly from the GenLayer contract.
        </p>
        <Button onClick={async () => load((await connectInjectedWallet()).address)}>
          <Wallet className="w-4 h-4" />
          Connect Rabby / MetaMask
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Contract-backed GenLayer verification overview</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card hover className="flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{loading ? "..." : s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/organization/new", icon: Building2, title: "New Organization", sub: "Register on-chain", color: "text-indigo-400", bg: "bg-indigo-500/15" },
          { href: "/dataset/new", icon: Database, title: "Register Dataset", sub: "Anchor source context", color: "text-teal-400", bg: "bg-teal-500/15" },
          { href: "/insight/new", icon: FileSearch, title: "Submit Audit", sub: "Validators fetch evidence", color: "text-purple-400", bg: "bg-purple-500/15" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card hover className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Recent Audit Requests</h2>
          <Link href="/insight" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            View all
          </Link>
        </div>
        {!requests.length ? (
          <div className="text-center py-10 text-slate-500">
            <FileSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No audit requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((req) => (
              <Link key={req.id} href={`/case/${req.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">{req.insight_text}</p>
                    <p className="text-xs text-slate-600 mt-1 font-mono">{req.id}</p>
                  </div>
                  {req.decision?.verdict ? <VerdictBadge verdict={req.decision.verdict} /> : <span className="text-xs text-slate-500">{req.status}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
