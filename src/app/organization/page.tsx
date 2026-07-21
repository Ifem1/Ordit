"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { connectInjectedWallet, getConnectedWallet } from "@/lib/wallet/injected";
import { getOrganizationsForWallet } from "@/lib/ordit/contractQueries";
import type { ContractOrganization } from "@/types";

export default function OrganizationsPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<ContractOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (address?: string) => {
    setLoading(true);
    const connected = address ?? (await getConnectedWallet())?.address ?? null;
    setWallet(connected);
    setOrgs(connected ? await getOrganizationsForWallet(connected) : []);
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
        <p className="text-sm text-slate-400 mb-5">Organizations are read from the Ordit contract by wallet address.</p>
        <Button onClick={async () => load((await connectInjectedWallet()).address)}>Connect Wallet</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Organizations</h1>
          <p className="text-sm text-slate-400">On-chain organizations owned by or shared with your wallet</p>
        </div>
        <Link href="/organization/new">
          <Button><Plus className="w-4 h-4" /> New Organization</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Reading contract state...</p>
      ) : !orgs.length ? (
        <Card className="text-center py-16">
          <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 mb-4">No organizations yet.</p>
          <Link href="/organization/new"><Button>Create your first organization</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgs.map((org) => (
            <Link key={org.id} href={`/organization/${org.id}`}>
              <Card hover className="group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <Badge variant={org.status === "ACTIVE" ? "success" : "muted"}>{org.status}</Badge>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">{org.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{org.industry}</p>
                <span className="font-mono text-xs text-slate-600 truncate">{org.id}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
