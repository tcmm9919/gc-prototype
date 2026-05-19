import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Clickable row with leading icon + label + trailing ↗ arrow.
 * Use for shortcuts, external links, "open in provider" actions.
 * When `external` is true, opens in a new tab and adds rel="noreferrer".
 */
export function LinkRow({
  href,
  icon: Icon,
  label,
  description,
  external = false,
  className,
}: {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  description?: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon ? <Icon className="size-4 text-muted-foreground shrink-0" /> : null}
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground leading-tight">{label}</div>
          {description ? (
            <div className="mt-0.5 text-xs text-muted-foreground truncate">{description}</div>
          ) : null}
        </div>
      </div>
      <ArrowUpRight className="size-3.5 text-muted-foreground shrink-0 transition-transform group-hover/linkrow:-translate-y-0.5 group-hover/linkrow:translate-x-0.5" />
    </>
  );

  const classes = cn(
    "group/linkrow flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted/40",
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
