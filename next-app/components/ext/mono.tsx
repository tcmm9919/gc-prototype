import { cn } from "@/lib/utils";

/**
 * Sovereign Banking primitives — refined sans-display + mono for codes.
 *
 * Display numbers use Plus Jakarta Sans (font-heading) — same family as headlines
 * but heavier weight + tight tracking. Mono is reserved for IDs, UUIDs, timestamps.
 */

export function Mono({
  children,
  className,
  size = "sm",
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "default" | "muted" | "subtle" | "primary";
}) {
  const sizeClass = {
    xs: "text-[11px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];
  const toneClass = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    subtle: "text-subtle-foreground",
    primary: "text-primary",
  }[tone];
  return (
    <span className={cn("font-mono tabular-nums tracking-[-0.01em]", sizeClass, toneClass, className)}>
      {children}
    </span>
  );
}

/**
 * Display-sized number — KPI hero values, big amounts.
 * Uses Plus Jakarta Sans for warmth, with tight letter-spacing.
 */
export function DisplayNumber({
  children,
  className,
  size = "xl",
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "lg" | "xl" | "2xl" | "3xl";
  tone?: "default" | "primary" | "muted";
}) {
  const sizeClass = {
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
    "3xl": "text-5xl",
  }[size];
  const toneClass = {
    default: "text-foreground",
    primary: "text-primary",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "font-heading font-semibold tabular-nums tracking-[-0.035em] leading-[1]",
        sizeClass,
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Eyebrow — small caps label, refined.
 * Uses regular sans (not mono) for Sovereign warmth.
 */
export function Eyebrow({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "subtle" | "muted" | "primary";
}) {
  const toneClass = {
    subtle: "text-subtle-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
  }[tone];
  return (
    <span
      className={cn(
        "inline-block font-medium text-[11px] uppercase tracking-[0.06em]",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
