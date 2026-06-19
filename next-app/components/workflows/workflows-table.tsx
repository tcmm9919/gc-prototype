"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, User, Users } from "lucide-react";

import { useMockData, type ComplianceScenario } from "@/lib/mock";
import { DataTable, type DataTableView } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { Button } from "@/components/ui/button";

const TYPE_LABEL = { client: "Клиентский", group: "Групповой" } as const;
const TYPE_TONE = { client: "info", group: "warning" } as const;

// TODO[ночной-прогон]: спека §4.1–4.2 описывает 3 таба с Групповой/Встроенный disabled+tooltip.
// Модель знает только type "client" | "group" (нет "embedded"), а DataTableView не поддерживает
// disabled/tooltip. Реализовано как обычные views по существующим типам — без disabled-состояния.
const WORKFLOW_VIEWS: DataTableView<ComplianceScenario>[] = [
  { id: "client", label: "Клиентский", icon: <User className="size-3.5" />, predicate: (s) => s.type === "client" },
  { id: "group", label: "Групповой", icon: <Users className="size-3.5" />, predicate: (s) => s.type === "group" },
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
      pageSize={20}
      globalFilterFn={(row, _col, value) => {
        const s = row.original;
        const q = String(value).toLowerCase();
        return s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      }}
      toolbar={
        <Button asChild size="xl">
          <Link href="/workflows/builder">
            <Plus className="size-4" />
            Создать сценарий
          </Link>
        </Button>
      }
      emptyAction={
        <Button asChild size="sm" variant="outline">
          <Link href="/workflows/builder">
            <Plus className="size-4" />
            Создать сценарий
          </Link>
        </Button>
      }
    />
  );
}
