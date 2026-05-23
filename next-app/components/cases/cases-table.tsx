"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronUp, Filter, Flag, Plus, UserPlus, X as XIcon } from "lucide-react";

import { useMockData, useMockStore, currentUser, type Case, type CaseStatus } from "@/lib/mock";
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

const STATUS_LABEL: Record<CaseStatus, string> = {
  open: "Открыто",
  in_progress: "В работе",
  in_review: "На проверке",
  escalated: "Эскалировано",
  resolved: "Решено",
  closed: "Закрыто",
};

const STATUS_TONE: Record<CaseStatus, "info" | "warning" | "success" | "muted" | "danger"> = {
  open: "info",
  in_progress: "warning",
  in_review: "info",
  escalated: "danger",
  resolved: "success",
  closed: "muted",
};

export function CasesTable() {
  const router = useRouter();
  const data = useMockData();
  const clientById = React.useMemo(() => new Map(data.clients.map((c) => [c.id, c])), [data.clients]);
  const userById = React.useMemo(() => new Map(data.users.map((u) => [u.id, u])), [data.users]);
  const [statusFilter, setStatusFilter] = React.useState<Set<CaseStatus>>(new Set());

  const filtered = React.useMemo(
    () => data.cases.filter((c) => (statusFilter.size ? statusFilter.has(c.status) : true)),
    [data.cases, statusFilter],
  );

  const columns: ColumnDef<Case>[] = [
    {
      accessorKey: "id",
      header: "Кейс №",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link href={`/cases/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
            {row.original.id}
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[420px]">{row.original.description}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <StatusBadge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</StatusBadge>,
    },
    {
      accessorKey: "clientId",
      header: "Клиент",
      cell: ({ getValue }) => {
        const c = clientById.get(getValue() as string);
        if (!c) return <span className="text-muted-foreground">—</span>;
        return (
          <Link href={`/clients/${c.id}`} className="hover:underline">
            {c.fullName}
          </Link>
        );
      },
    },
    {
      accessorKey: "responsibleId",
      header: "Исполнитель",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        if (id === "USR-AI") return <span className="font-medium">Compliance Officer AI</span>;
        return userById.get(id)?.fullName ?? "—";
      },
    },
    { accessorKey: "openedAt", header: "Создано", cell: ({ getValue }) => <RelativeTime iso={getValue() as string} /> },
  ];

  const toggle = (s: Set<CaseStatus>, v: CaseStatus): Set<CaseStatus> => {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  return (
    <DataTable<Case>
      data={filtered}
      columns={columns}
      globalFilterPlaceholder="Поиск по ID, типу, клиенту..."
      onRowClick={(c) => router.push(`/cases/${c.id}`)}
      pageSize={20}
      globalFilterFn={(row, _col, value) => {
        const c = row.original;
        const q = String(value).toLowerCase();
        const client = clientById.get(c.clientId);
        return (
          c.id.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          (client?.fullName ?? "").toLowerCase().includes(q)
        );
      }}
      bulkActions={(selected, clear) => {
        const ids = selected.map((c) => c.id);
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                useMockStore.getState().bulkUpdateCases(ids, {
                  responsibleId: currentUser.id,
                });
                toast.success(`Назначено вам: ${ids.length}`);
                clear();
              }}
            >
              <UserPlus className="size-3.5" />
              Назначить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                useMockStore.getState().bulkUpdateCases(ids, {
                  status: "escalated",
                  priority: "critical",
                });
                toast.success(`${ids.length} кейсов эскалированы`);
                clear();
              }}
            >
              <ChevronUp className="size-3.5" />
              Эскалировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                useMockStore.getState().bulkUpdateCases(ids, { priority: "high" });
                toast.success(`Приоритет повышен: ${ids.length}`);
                clear();
              }}
            >
              <Flag className="size-3.5" />
              Приоритет
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-400/10 h-7"
              onClick={() => {
                useMockStore.getState().bulkUpdateCases(ids, {
                  status: "closed",
                  closed_at: new Date().toISOString(),
                });
                toast.warning(`${ids.length} кейсов закрыты`);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="xl">
              <Filter className="size-4" />
              Статус
              {statusFilter.size ? <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{statusFilter.size}</span> : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Статус кейса</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(STATUS_LABEL) as CaseStatus[]).map((s) => (
              <DropdownMenuCheckboxItem key={s} checked={statusFilter.has(s)} onCheckedChange={() => setStatusFilter((set) => toggle(set, s))}>
                {STATUS_LABEL[s]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
      toolbar={
        <Button asChild size="xl">
          <Link href="/cases/new">
            <Plus className="size-4" />
            Новый кейс
          </Link>
        </Button>
      }
    />
  );
}
