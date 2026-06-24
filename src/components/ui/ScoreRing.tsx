"use client";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  color?: string;
  invert?: boolean;
}

export default function ScoreRing({
  score,
  label,
  size = 80,
  color = "#6366f1",
  invert = false,
}: ScoreRingProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const displayScore = invert ? 100 - score : score;
  const offset = circumference - (displayScore / 100) * circumference;

  const ringColor =
    invert
      ? score > 60
        ? "#ef4444"
        : score > 30
        ? "#f59e0b"
        : "#10b981"
      : score >= 70
      ? "#10b981"
      : score >= 40
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-white font-mono">{score}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center leading-tight max-w-[80px]">
        {label}
      </span>
    </div>
  );
}
