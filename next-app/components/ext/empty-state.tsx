import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 px-6 py-20 text-center", className)}>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-primary/8 blur-2xl"
          aria-hidden
        />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground shadow-sm">
          {icon ?? <Inbox className="size-7" />}
        </div>
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h2 className="font-heading text-lg font-medium text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground leading-relaxed">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
