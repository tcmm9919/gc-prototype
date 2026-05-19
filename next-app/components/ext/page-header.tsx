import { cn } from "@/lib/utils";
import { Eyebrow } from "./mono";

/**
 * Linear × Airbnb hero header — confident type, generous spacing.
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 pt-10 pb-8 md:flex-row md:items-end md:justify-between md:gap-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3 min-w-0">
        {eyebrow ? <Eyebrow tone="muted">{eyebrow}</Eyebrow> : null}
        <h1 className="font-heading text-[34px] md:text-[44px] font-semibold tracking-[-0.035em] text-foreground leading-[1.02]">
          {title}
        </h1>
        {description ? (
          <p className="text-[15px] md:text-base text-ink-soft max-w-[58ch] leading-[1.5]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
