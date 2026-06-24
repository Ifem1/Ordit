import type { InsightScores } from "@/types";
import ScoreRing from "@/components/ui/ScoreRing";

const SCORE_LABELS: { key: keyof InsightScores; label: string; invert?: boolean }[] = [
  { key: "evidence_support_score", label: "Evidence Support" },
  { key: "statistical_confidence_score", label: "Statistical Confidence" },
  { key: "explainability_score", label: "Explainability" },
  { key: "narrative_accuracy_score", label: "Narrative Accuracy" },
  { key: "business_impact_score", label: "Business Impact" },
  { key: "hallucination_risk_score", label: "Hallucination Risk", invert: true },
  { key: "completeness_score", label: "Completeness" },
  { key: "confidence_score", label: "Confidence" },
];

export default function ScoreGrid({ scores }: { scores: InsightScores }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {SCORE_LABELS.map(({ key, label, invert }) => (
        <ScoreRing
          key={key}
          score={scores[key]}
          label={label}
          invert={invert}
        />
      ))}
    </div>
  );
}
