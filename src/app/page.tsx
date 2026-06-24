"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, ShieldCheck, GitMerge, LineChart, FileSearch, Star } from "lucide-react";
import OrditLogo from "@/components/layout/OrditLogo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const features = [
  {
    icon: FileSearch,
    title: "AI Insight Submission",
    desc: "Upload datasets, reports, and AI-generated narratives for consensus verification.",
    color: "text-indigo-400",
    glow: "rgba(99,102,241,0.15)",
  },
  {
    icon: GitMerge,
    title: "GenLayer Consensus",
    desc: "Multiple independent validators reach consensus on whether your insights are data-backed.",
    color: "text-teal-400",
    glow: "rgba(20,184,166,0.15)",
  },
  {
    icon: ShieldCheck,
    title: "Evidence-Backed Verdicts",
    desc: "Every verdict includes supported claims, unsupported claims, risks, and recommendations.",
    color: "text-emerald-400",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    icon: LineChart,
    title: "8-Dimension Scoring",
    desc: "Evidence support, hallucination risk, narrative accuracy, confidence, and more.",
    color: "text-amber-400",
    glow: "rgba(245,158,11,0.15)",
  },
];

const verdictExamples = [
  { label: "APPROVED", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", pct: "62%" },
  { label: "NEEDS_REVISION", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", pct: "23%" },
  { label: "UNSUPPORTED", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", pct: "11%" },
  { label: "NEEDS_REVIEW", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", pct: "4%" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* â”€â”€ Header â”€â”€ */}
      <header className="glass border-b border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <OrditLogo size="md" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#verdicts" className="hover:text-white transition-colors">Verdicts</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* â”€â”€ Hero â”€â”€ */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-indigo-500/20 text-xs text-indigo-300 mb-8">
          <Star className="w-3 h-3" />
          Powered by GenLayer Intelligent Contracts Â· StudioNet
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
          <span className="text-white">Trusted AI consensus</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            for business insights.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Different AI models produce different narratives from the same data.
          Ordit uses GenLayer consensus to determine whether AI-generated insights
          are actually supported by the underlying evidence â€” before they become decisions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth?mode=signup">
            <Button size="lg" className="gap-3">
              Start auditing insights
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="secondary" size="lg">
              Sign in to dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* â”€â”€ Console preview image â”€â”€ */}
      <section className=”max-w-5xl mx-auto px-6 pb-8”>
        <div className=”rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl”>
          <img
            src=”https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop&q=80”
            alt=”Data analytics dashboard”
            className=”w-full h-auto object-cover”
            loading=”lazy”
          />
        </div>
      </section>

      {/* â”€â”€ Preview card â”€â”€ */}
      <section className=”max-w-4xl mx-auto px-6 pb-24”>
        <div className=”glass-card p-8 border-indigo-500/20 glow-brand”>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-slate-500 mb-1">AUDIT REQUEST Â· Q3 2024 REVENUE REPORT</p>
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
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: s.invert ? (s.score < 30 ? "#34d399" : "#f87171") : "#6366f1" }}
                >
                  {s.score}
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            GenLayer validators independently reached consensus Â·{" "}
            <span className="text-teal-400 font-mono">0x4f2aâ€¦c8e1</span> Â·{" "}
            StudioNet Block #1,247,832
          </p>
        </div>
      </section>

      {/* â”€â”€ Trust image â”€â”€ */}
      <section className=”max-w-6xl mx-auto px-6 pb-4”>
        <div className=”grid grid-cols-1 md:grid-cols-2 gap-6 items-center”>
          <div className=”rounded-xl overflow-hidden border border-white/[0.06]”>
            <img
              src=”https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80”
              alt=”Business intelligence reports”
              className=”w-full h-auto object-cover”
              loading=”lazy”
            />
          </div>
          <div className=”rounded-xl overflow-hidden border border-white/[0.06]”>
            <img
              src=”https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop&q=80”
              alt=”Data visualization and monitoring”
              className=”w-full h-auto object-cover”
              loading=”lazy”
            />
          </div>
        </div>
      </section>

      {/* â”€â”€ Features â”€â”€ */}
      <section id=”how” className=”max-w-6xl mx-auto px-6 py-20”>
        <div className=”text-center mb-14”>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why your AI summaries need verification
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            The same dataset. Different AI models. Different conclusions.
            Ordit resolves the ambiguity with on-chain consensus.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="hover:border-white/14 transition-all">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.glow }}
              >
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* â”€â”€ Verdicts â”€â”€ */}
      <section id="verdicts" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Four possible verdicts. All on-chain.</h2>
          <p className="text-slate-400">
            GenLayer validators determine the verdict. Supabase mirrors it. You trust it.
          </p>
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

      {/* â”€â”€ Pricing â”€â”€ */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card>
            <p className="text-sm text-slate-400 mb-1">Free</p>
            <p className="text-4xl font-bold text-white mb-6">0 <span className="text-lg font-normal text-slate-400">GEN/mo</span></p>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              {["5 audits per month", "Files up to 5 MB", "Basic explanations", "30-day history"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-400">âœ“</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?mode=signup">
              <Button variant="secondary" className="w-full">Get started free</Button>
            </Link>
          </Card>

          <Card glow="brand" className="border-indigo-500/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-indigo-300">Pro</p>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Popular</span>
            </div>
            <p className="text-4xl font-bold text-white mb-6">10 <span className="text-lg font-normal text-slate-400">GEN/mo</span></p>
            <ul className="space-y-2 text-sm text-slate-300 mb-6">
              {[
                "Unlimited audits",
                "Files up to 50 MB",
                "Deep explanations & evidence reports",
                "Team collaboration",
                "Priority processing",
                "Full audit history",
                "Historical analytics",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-indigo-400">âœ“</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?mode=signup">
              <Button className="w-full">Upgrade to Pro</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* â”€â”€ Footer â”€â”€ */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <OrditLogo size="sm" />
          <p className="text-sm text-slate-500">
            Â© {new Date().getFullYear()} Ordit. Built on{" "}
            <a
              href="https://studio.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              GenLayer StudioNet
            </a>
            . Powered by GEN tokens.
          </p>
        </div>
      </footer>
    </div>
  );
}

