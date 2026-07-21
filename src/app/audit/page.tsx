"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";
import { getOrganizationsForWallet, getRequestsForOrganizations } from "@/lib/ordit/contractQueries";
import { BookOpen, ArrowRight, Wallet } from "lucide-react";
import type { InsightAuditRequest, InsightDecision } from "@/types";

type RequestWithDecision = InsightAuditRequest & { decision?: InsightDecision };

export default function AuditTrailListPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestWithDecision[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (address?: string) => {
    setLoading(true);
    const connected = address ?? (await getConnectedWallet())?.address ?? null;
    setWallet(connected);
    if (connected) {
      const orgs = await getOrganizationsForWallet(connected);
      setRequests(await getRequestsForOrganizations(orgs.map((org) => org.id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const variantFor = (status: string) => {
    if (status === "APPROVED" || status === "ACTIVATED") return "success" as const;
    if (status === "UNSUPPORTED" || status === "BLOCKED") return "danger" as const;
    if (status === "NEEDS_REVIEW" || status === "NEEDS_REVISION") return "warning" as const;
    return "muted" as const;
  };

  if (!wallet && !loading) {
    return (
      <Card className="max-w-lg">
        <Wallet className="w-8 h-8 text-teal-400 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Connect wallet</h1>
        <p className="text-sm text-slate-400 mb-5">Audit history is derived from contract request indexes.</p>
        <Button onClick={async () => load((await connectInjectedWallet()).address)}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Audit Trail</h1>
        <p className="text-sm text-slate-400">Contract-recorded history of insight audit requests</p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Reading contract state...</p>
      ) : requests.length === 0 ? (
        <Card className="text-center py-16">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-2">No audit history yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <Link key={req.id} href={`/audit/${req.id}`}>
              <Card hover className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm text-white truncate">{req.insight_text}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{req.id}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={variantFor(req.status)}>{req.status.replace(/_/g, " ")}</Badge>
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
