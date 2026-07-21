"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileSearch, Plus, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { VerdictBadge } from "@/components/ui/Badge";
import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";
import { getOrganizationsForWallet, getRequestsForOrganizations } from "@/lib/ordit/contractQueries";
import type { InsightAuditRequest, InsightDecision } from "@/types";

type RequestWithDecision = InsightAuditRequest & { decision?: InsightDecision };

export default function InsightAuditListPage() {
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

  if (!wallet && !loading) {
    return (
      <Card className="max-w-lg">
        <Wallet className="w-8 h-8 text-teal-400 mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Connect wallet</h1>
        <p className="text-sm text-slate-400 mb-5">Audit requests are read from contract indexes for your organizations.</p>
        <Button onClick={async () => load((await connectInjectedWallet()).address)}>Connect Wallet</Button>
      </Card>
    );
  }

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

      {loading ? (
        <p className="text-slate-500 text-sm">Reading contract state...</p>
      ) : !requests.length ? (
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
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">{req.insight_text}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-slate-500 font-mono">{req.org_id}</span>
                      <span className="text-xs text-slate-600">{req.id}</span>
                    </div>
                  </div>
                  {req.decision?.verdict ? <VerdictBadge verdict={req.decision.verdict} /> : <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{req.status}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
