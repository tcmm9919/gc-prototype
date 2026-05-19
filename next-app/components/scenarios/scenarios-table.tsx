"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import { useMockData, type ComplianceScenario, type ScenarioType } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const STATUS_LABEL = {
  active: "Активен",
  paused: "Приостановлен",
  draft: "Черновик",
} as const;

const STATUS_TONE = {
  active: "success",
  paused: "warning",
  draft: "muted",
} as const;

export function ScenariosTable() {
  const router = useRouter();
  const data = useMockData();
  const userById = React.useMemo(() => new Map(data.users.map((u) => [u.id, u])), [data.users]);

  const columns: ColumnDef<ComplianceScenario>[] = [
    {
      accessorKey: "name",
      header: "Название",
      cell: ({ row }) => (
        <Link href={`/workflows/${row.original.id}`} className="font-medium hover:underline">
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
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <StatusBadge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</StatusBadge>,
    },
    {
      accessorKey: "triggerCount",
      header: "Сработок",
      cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}</span>,
    },
    {
      accessorKey: "precision",
      header: "Precision",
      cell: ({ getValue }) => <span className="tabular-nums">{((getValue() as number) * 100).toFixed(0)}%</span>,
    },
    {
      accessorKey: "lastRunAt",
      header: "Последний запуск",
      cell: ({ getValue }) => <RelativeTime iso={getValue() as string} />,
    },
    {
      accessorKey: "authorId",
      header: "Автор",
      cell: ({ getValue }) => userById.get(getValue() as string)?.fullName ?? "—",
    },
  ];

  const byType = (type: ScenarioType) => data.scenarios.filter((s) => s.type === type);

  return (
    <Tabs defaultValue="client" className="m-0">
      <div className="border-b border-border px-6">
        <TabsList className="-mb-px h-10 bg-transparent p-0">
          <TabsTrigger value="client" className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            Клиентские
          </TabsTrigger>
          <TabsTrigger value="group" className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            Групповые
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="client" className="m-0">
        <DataTable<ComplianceScenario>
          data={byType("client")}
          columns={columns}
          globalFilterPlaceholder="Поиск по названию..."
          onRowClick={(s) => router.push(`/workflows/${s.id}`)}
          pageSize={15}
        />
      </TabsContent>
      <TabsContent value="group" className="m-0">
        <DataTable<ComplianceScenario>
          data={byType("group")}
          columns={columns}
          globalFilterPlaceholder="Поиск по названию..."
          onRowClick={(s) => router.push(`/workflows/${s.id}`)}
          pageSize={15}
        />
      </TabsContent>
    </Tabs>
  );
}
