"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowUpRight, Ban, Bell, Check, Download, Filter, Flame, RotateCcw, TrendingUp } from "lucide-react";

import { useMockData, useMockStore, type RiskLevel, type Transaction } from "@/lib/mock";
import { type DataTableView } from "@/components/ext/data-table";
import { ExpandedPanel, Field, ExpandedActions } from "@/components/ext/expanded-panel";
import { toast } from "sonner";
import { DataTable } from "@/components/ext/data-table";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { ClientHoverPreview } from "@/components/clients/client-hover-preview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COMPLIANCE_STATUSES = ["Завершена", "Обработана", "Авто-отказ", "Ожидание", "Отклонена"] as const;
const PRIORITY_LABELS: Record<Transaction["priority"], string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};
const PRIORITY_TONE: Record<Transaction["priority"], "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const COMPLIANCE_TONE: Record<(typeof COMPLIANCE_STATUSES)[number], "success" | "warning" | "danger" | "muted"> = {
  "Завершена": "success",
  "Обработана": "success",
  "Авто-отказ": "danger",
  "Ожидание": "warning",
  "Отклонена": "danger",
};

const RISK_ORDER: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2, critical: 3 };

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + " " + currency;
}

function shortId(id: string): string {
  return id.split("-").slice(0, 2).join("-");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU");
}

const TRANSACTIONS_VIEWS: DataTableView<Transaction>[] = [
  { id: "all", label: "Все" },
  {
    id: "pending-review",
    label: "Ожидают review",
    icon: <AlertCircle className="size-3.5 text-risk-medium" />,
    predicate: (t) => t.complianceStatus === "Ожидание",
  },
  {
    id: "high-risk",
    label: "Высокий риск",
    icon: <Flame className="size-3.5 text-risk-critical" />,
    predicate: (t) => t.riskLevel === "critical" || t.riskLevel === "high",
  },
  {
    id: "large-amount",
    label: "> 1 млн KZT",
    icon: <TrendingUp className="size-3.5" />,
    predicate: (t) => t.amountKZT > 1_000_000,
  },
];

