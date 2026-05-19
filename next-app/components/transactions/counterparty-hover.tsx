"use client";

import { Building2, Globe, Landmark } from "lucide-react";
import type { Counterparty } from "@/lib/mock";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface CounterpartyHoverProps {
  counterparty: Counterparty;
  children: React.ReactNode;
}

export function CounterpartyHover({ counterparty, children }: CounterpartyHoverProps) {
  return (
    <HoverCard openDelay={250} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-72">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <span className="font-medium block truncate">{counterparty.name}</span>
            {counterparty.iban ? (
              <span className="text-xs font-mono text-muted-foreground block truncate">{counterparty.iban}</span>
            ) : null}
          </div>
        </div>
        <dl className="grid gap-1.5 mt-3 pt-3 border-t border-border text-sm">
          <Row icon={Globe} label="Страна" value={counterparty.country ?? "—"} />
          <Row icon={Landmark} label="Банк" value={counterparty.bank ?? "—"} />
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-xs">{value}</span>
    </div>
  );
}
