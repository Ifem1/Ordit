import { clsx } from "clsx";
import type { Verdict } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/15 text-red-400 border border-red-500/30",
    info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    muted: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: Verdict | string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
        `verdict-${verdict}`,
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
        aria-hidden
      />
      {verdict.replace(/_/g, " ")}
    </span>
  );
}
