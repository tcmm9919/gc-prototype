"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Filter } from "lucide-react";
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

// RU-метки для технических значений действий (интерфейс полностью русский)
const ACTION_LABEL: Record<AuditAction, string> = {
  "Создание": "Создание",
  "Обновление": "Обновление",
  "Удаление": "Удаление",
  "Вход": "Вход",
  "Одобрение": "Одобрение",
  "Отправка": "Отправка",
  run: "Запуск",
  recalculate: "Пересчёт",
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
  risk: "Риск",
  "risk-attributes": "Риск-атрибуты",
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
      meta: { width: "minmax(0, 2fr)" },
      cell: ({ getValue }) => (
        <StatusBadge tone={ACTION_TONE[getValue() as AuditAction]}>{ACTION_LABEL[getValue() as AuditAction]}</StatusBadge>
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
      meta: { width: "minmax(0, 1.3fr)" },
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
      meta: { width: "minmax(0, 0.9fr)" },
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
      bordered
      data={filtered}
      columns={columns}
      globalFilterPlaceholder="Поиск по действию, пользователю, IP..."
      pageSize={30}
      renderMobileCard={(e) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 truncate text-sm">
              {e.entityType ? RESOURCE_LABEL[e.entityType] : "Событие"}
            </span>
            <StatusBadge tone={ACTION_TONE[e.action]}>{ACTION_LABEL[e.action]}</StatusBadge>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2.5 text-xs text-muted-foreground">
            <span className="truncate">{userDisplay(e.userId)}</span>
            <span className="font-mono">{e.ip}</span>
            <span className="ml-auto shrink-0 tabular-nums">{formatDateTime(e.timestamp)}</span>
          </div>
        </div>
      )}
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
      filters={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
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
                  {ACTION_LABEL[a]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
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
      toolbar={
        <Button variant="outline" size="xl">
          <Download className="size-4" />
          Экспорт CSV
        </Button>
      }
    />
  );
}
