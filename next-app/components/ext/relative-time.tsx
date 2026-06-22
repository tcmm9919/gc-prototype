import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RelativeTime({ iso, className }: { iso?: string; className?: string }) {
  if (!iso) return <span className={cn("text-muted-foreground", className)}>—</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* relative-время считается от текущего момента → сервер и клиент дают
            разные строки. suppressHydrationWarning гасит ложный mismatch. */}
        <span suppressHydrationWarning className={cn("text-muted-foreground", className)}>{formatRelative(iso)}</span>
      </TooltipTrigger>
      <TooltipContent>{formatDateTime(iso)}</TooltipContent>
    </Tooltip>
  );
}
