import type { InsightFindings } from "@/types";
import { CheckCircle, XCircle, AlertTriangle, Info, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";

interface FindingsSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
}

function FindingsSection({ title, items, icon, color }: FindingsSectionProps) {
  if (!items?.length) return null;
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        <h4 className="text-sm font-semibold">{title}</h4>
        <span className="ml-auto text-xs opacity-60">{items.length}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FindingsPanel({ findings }: { findings: InsightFindings }) {
  return (
    <div className="space-y-6">
      {findings.audit_summary && (
        <Card className="border-indigo-500/20">
          <p className="text-sm font-medium text-indigo-300 mb-1">Audit Summary</p>
          <p className="text-slate-300 text-sm leading-relaxed">{findings.audit_summary}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <FindingsSection
            title="Supported Claims"
            items={findings.supported_claims}
            icon={<CheckCircle className="w-4 h-4" />}
            color="text-emerald-400"
          />
        </Card>

        <Card>
          <FindingsSection
            title="Unsupported Claims"
            items={findings.unsupported_claims}
            icon={<XCircle className="w-4 h-4" />}
            color="text-red-400"
          />
        </Card>

        <Card>
          <FindingsSection
            title="Misleading Statements"
            items={findings.misleading_statements}
            icon={<AlertTriangle className="w-4 h-4" />}
            color="text-amber-400"
          />
        </Card>

        <Card>
          <FindingsSection
            title="Missing Context"
            items={findings.missing_context}
            icon={<Info className="w-4 h-4" />}
            color="text-blue-400"
          />
        </Card>
      </div>

      {findings.recommendations?.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-teal-400 mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Recommendations
          </p>
          <ul className="space-y-2">
            {findings.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-teal-400 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {findings.rationale && (
        <Card>
          <p className="text-sm font-medium text-slate-400 mb-2">Rationale</p>
          <p className="text-slate-300 text-sm leading-relaxed">{findings.rationale}</p>
        </Card>
      )}
    </div>
  );
}
