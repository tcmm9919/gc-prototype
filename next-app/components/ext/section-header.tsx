import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Title + subtitle + horizontal rule. For grouping content inside a card,
 * tab, or form without overusing CardHeader. Optional right-aligned actions.
 */
export function SectionHeader({
  title,
  subtitle,
  actions,
  className,
  divider = true,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  divider?: boolean;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-semibold leading-tight">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {divider ? <Separator className="mt-3" /> : null}
    </div>
  );
}
