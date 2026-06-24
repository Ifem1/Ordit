import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";

interface TxLinkProps {
  txHash: string;
  explorerUrl: string;
  label?: string;
  className?: string;
  short?: boolean;
}

export default function TxLink({ txHash, explorerUrl, label, className, short = true }: TxLinkProps) {
  const display = label ?? (short ? `${txHash.slice(0, 8)}…${txHash.slice(-6)}` : txHash);

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-sm font-mono transition-colors",
        className,
      )}
    >
      {display}
      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
    </a>
  );
}
