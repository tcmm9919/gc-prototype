"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import { useMockData, type Transaction } from "@/lib/mock";
import { Money } from "@/components/ext/money-kzt";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { EmptyState } from "@/components/ext/empty-state";
import { usePaged, PagerFooter } from "@/components/ext/pager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function ClientTransactions({ clientId }: { clientId: string }) {
  const data = useMockData();
  const txs = data.transactions.filter((t) => t.clientId === clientId);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | Transaction["status"]>("all");
  const [active, setActive] = React.useState<Transaction | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return txs.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.counterparty.name.toLowerCase().includes(q) ||
        (t.purpose ?? "").toLowerCase().includes(q)
      );
    });
  }, [txs, query, status]);

  const paged = usePaged(filtered, 12);
  // Сброс на первую страницу при смене поиска/фильтра
  React.useEffect(() => {
    paged.setPage(1);
  }, [query, status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (txs.length === 0) {
    return <EmptyState title="У клиента ещё нет операций" description="Транзакции появятся здесь по мере активности." />;
  }

  return (
    <div className="@container flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск по ID, контрагенту, назначению..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          aria-label="Статус"
          className="h-9 rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none focus:ring-0"
        >
          <option value="all">Все статусы</option>
          <option value="review">На проверке</option>
          <option value="blocked">Заблокированы</option>
          <option value="completed">Проведены</option>
        </select>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">{filtered.length} операций</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">Ничего не найдено</p>
        ) : (
          <div className="flex flex-col gap-2">
            {paged.pageItems.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-foreground/[0.02] dark:hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{t.counterparty.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {TYPE_LABELS[t.type]} · {fmtDateTime(t.date)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <Money amount={t.amount} currency={t.currency} amountKZT={t.amountKZT} stack />

                  <div className="flex w-[7.5rem] shrink-0 flex-col items-end gap-1">
                    <RiskBadge level={t.riskLevel} />
                    <StatusBadge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</StatusBadge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border/60 pt-2">
        <PagerFooter
          page={paged.page}
          pageCount={paged.pageCount}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          pageSize={paged.pageSize}
          onPage={paged.setPage}
          onPageSize={paged.setPageSize}
          unit="операций"
        />
      </div>

      {/* Детали транзакции — модалка */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {active.counterparty.name}
                  <RiskBadge level={active.riskLevel} />
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col">
                <Row label="ID" value={<span className="font-mono text-xs">{active.id}</span>} />
                <Row label="Дата" value={fmtDateTime(active.date)} />
                <Row label="Тип" value={TYPE_LABELS[active.type]} />
                <Row label="Канал" value={CHANNEL_LABELS[active.channel]} />
                <Row label="Сумма" value={<Money amount={active.amount} currency={active.currency} amountKZT={active.amountKZT} />} />
                <Row label="Контрагент" value={`${active.counterparty.name}${active.counterparty.country ? ` · ${active.counterparty.country}` : ""}`} />
                {active.purposeDescription ? <Row label="Назначение" value={active.purposeDescription} /> : null}
                <Row label="Статус" value={<StatusBadge tone={STATUS_TONE[active.status]}>{STATUS_LABEL[active.status]}</StatusBadge>} />
              </div>
              <Button asChild variant="outline" className="mt-1 w-full">
                <Link href={`/transactions/${active.id}`}>
                  Открыть полную карточку
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/40 py-2 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right text-sm font-medium">{value}</span>
    </div>
  );
}
