"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { useMockData, type AuditAction, type AuditEvent, type AuditResource } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTIONS: ReadonlyArray<AuditAction> = [
  "Создание",
  "Обновление",
  "Удаление",
  "Вход",
  "Одобрение",
  "Отправка",
  "run",
  "recalculate",
];

const ACTION_TONE: Record<AuditAction, "success" | "warning" | "danger" | "muted" | "info"> = {
  "Создание": "info",
  "Обновление": "warning",
  "Удаление": "danger",
  "Вход": "muted",
  "Одобрение": "success",
  "Отправка": "info",
  run: "muted",
  recalculate: "muted",
};

const RESOURCES: ReadonlyArray<AuditResource> = [
  "client",
  "transaction",
  "alert",
  "case",
  "rule",
  "scenario",
  "report",
  "risk",
  "risk-attributes",
];

const RESOURCE_LABEL: Record<AuditResource, string> = {
  client: "Клиент",
  transaction: "Транзакция",
  alert: "Алерт",
  case: "Кейс",
  rule: "Правило",
  scenario: "Сценарий",
  report: "Отчёт",
  agent: "Агент",
  settings: "Настройки",
  risk: "risk",
  "risk-attributes": "risk-attributes",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function AuditTable() {
  const data = useMockData();
  const userById = React.useMemo(() => new Map(data.users.map((u) => [u.id, u])), [data.users]);
  const [actionFilter, setActionFilter] = React.useState<Set<AuditAction>>(new Set());
  const [resourceFilter, setResourceFilter] = React.useState<Set<AuditResource>>(new Set());

  const userDisplay = (userId: string): string => {
    if (userId === "system") return "system";
    if (userId === "compliance-officer-ai") return "Compliance Officer AI";
    const u = userById.get(userId);
    return u?.email ?? u?.fullName ?? userId;
  };

  const filtered = React.useMemo(
    () =>
      data.audit.filter((e) => {
        if (actionFilter.size && !actionFilter.has(e.action)) return false;
        if (resourceFilter.size && (!e.entityType || !resourceFilter.has(e.entityType))) return false;
        return true;
      }),
    [data.audit, actionFilter, resourceFilter],
  );

  const columns: ColumnDef<AuditEvent>[] = [
    {
      accessorKey: "timestamp",
      header: "Время",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm whitespace-nowrap">{formatDateTime(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "action",
      header: "Действие",
      cell: ({ getValue }) => (
        <StatusBadge tone={ACTION_TONE[getValue() as AuditAction]}>{getValue() as string}</StatusBadge>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Ресурс",
      cell: ({ getValue }) => {
        const t = getValue() as AuditResource | undefined;
        return t ? <span className="text-sm">{RESOURCE_LABEL[t]}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: "userId",
      header: "Пользователь",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        const display = userDisplay(id);
        const isSpecial = id === "system" || id === "compliance-officer-ai";
        return (
          <span className={isSpecial ? "font-medium" : ""}>
            {display}
          </span>
        );
      },
    },
    {
      accessorKey: "ip",
      header: "IP",
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() as string}</span>,
    },
  ];

  const toggle = <T,>(s: Set<T>, v: T): Set<T> => {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  return (
    <DataTable<AuditEvent>
      data={filtered}
      columns={columns}
      globalFilterPlaceholder="Поиск по действию, пользователю, IP..."
      pageSize={30}
      globalFilterFn={(row, _c, value) => {
        const q = String(value).toLowerCase();
        const e = row.original;
        return (
          e.action.toLowerCase().includes(q) ||
          userDisplay(e.userId).toLowerCase().includes(q) ||
          e.ip.includes(q) ||
          (e.entityId ?? "").toLowerCase().includes(q) ||
          (e.entityType ?? "").toLowerCase().includes(q)
        );
      }}
      toolbar={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                Все действия
                {actionFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{actionFilter.size}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действие</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ACTIONS.map((a) => (
                <DropdownMenuCheckboxItem
                  key={a}
                  checked={actionFilter.has(a)}
                  onCheckedChange={() => setActionFilter((s) => toggle(s, a))}
                >
                  {a}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-4" />
                Все ресурсы
                {resourceFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{resourceFilter.size}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ресурс</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {RESOURCES.map((r) => (
                <DropdownMenuCheckboxItem
                  key={r}
                  checked={resourceFilter.has(r)}
                  onCheckedChange={() => setResourceFilter((s) => toggle(s, r))}
                >
                  {RESOURCE_LABEL[r]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}
