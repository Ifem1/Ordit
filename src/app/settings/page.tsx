"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateWallet } from "@/lib/ordit/walletAddress";
import { User, Wallet, Shield, CheckCircle, ExternalLink, Copy, Eye, EyeOff } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  wallet_address: string | null;
  subscription_tier: string | null;
  created_at: string | null;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showPk, setShowPk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [copied, setCopied] = useState<"address" | "pk" | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setAuthEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setFullName((data.full_name as string) ?? "");
      }

      // Load or generate wallet
      const { address, privateKey: pk } = await getOrCreateWallet();
      setWalletAddress(address);
      setPrivateKey(pk);
    };
    load();
  }, []);

  const copy = async (text: string, type: "address" | "pk") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const explorerUrl = walletAddress
    ? `https://explorer-studio.genlayer.com/address/${walletAddress}`
    : null;

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-sm text-slate-400">Your profile and on-chain identity.</p>
        </div>

        {/* Profile */}
        <Card className="mb-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Profile</p>
              <p className="text-xs text-slate-500">Your name and email</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <p className="text-sm text-slate-300 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                {authEmail || "—"}
              </p>
            </div>

            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
            />

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
                Member Since
              </label>
              <p className="text-sm text-slate-500 px-3 py-2">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Wallet */}
        <Card className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Your Ordit Wallet</p>
              <p className="text-xs text-slate-500">Auto-generated on first login</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-5">
            Ordit automatically created an Ethereum wallet for your account when you signed in.
            This wallet is your on-chain identity on GenLayer StudioNet — it signs every organization,
            dataset, and audit action you perform.
          </p>

          {/* Address */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
              Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-teal-300 font-mono px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 truncate">
                {walletAddress ?? "Generating..."}
              </code>
              {walletAddress && (
                <button
                  onClick={() => copy(walletAddress, "address")}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copied === "address" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-teal-400 transition-colors"
                  title="View on StudioNet Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Private key */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block">
              Private Key
              <span className="ml-2 normal-case text-amber-400">(stored in your browser only — back it up)</span>
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-slate-400 font-mono px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 truncate">
                {showPk && privateKey ? privateKey : "••••••••••••••••••••••••••••••••••••••••••••••••••"}
              </code>
              <button
                onClick={() => setShowPk(!showPk)}
                className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-colors"
                title={showPk ? "Hide" : "Reveal private key"}
              >
                {showPk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {privateKey && (
                <button
                  onClick={() => copy(privateKey, "pk")}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy private key"
                >
                  {copied === "pk" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Security</p>
              <p className="text-xs text-slate-500">Supabase authentication</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Your account is secured by Supabase Auth. To change your password, sign out and use the reset flow on the login page.
          </p>
        </Card>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Profile saved.
          </div>
        )}

        <Button onClick={save} loading={loading} size="lg">
          Save Changes
        </Button>
      </div>
    </AppShell>
  );
}
