import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "info" | "muted";

const TONE_DOT: Record<StatusTone, string> = {
  success: "bg-risk-low",
  warning: "bg-risk-medium",
  danger: "bg-risk-critical",
  info: "bg-primary",
  muted: "bg-muted-foreground/60",
};

const TONE_TEXT: Record<StatusTone, string> = {
  success: "text-foreground",
  warning: "text-foreground",
  danger: "text-foreground",
  info: "text-foreground",
  muted: "text-muted-foreground",
};

/**
 * Calm status indicator: colored dot + label. Quieter than StatusBadge —
 * use in dense tables and list rows where a full badge is too heavy.
 */
export function StatusDot({
  tone = "muted",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", TONE_TEXT[tone], className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", TONE_DOT[tone])} />
      <span>{children}</span>
    </span>
  );
}
