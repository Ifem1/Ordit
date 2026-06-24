export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CreditCard, CheckCircle, Zap } from "lucide-react";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isPro = profile?.subscription_tier === "pro";
  const auditCount = profile?.audit_count_this_month ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Subscription</h1>
        <p className="text-sm text-slate-400">Manage your Ordit plan</p>
      </div>

      {/* Current plan */}
      <Card className={isPro ? "border-indigo-500/30" : ""}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Current plan: <span className="text-indigo-300 font-semibold">{isPro ? "Pro" : "Free"}</span>
              </p>
              <p className="text-xs text-slate-500">{auditCount} audits used this month</p>
            </div>
          </div>
          {isPro && (
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Active
            </span>
          )}
        </div>

        {!isPro && (
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-1">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((auditCount / 5) * 100, 100)}%` }}
            />
          </div>
        )}
        {!isPro && (
          <p className="text-xs text-slate-500">{auditCount}/5 audits used · resets monthly</p>
        )}
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={!isPro ? "border-white/20" : ""}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-slate-400">Free</p>
            {!isPro && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Current</span>}
          </div>
          <p className="text-4xl font-bold text-white mb-4">0 <span className="text-base font-normal text-slate-400">GEN/mo</span></p>
          <ul className="space-y-2 text-sm text-slate-400 mb-6">
            {["5 audits per month", "5 MB max file size", "Basic audit reports", "30-day history"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          {!isPro && <Button variant="secondary" disabled className="w-full">Current plan</Button>}
        </Card>

        <Card glow="brand" className="border-indigo-500/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm text-indigo-300">Pro</p>
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            {isPro && <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Current</span>}
          </div>
          <p className="text-4xl font-bold text-white mb-4">10 <span className="text-base font-normal text-slate-400">GEN/mo</span></p>
          <ul className="space-y-2 text-sm text-slate-300 mb-6">
            {[
              "Unlimited audits",
              "50 MB max file size",
              "Deep evidence reports",
              "Team collaboration",
              "Priority processing",
              "Full audit history",
              "Historical analytics",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          {!isPro ? (
            <Button className="w-full">Upgrade to Pro</Button>
          ) : (
            <Button variant="danger" className="w-full">Cancel plan</Button>
          )}
        </Card>
      </div>

      <p className="text-xs text-slate-600 text-center">
        Powered by GenLayer · GEN token payments coming soon
      </p>
    </div>
  );
}
