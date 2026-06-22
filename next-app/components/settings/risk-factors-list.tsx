"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useMockData, type RiskFactor } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TYPE_LABEL: Record<RiskFactor["type"], string> = {
  scoring_history: "Скоринг",
  client_field: "Поле клиента",
  transaction: "Транзакция",
  media: "Медиа",
  custom: "Кастомное",
};

export function RiskFactorsList({
  onEdit,
  onAdd,
}: {
  onEdit?: (f: RiskFactor) => void;
  onAdd?: () => void;
}) {
  const data = useMockData();
  const [removedIds, setRemovedIds] = React.useState<ReadonlySet<string>>(new Set());
  const [pendingDelete, setPendingDelete] = React.useState<RiskFactor | null>(null);
  const factors = React.useMemo(
    () => data.riskFactors.filter((f) => !removedIds.has(f.id)),
    [data.riskFactors, removedIds],
  );
  const totalWeight = factors.reduce((s, f) => s + (f.active ? f.weight : 0), 0) || 1;

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setRemovedIds((prev) => new Set(prev).add(pendingDelete.id));
    toast.success(`Фактор «${pendingDelete.name}» удалён`);
    setPendingDelete(null);
  };

  const columns: ColumnDef<RiskFactor>[] = [
    {
      accessorKey: "name",
      header: "Название",
      meta: { width: "minmax(0, 2fr)" },
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">{row.original.name}</div>
          <div className="truncate text-xs text-muted-foreground">{row.original.description}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => <StatusBadge tone="muted">{TYPE_LABEL[row.original.type]}</StatusBadge>,
    },
    {
      accessorKey: "source",
      header: "Источник",
      meta: { width: "minmax(0, 1.4fr)" },
      cell: ({ getValue }) => (
        <span className="truncate font-mono text-xs text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      id: "buckets",
      header: "Корзины",
      cell: ({ row }) => (
        <div className="flex items-end gap-0.5" title={`${row.original.buckets.length} корзин`}>
          {row.original.buckets.slice(0, 6).map((b, i) => (
            <span
              key={i}
              className="w-1.5 rounded-sm bg-primary/70"
              style={{ height: `${4 + (b.score / 100) * 16}px` }}
            />
          ))}
          <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{row.original.buckets.length}</span>
        </div>
      ),
    },
    {
      accessorKey: "weight",
      header: "Вес · доля",
      cell: ({ row }) => {
        const f = row.original;
        const share = f.active ? Math.round((f.weight / totalWeight) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-foreground/[0.08]">
              <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
            </div>
            <span className="font-mono text-xs tabular-nums text-foreground">{f.weight}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Активен",
      cell: ({ row }) => (
        <StatusBadge tone={row.original.active ? "success" : "muted"}>
          {row.original.active ? "Активен" : "Выкл."}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      meta: { width: "84px" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-8" aria-label={`Редактировать «${row.original.name}»`} onClick={() => onEdit?.(row.original)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-risk-critical"
            aria-label={`Удалить «${row.original.name}»`}
            onClick={() => setPendingDelete(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable<RiskFactor>
        data={factors}
        columns={columns}
        globalFilterPlaceholder="Поиск по названию, источнику..."
        onRowClick={(f) => onEdit?.(f)}
        rowLabel={(f) => `Риск-фактор ${f.name}`}
        pageSize={20}
        globalFilterFn={(row, _col, value) => {
          const f = row.original;
          const q = String(value).toLowerCase();
          return f.name.toLowerCase().includes(q) || f.source.toLowerCase().includes(q);
        }}
        toolbar={
          <Button size="xl" onClick={() => onAdd?.()}>
            <Plus className="size-4" />
            Добавить атрибут
          </Button>
        }
        emptyAction={
          <Button size="sm" variant="outline" onClick={() => onAdd?.()}>
            <Plus className="size-4" />
            Добавить атрибут
          </Button>
        }
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить риск-фактор?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `«${pendingDelete.name}» будет удалён из модели скоринга. Вес фактора перестанет учитываться. Действие необратимо.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-risk-critical text-risk-critical-foreground hover:bg-risk-critical/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
