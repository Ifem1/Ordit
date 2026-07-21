"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { connectInjectedWallet, getConnectedWallet, shortAddress } from "@/lib/wallet/injected";
import { GENLAYER_CONFIG } from "@/lib/genlayer/config";
import { Wallet, Shield, ExternalLink, Copy, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getConnectedWallet().then((wallet) => setWalletAddress(wallet?.address ?? null));
  }, []);

  const copy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = walletAddress ? `${GENLAYER_CONFIG.explorerUrl}/address/${walletAddress}` : null;

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-sm text-slate-400">Wallet identity and GenLayer network configuration.</p>
        </div>

        <Card className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Connected Wallet</p>
              <p className="text-xs text-slate-500">Rabby or MetaMask signs GenLayer writes</p>
            </div>
          </div>

          {!walletAddress ? (
            <Button onClick={async () => setWalletAddress((await connectInjectedWallet()).address)}>
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-teal-300 font-mono px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 truncate">
                {walletAddress} ({shortAddress(walletAddress)})
              </code>
              <button onClick={copy} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-colors">
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              {explorerUrl && (
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-teal-400 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">GenLayer Contract</p>
              <p className="text-xs text-slate-500">Frontend reads and writes directly through genlayer-js</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-1">Chain ID</p>
              <p className="text-slate-300">{GENLAYER_CONFIG.chainId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">RPC</p>
              <p className="text-slate-300 break-all">{GENLAYER_CONFIG.rpcUrl}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Ordit Contract</p>
              <p className="text-slate-300 break-all font-mono">{GENLAYER_CONFIG.contractAddress || "Not configured"}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
