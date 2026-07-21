"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, GitMerge, Star, Wallet, Link2 } from "lucide-react";
import OrditLogo from "@/components/layout/OrditLogo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { connectInjectedWallet, shortAddress } from "@/lib/wallet/injected";

const features = [
  {
    icon: Wallet,
    title: "Injected Wallet Access",
    desc: "Connect Rabby, MetaMask, or another injected wallet. Your address is your signer and contract identity.",
    color: "text-teal-400",
    glow: "rgba(20,184,166,0.15)",
  },
  {
    icon: Link2,
    title: "Validator-Fetched Evidence",
    desc: "Submit source URLs and API references that GenLayer validators can independently fetch inside GenVM.",
    color: "text-indigo-400",
    glow: "rgba(99,102,241,0.15)",
  },
  {
    icon: GitMerge,
    title: "GenLayer Consensus",
    desc: "AI validators adjudicate whether an insight is supported by fetched evidence and contract state.",
    color: "text-purple-400",
    glow: "rgba(168,85,247,0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Contract-Backed Verdicts",
    desc: "Verdicts, findings, evidence gaps, reviews, activations, and audit logs are read from OrditContract.",
    color: "text-emerald-400",
    glow: "rgba(16,185,129,0.15)",
  },
];

const verdictExamples = [
  { label: "APPROVED", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", pct: "62%" },
  { label: "NEEDS_REVISION", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", pct: "23%" },
  { label: "UNSUPPORTED", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", pct: "11%" },
  { label: "NEEDS_REVIEW", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", pct: "4%" },
];

export default function LandingPage() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      const wallet = await connectInjectedWallet();
      setAddress(wallet.address);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg text-white">
      <header className="glass border-b border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <OrditLogo size="md" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#verdicts" className="hover:text-white transition-colors">Verdicts</a>
          </nav>
          <Button size="sm" onClick={connect} loading={loading}>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-indigo-500/20 text-xs text-indigo-300 mb-8">
          <Star className="w-3 h-3" />
          GenLayer contract-native audit flow
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
          <span className="text-white">Trusted AI consensus</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            for business insights.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Ordit uses GenLayer validators to fetch evidence, evaluate AI-generated claims,
          and settle verdicts directly through the OrditContract.
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          <Button size="lg" className="gap-3" onClick={connect} loading={loading}>
            <Wallet className="w-5 h-5" />
            Connect Rabby / MetaMask
            <ArrowRight className="w-5 h-5" />
          </Button>
          {address && <p className="text-xs text-emerald-400">Connected {shortAddress(address)}</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="glass-card p-8 border-indigo-500/20 glow-brand">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-slate-500 mb-1">AUDIT REQUEST · Q3 REVENUE REPORT</p>
              <h3 className="text-lg font-semibold text-white">
                Q3 revenue growth was primarily driven by enterprise tier expansion
              </h3>
            </div>
            <span className="verdict-APPROVED px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              APPROVED
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Evidence", score: 87 },
              { label: "Accuracy", score: 91 },
              { label: "Confidence", score: 84 },
              { label: "Hallucination Risk", score: 12, invert: true },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold mb-1" style={{ color: s.invert ? (s.score < 30 ? "#34d399" : "#f87171") : "#6366f1" }}>
                  {s.score}
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Validator-fetched evidence · OrditContract verdict · StudioNet transaction finality
          </p>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Ordit works</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Wallet connects, contract records the request, validators inspect sources, and the verdict becomes contract state.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="hover:border-white/14 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.glow }}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="verdicts" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Four verdicts. All contract-backed.</h2>
          <p className="text-slate-400">The frontend reads finalized outcomes from OrditContract.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {verdictExamples.map((v) => (
            <Card key={v.label} className={`text-center border ${v.bg}`}>
              <div className={`text-2xl font-bold mb-1 ${v.color}`}>{v.pct}</div>
              <div className={`text-xs font-semibold ${v.color}`}>{v.label.replace(/_/g, " ")}</div>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <OrditLogo size="sm" />
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Ordit. Built on GenLayer StudioNet.
          </p>
        </div>
      </footer>
    </div>
  );
}
