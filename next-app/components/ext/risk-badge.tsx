import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/mock/types";

/**
 * Sovereign Banking risk badge: pill with translucent tint + colored dot + label.
 * Reference: Mercury Bank, Stripe Atlas.
 */

const TONE: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  low: {
    bg: "bg-risk-low/10 dark:bg-risk-low/15",
    text: "text-risk-low",
    dot: "bg-risk-low",
  },
  medium: {
    bg: "bg-risk-medium/15 dark:bg-risk-medium/20",
    text: "text-risk-medium",
    dot: "bg-risk-medium",
  },
  high: {
    bg: "bg-risk-high/12 dark:bg-risk-high/18",
    text: "text-risk-high",
    dot: "bg-risk-high",
  },
  critical: {
    bg: "bg-risk-critical/12 dark:bg-risk-critical/18",
    text: "text-risk-critical",
    dot: "bg-risk-critical",
  },
};

const LABELS: Record<RiskLevel, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический",
};

export function RiskBadge({
  level,
  className,
  showLabel = true,
}: {
  level: RiskLevel;
  className?: string;
  showLabel?: boolean;
}) {
  const t = TONE[level];
  const isCritical = level === "critical";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "text-xs font-medium leading-tight",
        t.bg,
        t.text,
        className,
      )}
    >
      <span className="relative inline-flex size-1.5 items-center justify-center shrink-0">
        {isCritical ? (
          <span
            aria-hidden
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden",
              t.dot,
            )}
          />
        ) : null}
        <span aria-hidden className={cn("relative inline-flex size-1.5 rounded-full", t.dot)} />
      </span>
      {showLabel ? LABELS[level] : null}
    </span>
  );
}
