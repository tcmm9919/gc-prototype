"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Power, PowerOff, RotateCcw, Trash2 } from "lucide-react";
import { useMockData, useMockStore, type Rule, type RuleCategory, type AlertSeverity } from "@/lib/mock";
import { toast } from "sonner";
import { type DataTableView } from "@/components/ext/data-table";
import { DataTable } from "@/components/ext/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";

const CATEGORY_LABEL: Record<RuleCategory, string> = {
  transaction: "Транзакции",
  client: "Клиенты",
  screening: "Скрининг",
  behavior: "Поведение",
};
const SEVERITY_LABEL: Record<AlertSeverity, string> = { critical: "Критический", high: "Высокий", medium: "Средний", low: "Низкий" };
const SEVERITY_TONE: Record<AlertSeverity, "danger" | "warning" | "info"> = { critical: "danger", high: "warning", medium: "warning", low: "info" };

const RULES_VIEWS: DataTableView<Rule>[] = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные", predicate: (r) => r.enabled === true && !r.draft },
  { id: "disabled", label: "Выключенные", predicate: (r) => r.enabled === false && !r.draft },
  { id: "draft", label: "Черновик", predicate: (r) => r.draft === true },
];

export function RulesTable() {
  const router = useRouter();
  const data = useMockData();

  const columns: ColumnDef<Rule>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "minmax(0, 0.7fr)" },
      cell: ({ row }) => (
        <Link href={`/rules/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
          {row.original.id}
        </Link>
      ),
    },
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
      accessorKey: "category",
      header: "Категория",
      meta: { width: "minmax(0, 0.95fr)" },
      cell: ({ getValue }) => CATEGORY_LABEL[(getValue() as RuleCategory) ?? "transaction"] ?? "—",
    },
    {
      id: "severity",
      header: "Важность",
      meta: { width: "minmax(0, 0.85fr)" },
      cell: ({ row }) => {
        const s = row.original.severity ?? "high";
        return <StatusBadge tone={SEVERITY_TONE[s]}>{SEVERITY_LABEL[s]}</StatusBadge>;
      },
    },
    {
      accessorKey: "enabled",
      header: "Статус",
      meta: { width: "minmax(0, 0.85fr)" },
      cell: ({ row }) =>
        row.original.draft ? (
          <StatusBadge tone="info">Черновик</StatusBadge>
        ) : row.original.enabled ? (
          <StatusBadge tone="success">Включено</StatusBadge>
        ) : (
          <StatusBadge tone="muted">Выключено</StatusBadge>
        ),
    },
    {
      accessorKey: "version",
      header: "Версия",
      meta: { width: "minmax(0, 0.55fr)" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">v{(getValue() as number) ?? 1}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Обновлено",
      cell: ({ getValue }) => <RelativeTime iso={getValue() as string} />,
    },
    {
      id: "actions",
      header: "Действия",
      meta: { width: "minmax(0, 0.95fr)" },
      cell: ({ row }) => {
        const rule = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              const next = !rule.enabled;
              useMockStore.getState().bulkUpdateRules([rule.id], { enabled: next });
              toast.success(next ? `Правило включено` : `Правило деактивировано`, {
                action: {
                  label: "Отменить",
                  onClick: () => useMockStore.getState().bulkUpdateRules([rule.id], { enabled: rule.enabled }),
                },
              });
            }}
          >
            {rule.enabled ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
            {rule.enabled ? "Деактивировать" : "Включить"}
          </Button>
        );
      },
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
