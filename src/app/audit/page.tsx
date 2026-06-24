"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, ArrowRight } from "lucide-react";

interface AuditRequest {
  id: string;
  onchain_id: string;
  insight_text: string;
  status: string;
  created_at: string;
  organizations: { name: string } | null;
}

export default function AuditTrailListPage() {
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("insight_audit_requests")
        .select("id, onchain_id, insight_text, status, created_at, organizations(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      setRequests((data as AuditRequest[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const variantFor = (status: string) => {
    if (status === "APPROVED") return "success" as const;
    if (status === "UNSUPPORTED") return "danger" as const;
    if (status === "NEEDS_REVIEW" || status === "NEEDS_REVISION") return "warning" as const;
    return "muted" as const;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Audit Trail</h1>
        <p className="text-sm text-slate-400">
          Complete history of all insight audit requests and their outcomes
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">No audit history yet</p>
          <p className="text-xs text-slate-600">
            Submit an insight audit to see the trail here.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <Link key={req.id} href={`/audit/${req.id}`}>
              <Card hover className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm text-white truncate">{req.insight_text}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(req.organizations as { name: string } | null)?.name ?? "Unknown"} · {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={variantFor(req.status)}>
                    {req.status.replace(/_/g, " ")}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
