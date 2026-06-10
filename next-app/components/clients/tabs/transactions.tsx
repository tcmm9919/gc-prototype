"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMockData, type Transaction } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { Money } from "@/components/ext/money-kzt";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";

const TYPE_LABELS: Record<Transaction["type"], string> = {
  transfer: "Перевод",
  incoming: "Поступление",
  outgoing: "Списание",
  exchange: "Обмен",
  cash: "Кассовая",
};

const CHANNEL_LABELS: Record<Transaction["channel"], string> = {
  mobile: "Мобильное",
  web: "Web",
  branch: "Отделение",
  api: "API",
};

const STATUS_TONE: Record<Transaction["status"], "success" | "warning" | "danger"> = {
  completed: "success",
  review: "warning",
  blocked: "danger",
};

const STATUS_LABEL: Record<Transaction["status"], string> = {
  completed: "Проведена",
  review: "На проверке",
  blocked: "Заблокирована",
};

export function ClientTransactions({ clientId }: { clientId: string }) {
  const data = useMockData();
  const txs = data.transactions.filter((t) => t.clientId === clientId);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ getValue }) => (
        <Link href={`/transactions/${getValue()}`} className="font-mono text-xs text-primary hover:underline">
          {getValue() as string}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      header: "Дата",
      cell: ({ getValue }) => <RelativeTime iso={getValue() as string} />,
    },
    { accessorKey: "type", header: "Тип", cell: ({ getValue }) => TYPE_LABELS[getValue() as Transaction["type"]] },
    {
      accessorKey: "counterparty.name",
      header: "Контрагент",
      cell: ({ row }) => (
        <div className="flex flex-col leading-tight">
          <span>{row.original.counterparty.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.counterparty.country}</span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Сумма",
      cell: ({ row }) => <Money amount={row.original.amount} currency={row.original.currency} amountKZT={row.original.amountKZT} />,
    },
    { accessorKey: "channel", header: "Канал", cell: ({ getValue }) => CHANNEL_LABELS[getValue() as Transaction["channel"]] },
    { accessorKey: "riskLevel", header: "Риск", cell: ({ row }) => <RiskBadge level={row.original.riskLevel} /> },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <StatusBadge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</StatusBadge>,
    },
  ];

  return (
    <DataTable<Transaction>
      data={txs}
      columns={columns}
      bordered
      globalFilterPlaceholder="Поиск по ID, контрагенту..."
      emptyMessage="У клиента ещё нет операций"
      globalFilterFn={(row, _col, value) => {
        const t = row.original;
        const q = String(value).toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.counterparty.name.toLowerCase().includes(q) ||
          (t.purpose ?? "").toLowerCase().includes(q)
        );
      }}
    />
  );
}
