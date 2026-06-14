"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Power, PowerOff, RotateCcw, Trash2 } from "lucide-react";
import { useMockData, useMockStore, type Rule, type RuleEntity } from "@/lib/mock";
import { toast } from "sonner";
import { type DataTableView } from "@/components/ext/data-table";
import { DataTable } from "@/components/ext/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";

const ENTITY_LABEL: Record<RuleEntity, string> = {
  client: "Клиент",
  transaction: "Транзакция",
  group: "Группа",
};

const RULES_VIEWS: DataTableView<Rule>[] = [
  { id: "all", label: "Все" },
  {
    id: "active",
    label: "Активные",
    icon: <Power className="size-3.5 text-primary" />,
    predicate: (r) => r.enabled === true,
  },
  {
    id: "disabled",
    label: "Выключенные",
    icon: <PowerOff className="size-3.5 text-muted-foreground" />,
    predicate: (r) => r.enabled === false,
  },
];

export function RulesTable() {
  const router = useRouter();
  const data = useMockData();
  const userById = React.useMemo(() => new Map(data.users.map((u) => [u.id, u])), [data.users]);

  const columns: ColumnDef<Rule>[] = [
    {
      accessorKey: "name",
      header: "Название",
      meta: { width: "minmax(0, 1.6fr)" },
      cell: ({ row }) => (
        <Link href={`/rules/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      meta: { width: "minmax(0, 2.2fr)" },
      cell: ({ getValue }) => <span className="text-muted-foreground line-clamp-1">{getValue() as string}</span>,
    },
    {
      accessorKey: "entity",
      header: "Сущность",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ getValue }) => ENTITY_LABEL[getValue() as RuleEntity],
    },
    {
      accessorKey: "enabled",
      header: "Статус",
      meta: { width: "minmax(0, 0.85fr)" },
      cell: ({ getValue }) =>
        getValue() ? <StatusBadge tone="success">Включено</StatusBadge> : <StatusBadge tone="muted">Выключено</StatusBadge>,
    },
    {
      accessorKey: "authorId",
      header: "Автор",
      meta: { width: "minmax(0, 1.2fr)" },
      cell: ({ getValue }) => userById.get(getValue() as string)?.fullName ?? "—",
    },
    {
      accessorKey: "updatedAt",
      header: "Обновлено",
      cell: ({ getValue }) => <RelativeTime iso={getValue() as string} />,
    },
  ];

  return (
    <DataTable<Rule>
      data={data.rules}
      views={RULES_VIEWS}
      columns={columns}
      globalFilterPlaceholder="Поиск по названию или описанию..."
      onRowClick={(r) => router.push(`/rules/${r.id}`)}
      pageSize={20}
      toolbar={
        <Button asChild size="xl">
          <Link href="/rules/new">
            <Plus className="size-4" />
            Новое правило
          </Link>
        </Button>
      }
      bulkActions={(selected, clear) => {
        const ids = selected.map((r) => r.id);
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                const snapshot = useMockStore.getState().data.rules.filter((r) => ids.includes(r.id));
                useMockStore.getState().bulkUpdateRules(ids, { enabled: true });
                toast.success(`Включено правил: ${ids.length}`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertRules(snapshot),
                  },
                });
                clear();
              }}
            >
              <Power className="size-3.5" />
              Включить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                const snapshot = useMockStore.getState().data.rules.filter((r) => ids.includes(r.id));
                useMockStore.getState().bulkUpdateRules(ids, { enabled: false });
                toast.success(`Выключено правил: ${ids.length}`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertRules(snapshot),
                  },
                });
                clear();
              }}
            >
              <PowerOff className="size-3.5" />
              Выключить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                toast.info(`Пересчёт запущен для ${ids.length} правил`);
                clear();
              }}
            >
              <RotateCcw className="size-3.5" />
              Пересчёт
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-400/10 h-7"
              onClick={() => {
                const snapshot = useMockStore.getState().data.rules.filter((r) => ids.includes(r.id));
                useMockStore.getState().bulkRemoveRules(ids);
                toast.warning(`Удалено правил: ${ids.length}`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertRules(snapshot),
                  },
                });
                clear();
              }}
            >
              <Trash2 className="size-3.5" />
              Удалить
            </Button>
          </>
        );
      }}
      emptyAction={
        <Button asChild size="sm" variant="outline">
          <Link href="/rules/new">
            <Plus className="size-4" />
            Создать правило
          </Link>
        </Button>
      }
    />
  );
}
