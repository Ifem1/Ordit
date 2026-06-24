"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, ArrowRight } from "lucide-react";

interface Request {
  id: string;
  onchain_id: string;
  insight_text: string;
  status: string;
  created_at: string;
  organizations: { name: string } | null;
}

export default function HumanReviewListPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("insight_audit_requests")
        .select("id, onchain_id, insight_text, status, created_at, organizations(name)")
        .in("status", ["NEEDS_REVIEW", "NEEDS_REVISION"])
        .order("created_at", { ascending: false });

      setRequests((data as unknown as Request[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

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
        <h1 className="text-2xl font-bold text-white mb-1">Human Review</h1>
        <p className="text-sm text-slate-400">
          Insight audits that require human expert review before a final decision
        </p>
      </div>

      {requests.length === 0 ? (
        <Card className="text-center py-16">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">No pending reviews</p>
          <p className="text-xs text-slate-600">
            When GenLayer consensus flags an insight as NEEDS_REVIEW or NEEDS_REVISION, it will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link key={req.id} href={`/review/${req.id}`}>
              <Card hover className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm text-white truncate">{req.insight_text}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(req.organizations as { name: string } | null)?.name ?? "Unknown org"} · {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={req.status === "NEEDS_REVIEW" ? "warning" : "muted"}>
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
