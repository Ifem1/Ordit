"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { markBusinessDecisionActivated } from "@/lib/genlayer/orditContract";
import { getUserWalletAddress } from "@/lib/ordit/walletAddress";
import { CheckCircle, AlertTriangle } from "lucide-react";
import TxLink from "@/components/ordit/TxLink";

export default function ActivateDecisionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ tx_hash: string; explorer_url: string } | null>(null);

  const activate = async () => {
    setLoading(true);
    setError(null);
    try {
      const walletAddress = await getUserWalletAddress();
      const res = await markBusinessDecisionActivated(id, "Activated via Ordit dashboard", walletAddress);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Activate Business Decision</h1>

        {!result ? (
          <Card className="border-emerald-500/20">
            <div className="flex items-start gap-3 mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  This insight has been approved by GenLayer consensus.
                </p>
                <p className="text-sm text-slate-400">
                  Activating the business decision records this action permanently on-chain via{" "}
                  <code className="text-indigo-400">mark_business_decision_activated</code>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-2 mb-6">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              This action is irreversible and will be recorded on StudioNet.
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button variant="teal" loading={loading} onClick={activate}>
                <CheckCircle className="w-4 h-4" /> Confirm Activation
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-emerald-500/20 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Decision Activated</h2>
            <p className="text-slate-400 text-sm mb-4">
              Recorded on-chain via <code className="text-teal-400">mark_business_decision_activated</code>
            </p>
            <TxLink
              txHash={result.tx_hash}
              explorerUrl={result.explorer_url}
              label="View on StudioNet Explorer"
              short={false}
              className="justify-center mb-6"
            />
            <Button onClick={() => router.push(`/case/${id}`)}>Back to Case File</Button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
