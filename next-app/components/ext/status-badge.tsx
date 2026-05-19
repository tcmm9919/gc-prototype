import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "muted";

/**
 * Sovereign Banking status badge: pill with translucent tint + dot + label.
 * Used for finite states: «Завершена», «Открыто», «Resolved»…
 */

const TONE: Record<Tone, { bg: string; text: string; dot: string }> = {
  neutral: {
    bg: "bg-muted",
    text: "text-foreground",
    dot: "bg-muted-foreground",
  },
  info: {
    bg: "bg-risk-low/10 dark:bg-risk-low/15",
    text: "text-risk-low",
    dot: "bg-risk-low",
  },
  success: {
    bg: "bg-primary/10 dark:bg-primary/15",
    text: "text-primary",
    dot: "bg-primary",
  },
  warning: {
    bg: "bg-risk-medium/15 dark:bg-risk-medium/20",
    text: "text-risk-medium",
    dot: "bg-risk-medium",
  },
  danger: {
    bg: "bg-risk-critical/12 dark:bg-risk-critical/18",
    text: "text-risk-critical",
    dot: "bg-risk-critical",
  },
  muted: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
  dot = true,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  const t = TONE[tone];
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
      {dot ? <span aria-hidden className={cn("inline-flex size-1.5 rounded-full shrink-0", t.dot)} /> : null}
      {children}
    </span>
  );
}
