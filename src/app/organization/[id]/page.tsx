"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getDashboardsForOrganizations, getDatasetsForOrganizations, getRequestsForOrganizations } from "@/lib/ordit/contractQueries";
import { getOrganization } from "@/lib/genlayer/orditContract";
import { Building2, Database, MonitorDot, FileSearch, Plus, ArrowLeft } from "lucide-react";
import type { ContractDashboard, ContractDataset, ContractOrganization, InsightAuditRequest, InsightDecision } from "@/types";

type RequestWithDecision = InsightAuditRequest & { decision?: InsightDecision };

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [org, setOrg] = useState<ContractOrganization | null>(null);
  const [datasets, setDatasets] = useState<ContractDataset[]>([]);
  const [dashboards, setDashboards] = useState<ContractDashboard[]>([]);
  const [requests, setRequests] = useState<RequestWithDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [orgData, ds, db, req] = await Promise.all([
        getOrganization(id),
        getDatasetsForOrganizations([id]),
        getDashboardsForOrganizations([id]),
        getRequestsForOrganizations([id]),
      ]);
      setOrg(orgData.id ? orgData : null);
      setDatasets(ds);
      setDashboards(db);
      setRequests(req);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <AppShell><p className="text-slate-500 text-sm">Reading organization from contract...</p></AppShell>;
  }

  if (!org) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">Organization not found on contract.</p>
          <Button onClick={() => router.push("/organization")}>Back to Organizations</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => router.push("/organization")} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3">
              <ArrowLeft className="w-3 h-3" /> Organizations
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{org.name}</h1>
                <p className="text-sm text-slate-400">{org.industry}</p>
              </div>
            </div>
          </div>
          <Badge variant={org.status === "ACTIVE" ? "success" : "muted"}>{org.status}</Badge>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Contract ID</label>
              <p className="text-sm text-slate-300 font-mono mt-1 truncate">{org.id}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Owner</label>
              <p className="text-sm text-slate-300 font-mono mt-1 truncate">{org.owner}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Metadata Hash</label>
              <p className="text-sm text-slate-300 font-mono mt-1 truncate">{org.metadata_hash || "N/A"}</p>
            </div>
          </div>
        </Card>

        {[
          { title: "Datasets", icon: Database, items: datasets, href: "/dataset/new", empty: "No datasets registered yet." },
          { title: "Dashboards", icon: MonitorDot, items: dashboards, href: "/dashboard/dashboards/new", empty: "No dashboards registered yet." },
          { title: "Recent Audit Requests", icon: FileSearch, items: requests, href: "/insight/new", empty: "No audit requests yet." },
        ].map((section) => (
          <div key={section.title}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <section.icon className="w-4 h-4 text-teal-400" /> {section.title}
                <span className="text-sm font-normal text-slate-500">({section.items.length})</span>
              </h2>
              <Link href={section.href}><Button size="sm" variant="ghost"><Plus className="w-3 h-3" /> Add</Button></Link>
            </div>
            {section.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <Card key={item.id} className="py-3 px-4">
                    <p className="text-sm font-medium text-white truncate">
                      {"insight_text" in item ? item.insight_text : item.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{item.id}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8 text-slate-500 text-sm">{section.empty}</Card>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
