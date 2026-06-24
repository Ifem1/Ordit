"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  Database,
  MonitorDot,
  FileSearch,
  ExternalLink,
  Plus,
  ArrowLeft,
} from "lucide-react";

interface Org {
  id: string;
  onchain_id: string;
  name: string;
  industry: string;
  status: string;
  tx_hash: string;
  explorer_url: string;
  created_at: string;
}

interface Dataset {
  id: string;
  name: string;
  source: string;
  onchain_id: string;
}

interface Dashboard {
  id: string;
  name: string;
  report_type: string;
  onchain_id: string;
}

interface AuditRequest {
  id: string;
  onchain_id: string;
  insight_text: string;
  status: string;
  verdict: string | null;
  created_at: string;
}

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [org, setOrg] = useState<Org | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (!orgData) {
        setLoading(false);
        return;
      }

      setOrg(orgData as Org);

      const [dsRes, dbRes, reqRes] = await Promise.all([
        supabase.from("datasets").select("id, name, source, onchain_id").eq("org_id", id),
        supabase.from("dashboards").select("id, name, report_type, onchain_id").eq("org_id", id),
        supabase
          .from("insight_audit_requests")
          .select("id, onchain_id, insight_text, status, verdict, created_at")
          .eq("org_id", id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setDatasets((dsRes.data as Dataset[]) ?? []);
      setDashboards((dbRes.data as Dashboard[]) ?? []);
      setRequests((reqRes.data as AuditRequest[]) ?? []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </AppShell>
    );
  }

  if (!org) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-slate-400 mb-4">Organization not found.</p>
          <Button onClick={() => router.push("/organization")}>Back to Organizations</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push("/organization")}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
            >
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

        {/* Info card */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">On-Chain ID</label>
              <p className="text-sm text-slate-300 font-mono mt-1 truncate">{org.onchain_id}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Transaction</label>
              <p className="text-sm mt-1">
                {org.explorer_url ? (
                  <a
                    href={org.explorer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    View on Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500 font-mono truncate">{org.tx_hash || "N/A"}</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Created</label>
              <p className="text-sm text-slate-300 mt-1">
                {new Date(org.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Datasets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-400" /> Datasets
              <span className="text-sm font-normal text-slate-500">({datasets.length})</span>
            </h2>
            <Link href="/dataset/new">
              <Button size="sm" variant="ghost"><Plus className="w-3 h-3" /> Add</Button>
            </Link>
          </div>
          {datasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {datasets.map((ds) => (
                <Card key={ds.id} className="py-3 px-4">
                  <p className="text-sm font-medium text-white">{ds.name}</p>
                  <p className="text-xs text-slate-500">{ds.source}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 text-slate-500 text-sm">No datasets registered yet.</Card>
          )}
        </div>

        {/* Dashboards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MonitorDot className="w-4 h-4 text-purple-400" /> Dashboards
              <span className="text-sm font-normal text-slate-500">({dashboards.length})</span>
            </h2>
            <Link href="/dashboard/dashboards/new">
              <Button size="sm" variant="ghost"><Plus className="w-3 h-3" /> Add</Button>
            </Link>
          </div>
          {dashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dashboards.map((db) => (
                <Card key={db.id} className="py-3 px-4">
                  <p className="text-sm font-medium text-white">{db.name}</p>
                  <p className="text-xs text-slate-500">{db.report_type}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 text-slate-500 text-sm">No dashboards registered yet.</Card>
          )}
        </div>

        {/* Recent Audits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-indigo-400" /> Recent Audit Requests
              <span className="text-sm font-normal text-slate-500">({requests.length})</span>
            </h2>
            <Link href="/insight/new">
              <Button size="sm" variant="ghost"><Plus className="w-3 h-3" /> New Audit</Button>
            </Link>
          </div>
          {requests.length > 0 ? (
            <div className="space-y-2">
              {requests.map((req) => (
                <Link key={req.id} href={`/case/${req.id}`}>
                  <Card hover className="py-3 px-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{req.insight_text}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        req.verdict === "APPROVED"
                          ? "success"
                          : req.verdict === "UNSUPPORTED"
                            ? "danger"
                            : "muted"
                      }
                    >
                      {req.verdict ?? req.status}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 text-slate-500 text-sm">No audit requests yet.</Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