export function TransactionsTable() {
  const router = useRouter();
  const data = useMockData();
  const [riskFilter, setRiskFilter] = React.useState<Set<RiskLevel>>(new Set());
  const [priorityFilter, setPriorityFilter] = React.useState<Set<Transaction["priority"]>>(new Set());
  const [complianceFilter, setComplianceFilter] = React.useState<Set<Transaction["complianceStatus"]>>(new Set());
  const [currencyFilter, setCurrencyFilter] = React.useState<string>("");

  const clientById = React.useMemo(() => new Map(data.clients.map((c) => [c.id, c])), [data.clients]);

  const filtered = React.useMemo(
    () =>
      data.transactions.filter((t) => {
        if (riskFilter.size && !riskFilter.has(t.riskLevel)) return false;
        if (priorityFilter.size && !priorityFilter.has(t.priority)) return false;
        if (complianceFilter.size && !complianceFilter.has(t.complianceStatus)) return false;
        if (currencyFilter && t.currency !== currencyFilter) return false;
        return true;
      }),
    [data.transactions, riskFilter, priorityFilter, complianceFilter, currencyFilter],
  );

  const currencies = React.useMemo(
    () => Array.from(new Set(data.transactions.map((t) => t.currency))).sort(),
    [data.transactions],
  );

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: "Дата",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ getValue }) => <span className="tabular-nums text-sm">{formatDate(getValue() as string)}</span>,
    },
    {
      accessorKey: "id",
      header: "Идентификатор",
      meta: { width: "minmax(0, 0.85fr)" },
      cell: ({ getValue }) => (
        <Link
          href={`/transactions/${getValue()}`}
          className="font-mono text-xs text-primary hover:underline"
        >
          {shortId(getValue() as string)}
        </Link>
      ),
    },
    {
      accessorKey: "clientId",
      header: "Клиент",
      meta: { width: "minmax(0, 1.6fr)" },
      cell: ({ getValue }) => {
        const c = clientById.get(getValue() as string);
        if (!c) return <span className="text-muted-foreground">{String(getValue())}</span>;
        return (
          <ClientHoverPreview client={c}>
            <Link href={`/clients/${c.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
              {c.fullName}
            </Link>
          </ClientHoverPreview>
        );
      },
    },
    {
      id: "purpose",
      header: "Назначение",
      meta: { width: "minmax(0, 1.8fr)" },
      cell: ({ row }) => (
        <div className="flex items-start gap-1.5 max-w-[280px]">
          <span className="text-xs font-mono text-muted-foreground shrink-0">{row.original.purposeCode}</span>
          <span className="text-sm line-clamp-1">{row.original.purposeDescription}</span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Сумма",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm whitespace-nowrap">
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "amountKZT",
      header: "В тенге",
      cell: ({ row }) => (
        <span className="tabular-nums text-sm whitespace-nowrap text-muted-foreground">
          {formatAmount(row.original.amountKZT, "KZT")}
        </span>
      ),
    },
    {
      accessorKey: "complianceStatus",
      header: "Комплаенс",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ row }) => (
        <StatusBadge tone={COMPLIANCE_TONE[row.original.complianceStatus]}>
          {row.original.complianceStatus}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Приоритет",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ row }) => (
        <StatusBadge tone={PRIORITY_TONE[row.original.priority]}>
          {PRIORITY_LABELS[row.original.priority]}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "riskLevel",
      header: "Риск",
      meta: { width: "minmax(0, 0.8fr)" },
      sortingFn: (a, b) => RISK_ORDER[a.original.riskLevel] - RISK_ORDER[b.original.riskLevel],
      cell: ({ row }) => <RiskBadge level={row.original.riskLevel} />,
    },
    {
      accessorKey: "branchCode",
      header: "Филиал",
      meta: { width: "minmax(0, 0.8fr)" },
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() as string}</span>,
    },
  ];

  const toggle = <T,>(s: Set<T>, v: T): Set<T> => {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  return (
    <DataTable<Transaction>
      data={filtered}
      views={TRANSACTIONS_VIEWS}
      columns={columns}
      globalFilterPlaceholder="Поиск по ID, клиенту, назначению..."
      onRowClick={(t) => router.push(`/transactions/${t.id}`)}
      renderExpanded={(tx) => {
        const client = data.clients.find((c) => c.id === tx.clientId);
        const t = tx as Transaction & { branchName?: string; type?: string; channel?: string; additionalInfo?: string };
        return (
          <ExpandedPanel>
            <Field label="Код назначения">{tx.purposeCode}</Field>
            <Field label="Описание">{tx.purposeDescription}</Field>
            <Field label="Филиал">
              {t.branchName ? `${t.branchName} (${tx.branchCode})` : tx.branchCode}
            </Field>
            <Field label="Тип">{t.type ?? "—"}</Field>
            <Field label="Канал">{t.channel ?? "—"}</Field>
            <Field label="Контрагент">{tx.counterparty.name}</Field>
            <Field label="Клиент">
              {client ? (
                <Link href={`/clients/${client.id}`} className="hover:underline">
                  {client.fullName}
                </Link>
              ) : (
                "—"
              )}
            </Field>
            {t.additionalInfo && (
              <Field label="Доп. инфо" className="col-span-full">
                {t.additionalInfo}
              </Field>
            )}
            <ExpandedActions>
              <Button asChild size="sm" variant="outline">
                <Link href={`/transactions/${tx.id}`}>
                  <ArrowUpRight className="size-3.5" />
                  Открыть полностью
                </Link>
              </Button>
            </ExpandedActions>
          </ExpandedPanel>
        );
      }}
      pageSize={25}
      rowClassName={(t) =>
        t.riskLevel === "critical"
          ? "bg-risk-critical/[0.035] hover:bg-risk-critical/[0.07]"
          : t.riskLevel === "high"
            ? "bg-risk-high/[0.025] hover:bg-risk-high/[0.05]"
            : ""
      }
      globalFilterFn={(row, _col, value) => {
        const t = row.original;
        const q = String(value).toLowerCase();
        const client = clientById.get(t.clientId);
        return (
          t.id.toLowerCase().includes(q) ||
          t.counterparty.name.toLowerCase().includes(q) ||
          (client?.fullName ?? "").toLowerCase().includes(q) ||
          (t.purpose ?? "").toLowerCase().includes(q) ||
          t.purposeCode.includes(q) ||
          t.purposeDescription.toLowerCase().includes(q)
        );
      }}
      bulkActions={(selected, clear) => {
        const ids = selected.map((t) => t.id);
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                const snapshot = [...selected];
                useMockStore.getState().bulkRemoveTransactions(ids);
                toast.success(`Одобрено: ${ids.length} транзакций`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertTransactions(snapshot),
                  },
                });
                clear();
              }}
            >
              <Check className="size-3.5" />
              Одобрить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                const alertIds = useMockStore.getState().createAlertsFromTransactions(ids);
                toast.success(`Создано оповещений: ${alertIds.length}`, {
                  action: {
                    label: "Открыть",
                    onClick: () => router.push("/alerts"),
                  },
                });
                clear();
              }}
            >
              <Bell className="size-3.5" />
              Создать алерт
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-background hover:bg-background/10 h-7"
              onClick={() => {
                toast.info(`Перепроверка запущена для ${ids.length} транзакций`);
                clear();
              }}
            >
              <RotateCcw className="size-3.5" />
              Перепроверить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-400/10 h-7"
              onClick={() => {
                const snapshot = [...selected];
                useMockStore.getState().bulkRemoveTransactions(ids);
                toast.warning(`Отклонено: ${ids.length} транзакций`, {
                  action: {
                    label: "Отменить",
                    onClick: () => useMockStore.getState().bulkUpsertTransactions(snapshot),
                  },
                });
                clear();
              }}
            >
              <Ban className="size-3.5" />
              Отклонить
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
                Статус
                {complianceFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{complianceFilter.size}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Все статусы</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {COMPLIANCE_STATUSES.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={complianceFilter.has(s)}
                  onCheckedChange={() => setComplianceFilter((set) => toggle(set, s))}
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Приоритет
                {priorityFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{priorityFilter.size}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Все уровни</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["low", "medium", "high"] as const).map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorityFilter.has(p)}
                  onCheckedChange={() => setPriorityFilter((s) => toggle(s, p))}
                >
                  {PRIORITY_LABELS[p]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Риск
                {riskFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{riskFilter.size}</span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Все уровни риска</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["low", "medium", "high", "critical"] as RiskLevel[]).map((r) => (
                <DropdownMenuCheckboxItem key={r} checked={riskFilter.has(r)} onCheckedChange={() => setRiskFilter((s) => toggle(s, r))}>
                  <RiskBadge level={r} />
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                {currencyFilter || "Валюта"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Валюта</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={currencyFilter === ""} onCheckedChange={() => setCurrencyFilter("")}>
                Все
              </DropdownMenuCheckboxItem>
              {currencies.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={currencyFilter === c}
                  onCheckedChange={() => setCurrencyFilter((cur) => (cur === c ? "" : c))}
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      toolbar={
        <Button size="xl" variant="outline">
          <Download className="size-4" />
          Экспорт
        </Button>
      }
    />
  );
}
