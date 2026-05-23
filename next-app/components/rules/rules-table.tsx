"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMockData, type Rule, type RuleEntity } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";

const ENTITY_LABEL: Record<RuleEntity, string> = {
  client: "Клиент",
  transaction: "Транзакция",
  group: "Группа",
};

export function RulesTable() {
  const router = useRouter();
  const data = useMockData();
  const userById = React.useMemo(() => new Map(data.users.map((u) => [u.id, u])), [data.users]);

  const columns: ColumnDef<Rule>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <Link href={`/rules/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Описание",
      cell: ({ getValue }) => <span className="text-muted-foreground line-clamp-1">{getValue() as string}</span>,
    },
    {
      accessorKey: "entity",
      header: "Сущность",
      cell: ({ getValue }) => ENTITY_LABEL[getValue() as RuleEntity],
    },
    {
      accessorKey: "enabled",
      header: "Статус",
      cell: ({ getValue }) =>
        getValue() ? <StatusBadge tone="success">Включено</StatusBadge> : <StatusBadge tone="muted">Выключено</StatusBadge>,
    },
    {
      accessorKey: "authorId",
      header: "Автор",
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
    />
  );
}
