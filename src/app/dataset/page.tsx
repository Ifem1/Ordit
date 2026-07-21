"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Plus, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";
import { getDatasetsForOrganizations, getOrganizationsForWallet } from "@/lib/ordit/contractQueries";
import type { ContractDataset } from "@/types";

export default function DatasetsPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<ContractDataset[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (address?: string) => {
    setLoading(true);
    const connected = address ?? (await getConnectedWallet())?.address ?? null;
    setWallet(connected);
    if (connected) {
      const orgs = await getOrganizationsForWallet(connected);
      setDatasets(await getDatasetsForOrganizations(orgs.map((org) => org.id)));
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
        <p className="text-sm text-slate-400 mb-5">Datasets are read from organizations visible to your wallet.</p>
        <Button onClick={async () => load((await connectInjectedWallet()).address)}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Datasets</h1>
          <p className="text-sm text-slate-400">On-chain data source contexts for insight auditing</p>
        </div>
        <Link href="/dataset/new">
          <Button><Plus className="w-4 h-4" /> Register Dataset</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Reading contract state...</p>
      ) : !datasets.length ? (
        <Card className="text-center py-16">
          <Database className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No datasets registered yet.</p>
          <Link href="/dataset/new"><Button>Register your first dataset</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {datasets.map((d) => (
            <Card key={d.id} hover>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{d.name}</p>
                    <Badge variant={d.status === "ACTIVE" ? "success" : "muted"}>{d.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">Source: {d.source}</p>
                </div>
                <span className="font-mono text-xs text-slate-600 shrink-0">{d.id}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
