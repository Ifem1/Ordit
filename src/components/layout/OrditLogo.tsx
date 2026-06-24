import { clsx } from "clsx";

interface OrditLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

export default function OrditLogo({
  size = "md",
  showWordmark = true,
  className,
}: OrditLogoProps) {
  const dim = { sm: 28, md: 36, lg: 48 }[size];
  const textSize = { sm: "text-base", md: "text-xl", lg: "text-3xl" }[size];

  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      {/* Ordit icon: O with magnifying glass handle */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="url(#orditGrad)"
          strokeWidth="3.5"
          fill="none"
        />
        {/* Inner circle / lens */}
        <circle
          cx="20"
          cy="20"
          r="9"
          fill="url(#orditFill)"
          opacity="0.25"
        />
        {/* Center dot */}
        <circle cx="20" cy="20" r="3.5" fill="url(#orditGrad)" />
        {/* Magnifying glass handle */}
        <line
          x1="31"
          y1="31"
          x2="44"
          y2="44"
          stroke="url(#orditGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Lens glint */}
        <circle cx="14" cy="15" r="2" fill="white" opacity="0.35" />
        <defs>
          <linearGradient id="orditGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="orditFill" x1="11" y1="11" x2="29" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>

      {showWordmark && (
        <span
          className={clsx(
            "font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent",
            textSize,
          )}
          style={{ fontFamily: "Sora, system-ui, sans-serif" }}
        >
          ordit
        </span>
      )}
    </div>
  );
}
