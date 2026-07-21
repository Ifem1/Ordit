export const dynamic = "force-dynamic";

import Card from "@/components/ui/Card";
import { CreditCard, CheckCircle } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Access</h1>
        <p className="text-sm text-slate-400">Contract-only mode</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">No off-chain subscription gate</p>
            <p className="text-xs text-slate-500">Access is currently controlled by wallet permissions on OrditContract.</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {[
            "Organizations and roles are stored on-chain",
            "Audit submissions are signed by your wallet",
            "Future paid access should be implemented as a contract entitlement or token-gated rule",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
