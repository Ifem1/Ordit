import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "brand" | "teal" | "none";
}

export default function Card({ children, className, hover = false, glow = "none" }: CardProps) {
  return (
    <div
      className={clsx(
        "glass-card p-6",
        hover && "cursor-pointer",
        glow === "brand" && "glow-brand",
        glow === "teal" && "glow-teal",
        className,
      )}
    >
      {children}
    </div>
  );
}
