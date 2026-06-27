"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, User, Users } from "lucide-react";

import { useMockData, type ComplianceScenario, type ScenarioType } from "@/lib/mock";
import { DataTable, type DataTableView } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_LABEL = { client: "Клиентский", group: "Групповой", embedded: "Встроенный" } as const;
const TYPE_TONE = { client: "info", group: "warning", embedded: "muted" } as const;

// 3 типа сценариев под PRD: Клиентский / Групповой / Встроенный.
const WORKFLOW_VIEWS: DataTableView<ComplianceScenario>[] = [
  { id: "client", label: "Клиентский", predicate: (s) => s.type === "client" },
  { id: "group", label: "Групповой", predicate: (s) => s.type === "group" },
  { id: "embedded", label: "Встроенный", predicate: (s) => s.type === "embedded" },
];

// Типы для меню «Создать» — с описанием (PRD).
const CREATE_TYPES: { type: ScenarioType; label: string; description: string }[] = [
  { type: "client", label: "Клиентский", description: "Сценарий запускается по одному клиенту" },
  { type: "group", label: "Групповой", description: "Применяется к группе клиентов / списку / сегменту" },
  { type: "embedded", label: "Встроенный", description: "Запускается внутри другого процесса или системы" },
];

export function WorkflowsTable() {
  const router = useRouter();
  const data = useMockData();

  const columns: ColumnDef<ComplianceScenario>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "minmax(0, 0.8fr)" },
      cell: ({ row }) => (
        <Link href={`/workflows/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
          #{row.original.id.replace(/^SC-?/, "")}
        </Link>
      ),
    },
    {
      accessorKey: "name",
      header: "Название",
      meta: { width: "minmax(0, 2fr)" },
      cell: ({ row }) => (
        <Link href={`/workflows/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => <StatusBadge tone={TYPE_TONE[row.original.type]}>{TYPE_LABEL[row.original.type]}</StatusBadge>,
    },
    {
      accessorKey: "createdAt",
      header: "Создано",
      cell: ({ getValue }) => {
        const iso = getValue() as string | undefined;
        return iso ? <RelativeTime iso={iso} /> : <span className="text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <DataTable<ComplianceScenario>
      data={data.scenarios}
      views={WORKFLOW_VIEWS}
      columns={columns}
      globalFilterPlaceholder="Поиск по ID, названию..."
      onRowClick={(s) => router.push(`/workflows/${s.id}`)}
      renderMobileCard={(s) => {
        const desc = (s as ComplianceScenario & { description?: string }).description;
        return (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate font-medium text-foreground">{s.name}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">#{s.id.replace(/^SC-?/, "")}</span>
            </div>
            {desc ? <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p> : null}
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
              <StatusBadge tone={TYPE_TONE[s.type]}>{TYPE_LABEL[s.type]}</StatusBadge>
              {s.createdAt ? (
                <span className="ml-auto text-xs text-muted-foreground"><RelativeTime iso={s.createdAt} /></span>
              ) : null}
            </div>
          </div>
        );
      }}
      pageSize={20}
      globalFilterFn={(row, _col, value) => {
        const s = row.original;
        const q = String(value).toLowerCase();
        return s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      }}
      toolbar={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="xl">
              <Plus className="size-4" />
              Создать
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Тип сценария</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {CREATE_TYPES.map((t) => (
              <DropdownMenuItem
                key={t.type}
                className="flex-col items-start gap-0.5 py-2"
                onClick={() => router.push(`/workflows/builder?type=${t.type}`)}
              >
                <span className="text-sm font-medium">{t.label}</span>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
      emptyAction={
        <Button asChild size="sm" variant="outline">
          <Link href="/workflows/builder?type=client">
            <Plus className="size-4" />
            Создать сценарий
          </Link>
        </Button>
      }
    />
  );
}
