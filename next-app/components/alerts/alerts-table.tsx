"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertOctagon, Check, ChevronUp, Filter, Flame, MessageCircle, User, X as XIcon } from "lucide-react";

import { currentUser, useMockData, useMockStore, type Alert, type AlertSeverity, type AlertStatus } from "@/lib/mock";
import { type DataTableView } from "@/components/ext/data-table";
import { toast } from "sonner";
import { DataTable } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  critical: "Критическая",
};

const SEVERITY_TONE: Record<AlertSeverity, "info" | "warning" | "danger"> = {
  low: "info",
  medium: "warning",
  high: "warning",
  critical: "danger",
};

const SEVERITY_ORDER: Record<AlertSeverity, number> = { low: 0, medium: 1, high: 2, critical: 3 };

const STATUS_LABEL: Record<AlertStatus, string> = {
  new: "Открыто",
  in_progress: "На проверке",
  rejected: "Отклонено",
  escalated: "Эскалировано",
  closed: "Закрыто",
};

const STATUS_TONE: Record<AlertStatus, "info" | "warning" | "muted" | "danger" | "success"> = {
  new: "info",
  in_progress: "warning",
  rejected: "danger",
  escalated: "danger",
  closed: "muted",
};

function isInRedSLAZone(deadlineIso: string | undefined): boolean {
  if (!deadlineIso) return false;
  const remaining = (new Date(deadlineIso).getTime() - Date.now()) / 60000;
  return remaining < 60 && remaining >= 0;
}

const ALERTS_VIEWS: DataTableView<Alert>[] = [
  { id: "all", label: "Все" },
  {
    id: "red-zone",
    label: "Красная зона",
    icon: <AlertOctagon className="size-3.5 text-risk-critical" />,
    predicate: (a) => isInRedSLAZone(a.deadline) && a.status !== "closed",
  },
  {
    id: "my-queue",
    label: "На мне",
    icon: <User className="size-3.5" />,
    predicate: (a) => a.responsibleId === currentUser.id && a.status !== "closed",
  },
  {
    id: "critical",
    label: "Критические",
    icon: <Flame className="size-3.5 text-risk-critical" />,
    predicate: (a) => a.severity === "critical",
  },
  {
    id: "client-responded",
    label: "Клиент ответил",
    icon: <MessageCircle className="size-3.5" />,
    predicate: (a) => (a as Alert & { client_chat_status?: string }).client_chat_status === "client_responded",
  },
];

export function AlertsTable() {
  const router = useRouter();
  const data = useMockData();
  const clientById = React.useMemo(() => new Map(data.clients.map((c) => [c.id, c])), [data.clients]);

  const [sevFilter, setSevFilter] = React.useState<Set<AlertSeverity>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<Set<AlertStatus>>(new Set());

  const filtered = React.useMemo(
    () =>
      data.alerts.filter((a) => {
        if (sevFilter.size && !sevFilter.has(a.severity)) return false;
        if (statusFilter.size && !statusFilter.has(a.status)) return false;
        return true;
      }),
    [data.alerts, sevFilter, statusFilter],
  );

  const caseByAlertId = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data.cases) {
      for (const aid of c.linkedAlertIds) {
        map.set(aid, c.id);
      }
    }
    return map;
  }, [data.cases]);

  const columns: ColumnDef<Alert>[] = [
    {
      accessorKey: "id",
      header: "Идентификатор",
      cell: ({ getValue }) => (
        <Link href={`/alerts/${getValue()}`} className="font-mono text-xs text-primary hover:underline">
          {getValue() as string}
        </Link>
      ),
    },
    {
      accessorKey: "ruleName",
      header: "Оповещение",
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-[420px]">
          <span className="text-sm font-medium">Срабатывание правила</span>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Rule &apos;{row.original.ruleName}&apos; triggered by transaction {row.original.transactionId ?? "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Важность",
      sortingFn: (a, b) => SEVERITY_ORDER[a.original.severity] - SEVERITY_ORDER[b.original.severity],
      cell: ({ row }) => <StatusBadge tone={SEVERITY_TONE[row.original.severity]}>{SEVERITY_LABEL[row.original.severity]}</StatusBadge>,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <StatusBadge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</StatusBadge>,
    },
    {
      id: "case",
      header: "Кейс",
      cell: ({ row }) => {
        const caseId = caseByAlertId.get(row.original.id);
        if (!caseId) return <span className="text-muted-foreground">—</span>;
        return (
          <Link
            href={`/cases/${caseId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/15"
          >
            Кейсы
          </Link>
        );
      },
    },
    { accessorKey: "date", header: "Создано", cell: ({ getValue }) => <RelativeTime iso={getValue() as string} /> },
  ];

  const toggle = <T,>(s: Set<T>, v: T): Set<T> => {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  return (
    <DataTable<Alert>
      data={filtered}
      views={ALERTS_VIEWS}
      columns={columns}
      globalFilterPlaceholder="Поиск по ID, клиенту, правилу..."
      onRowClick={(a) => router.push(`/alerts/${a.id}`)}
      pageSize={25}
      globalFilterFn={(row, _col, value) => {
        const a = row.original;
        const q = String(value).toLowerCase();
        const client = clientById.get(a.clientId);
        return (
          a.id.toLowerCase().includes(q) ||
          a.ruleName.toLowerCase().includes(q) ||
          (client?.fullName ?? "").toLowerCase().includes(q)
        );
      }}
      bulkActions={(selected, clear) => {
        const ids = selected.map((a) => a.id);
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                const snapshot = [...selected];
                const caseIds = useMockStore.getState().takeAlertsToWork(ids);
                toast.success(`${ids.length} оповещений взяты в работу`, {
                  description: `Создано кейсов: ${caseIds.length}`,
                  action: {
                    label: "Отменить",
                    onClick: () => {
                      useMockStore.getState().bulkRemoveCases(caseIds);
                      useMockStore.getState().bulkUpsertAlerts(snapshot);
                    },
                  },
                });
                clear();
              }}
            >
              <Check className="size-3.5" />
              Взять в работу
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                const snapshot = [...selected];
                useMockStore.getState().bulkUpdateAlerts(ids, {
                  severity: "critical",
                  status: "escalated",
                });
                toast.success(`${ids.length} оповещений эскалированы`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertAlerts(snapshot),
                  },
                });
                clear();
              }}
            >
              <ChevronUp className="size-3.5" />
              Эскалировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-400/10 h-7"
              onClick={() => {
                const snapshot = [...selected];
                useMockStore.getState().bulkRemoveAlerts(ids);
                toast.warning(`${ids.length} оповещений закрыты`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertAlerts(snapshot),
                  },
                });
                clear();
              }}
            >
              <XIcon className="size-3.5" />
              Закрыть
            </Button>
          </>
        );
      }}
      filters={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Серьёзность
                {sevFilter.size ? <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{sevFilter.size}</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Уровень</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["low", "medium", "high", "critical"] as AlertSeverity[]).map((s) => (
                <DropdownMenuCheckboxItem key={s} checked={sevFilter.has(s)} onCheckedChange={() => setSevFilter((set) => toggle(set, s))}>
                  {SEVERITY_LABEL[s]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Статус
                {statusFilter.size ? <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{statusFilter.size}</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Статус</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS_LABEL) as AlertStatus[]).map((s) => (
                <DropdownMenuCheckboxItem key={s} checked={statusFilter.has(s)} onCheckedChange={() => setStatusFilter((set) => toggle(set, s))}>
                  {STATUS_LABEL[s]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}
