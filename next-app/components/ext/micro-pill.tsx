import * as React from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "./status-dot";

const TONE_DOT: Record<StatusTone, string> = {
  success: "bg-risk-low",
  warning: "bg-risk-medium",
  danger: "bg-risk-critical",
  info: "bg-primary",
  muted: "bg-muted-foreground/60",
};

/**
 * Ultra-compact pill with leading color-dot. No border. Multiple-per-row dense use:
 * tags, segments, category indicators. Lighter than Badge or StatusBadge.
 */
export function MicroPill({
  tone = "muted",
  children,
  className,
  dot = true,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full bg-muted/60 px-1.5 text-[10px] font-medium text-foreground/80",
        className,
      )}
    >
      {dot ? <span aria-hidden className={cn("size-1.5 rounded-full", TONE_DOT[tone])} /> : null}
      <span className="leading-none">{children}</span>
    </span>
  );
}
