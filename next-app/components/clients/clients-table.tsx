"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Filter, Plus } from "lucide-react";

import { DataTable } from "@/components/ext/data-table";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusDot, type StatusTone } from "@/components/ext/status-dot";
import { MicroPill } from "@/components/ext/micro-pill";
import { AvatarCircle } from "@/components/ext/entity-header";
import { RelativeTime } from "@/components/ext/relative-time";
import { ClientHoverPreview } from "@/components/clients/client-hover-preview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMockData, type Client, type ClientStatus, type RiskLevel } from "@/lib/mock";
import { initialsFromName } from "@/lib/format";

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Активен",
  review: "На проверке",
  edd: "EDD",
  blocked: "Заблокирован",
};

const STATUS_TONE: Record<ClientStatus, StatusTone> = {
  active: "success",
  review: "warning",
  edd: "info",
  blocked: "danger",
};

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export function ClientsTable() {
  const router = useRouter();
  const data = useMockData();
  const users = data.users;
  const [riskFilter, setRiskFilter] = React.useState<Set<RiskLevel>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<Set<ClientStatus>>(new Set());
  const [typeFilter, setTypeFilter] = React.useState<Set<"individual" | "legal">>(new Set());

  const filtered = React.useMemo(
    () =>
      data.clients.filter((c) => {
        if (riskFilter.size && !riskFilter.has(c.riskLevel)) return false;
        if (statusFilter.size && !statusFilter.has(c.status)) return false;
        if (typeFilter.size && !typeFilter.has(c.type)) return false;
        return true;
      }),
    [data.clients, riskFilter, statusFilter, typeFilter],
  );

  const userById = React.useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const columns = React.useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Клиент",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <ClientHoverPreview client={c}>
              <Link
                href={`/clients/${c.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-start gap-2 min-w-0 group/clientcell"
              >
                <AvatarCircle initials={initialsFromName(c.fullName)} size="sm" hue={(c.id.charCodeAt(3) * 47) % 360} />
                <div className="flex flex-col leading-tight min-w-0 gap-0.5">
                  <span className="font-medium truncate group-hover/clientcell:underline">{c.fullName}</span>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span>{c.id}</span>
                    <MicroPill tone="info">{c.segment}</MicroPill>
                    {c.tags.map((t) => (
                      <MicroPill key={t} tone="muted">{t}</MicroPill>
                    ))}
                  </div>
                </div>
              </Link>
            </ClientHoverPreview>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Тип",
        cell: ({ getValue }) => (getValue() === "legal" ? "Юр. лицо" : "Физ. лицо"),
      },
      {
        accessorKey: "riskLevel",
        header: "Риск",
        sortingFn: (a, b) => RISK_ORDER[a.original.riskLevel] - RISK_ORDER[b.original.riskLevel],
        cell: ({ row }) => <RiskBadge level={row.original.riskLevel} />,
      },
      {
        accessorKey: "internalScore",
        header: "Скор",
        cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}</span>,
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => <StatusDot tone={STATUS_TONE[row.original.status]}>{STATUS_LABELS[row.original.status]}</StatusDot>,
      },
      {
        accessorKey: "responsibleId",
        header: "Ответственный",
        cell: ({ getValue }) => {
          const u = userById.get(getValue() as string);
          return <span className="text-sm">{u?.fullName ?? "—"}</span>;
        },
      },
      {
        accessorKey: "lastTransactionAt",
        header: "Посл. операция",
        cell: ({ getValue }) => <RelativeTime iso={getValue() as string} />,
      },
    ],
    [userById],
  );

  const toggleSet = <T,>(s: Set<T>, v: T): Set<T> => {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  return (
    <DataTable<Client>
      data={filtered}
      columns={columns}
      globalFilterPlaceholder="Поиск по имени, ID..."
      onRowClick={(c) => router.push(`/clients/${c.id}`)}
      pageSize={20}
      globalFilterFn={(row, _col, value) => {
        const c = row.original;
        const q = String(value).toLowerCase();
        return c.fullName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.iin ?? c.bin ?? "").includes(q);
      }}
      filters={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                Риск
                {riskFilter.size ? <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{riskFilter.size}</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Уровень риска</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["low", "medium", "high", "critical"] as RiskLevel[]).map((r) => (
                <DropdownMenuCheckboxItem
                  key={r}
                  checked={riskFilter.has(r)}
                  onCheckedChange={() => setRiskFilter((s) => toggleSet(s, r))}
                >
                  <RiskBadge level={r} />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                Статус
                {statusFilter.size ? <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{statusFilter.size}</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Статус клиента</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS_LABELS) as ClientStatus[]).map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilter.has(s)}
                  onCheckedChange={() => setStatusFilter((set) => toggleSet(set, s))}
                >
                  {STATUS_LABELS[s]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                Тип
                {typeFilter.size ? <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{typeFilter.size}</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Тип клиента</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={typeFilter.has("individual")}
                onCheckedChange={() => setTypeFilter((s) => toggleSet(s, "individual"))}
              >
                Физ. лицо
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter.has("legal")}
                onCheckedChange={() => setTypeFilter((s) => toggleSet(s, "legal"))}
              >
                Юр. лицо
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      toolbar={
        <>
          <Button size="sm" variant="outline">
            <Download className="size-4" />
            Экспорт
          </Button>
          <Button size="sm">
            <Plus className="size-4" />
            Добавить клиента
          </Button>
        </>
      }
    />
  );
}
