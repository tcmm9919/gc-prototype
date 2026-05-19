"use client";

import { CalendarDays, MapPin, ShieldAlert } from "lucide-react";
import type { Client } from "@/lib/mock";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AvatarCircle } from "@/components/ext/entity-header";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { initialsFromName, formatDate } from "@/lib/format";

const STATUS_LABEL = {
  active: "Активен",
  review: "На проверке",
  edd: "EDD",
  blocked: "Заблокирован",
} as const;

const STATUS_TONE = {
  active: "success",
  review: "warning",
  edd: "info",
  blocked: "danger",
} as const;

interface ClientHoverPreviewProps {
  client: Client;
  children: React.ReactNode;
}

export function ClientHoverPreview({ client, children }: ClientHoverPreviewProps) {
  return (
    <HoverCard openDelay={250} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        <div className="flex items-start gap-3">
          <AvatarCircle initials={initialsFromName(client.fullName)} size="md" hue={(client.id.charCodeAt(3) * 47) % 360} />
          <div className="flex-1 min-w-0">
            <span className="font-medium block truncate">{client.fullName}</span>
            <span className="text-xs text-muted-foreground block">
              {client.id} · {client.type === "legal" ? "Юр. лицо" : "Физ. лицо"} · {client.segment}
            </span>
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              <RiskBadge level={client.riskLevel} />
              <StatusBadge tone={STATUS_TONE[client.status]}>{STATUS_LABEL[client.status]}</StatusBadge>
              {client.pep ? (
                <StatusBadge tone="warning">
                  <ShieldAlert className="size-3" />
                  PEP
                </StatusBadge>
              ) : null}
            </div>
          </div>
        </div>
        <dl className="grid gap-1.5 mt-3 pt-3 border-t border-border text-sm">
          <Row icon={MapPin} label="Страна" value={client.country} />
          <Row icon={CalendarDays} label="Последняя операция" value={client.lastTransactionAt ? formatDate(client.lastTransactionAt) : "—"} />
          <Row label="Внутренний скор" value={String(client.internalScore)} mono />
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </span>
      <span className={`text-xs ${mono ? "font-mono tabular-nums" : ""}`}>{value}</span>
    </div>
  );
}
