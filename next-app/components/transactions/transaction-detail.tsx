"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Flag } from "lucide-react";

import { useMockData, useTransaction } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Block } from "@/components/ext/block";
import { StatusBadge } from "@/components/ext/status-badge";
import { RiskBadge } from "@/components/ext/risk-badge";
import { AssistantPanel } from "@/components/ext/assistant-panel";
import { formatCurrency } from "@/lib/format";

const COMPLIANCE_TONE = {
  "Завершена": "success",
  "Обработана": "success",
  "Авто-отказ": "danger",
  "Ожидание": "warning",
  "Отклонена": "danger",
} as const;

const PRIORITY_TONE = {
  low: "muted",
  medium: "warning",
  high: "danger",
} as const;

const PRIORITY_UPPER = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
} as const;

const FLAG_TONE = {
  warning: "border-risk-medium/40 bg-risk-medium/10 text-risk-medium",
  danger: "border-risk-critical/40 bg-risk-critical/10 text-risk-critical",
} as const;

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("ru-RU") +
    " " +
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  );
}

export function TransactionDetail({ id }: { id: string }) {
  const tx = useTransaction(id);
  const data = useMockData();

  if (!tx) {
    const first = data.transactions[0];
    if (!first) return null;
    return <TransactionDetail id={first.id} />;
  }

  const client = data.clients.find((c) => c.id === tx.clientId);
  const flags: { label: string; tone: "warning" | "danger" }[] = [];
  if (tx.scenarioId) flags.push({ label: "Транзакционная аномалия", tone: "warning" });
  if (tx.riskLevel === "critical") flags.push({ label: "Критический риск", tone: "danger" });
  if (tx.amountKZT > 5_000_000) flags.push({ label: "Крупная сумма", tone: "warning" });
  if (tx.counterparty.country && tx.counterparty.country !== "KZ")
    flags.push({ label: `Нерезидент: ${tx.counterparty.country}`, tone: "warning" });
  if (client?.pep) flags.push({ label: "PEP-клиент", tone: "warning" });
  if (client?.sanctioned) flags.push({ label: "Санкционный риск", tone: "danger" });

  const alerts = data.alerts.filter((a) => a.transactionId === tx.id);

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      {/* Header block: Public ID + badges + AssistantPanel */}
      <div className="rounded-2xl bg-card p-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2 min-w-0">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Public ID
          </span>
          <div className="flex items-center gap-2">
            <span className="font-heading text-[22px] font-bold tabular-nums tracking-[-0.02em] break-all">
              {tx.id}
            </span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(tx.id).catch(() => {})}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/[0.05] dark:hover:bg-white/[0.05] transition"
              title="Скопировать ID"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
          {client ? (
            <Link
              href={`/clients/${client.id}`}
              className="inline-block text-sm text-primary hover:underline"
            >
              {client.fullName}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <StatusBadge tone={COMPLIANCE_TONE[tx.complianceStatus]}>
            Комплаенс: {tx.complianceStatus}
          </StatusBadge>
          <StatusBadge tone={PRIORITY_TONE[tx.priority]}>
            Приоритет: {PRIORITY_UPPER[tx.priority]}
          </StatusBadge>
          <AssistantPanel
            contextLabel={`Транзакция ${tx.id}`}
            contextSubtitle={`${tx.purposeDescription} · риск ${tx.riskLevel}`}
            quickPrompts={[
              "Объясни почему транзакция помечена как рисковая",
              "Покажи похожие операции этого клиента",
              "Составь черновик SAR-отчёта",
            ]}
          />
        </div>
      </div>

      {/* 4 info blocks */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Block title="Информация о транзакции">
          <Field label="Сумма" value={formatCurrency(tx.amount, tx.currency)} />
          <Field label="В тенге" value={formatCurrency(tx.amountKZT, "KZT")} />
          <Field label="Комиссия" value="—" />
          <Field label="Создана" value={fmtDateTime(tx.date)} />
          <Field label="Изменена" value="—" />
          <Field label="Срок" value="—" />
        </Block>

        <Block title="Клиент">
          {client ? (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <Link
                  href={`/clients/${client.id}`}
                  className="text-base font-semibold text-primary hover:underline"
                >
                  {client.fullName}
                </Link>
                <p className="text-xs font-mono text-muted-foreground break-all">{client.id}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href={`/clients/${client.id}`}>
                  Открыть досье
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{tx.clientId}</p>
          )}
        </Block>

        <Block title="Назначение">
          <Field label="Код назначения" value={tx.purposeCode} />
          <Field label="Описание" value={tx.purposeDescription} multiline />
          <Field label="Тип товара" value={tx.goodsType ?? "—"} />
          <Field label="Описание товара" value={tx.goodsDescription ?? "—"} multiline />
          <Field label="Доп. информация" value={tx.additionalInfo ?? "—"} multiline />
        </Block>

        <Block title="Участники">
          <Field label="Оператор" value="—" />
          <Field label="ID оператора" value="—" />
          <Field label="Инициатор" value="—" />
          <Field label="Получатель заявки" value="—" />
          <Field label="Маршрут" value="—" />
          <Field label="Требуется одобрение" value="—" />
        </Block>
      </div>

      <Block title="Банковская информация">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Счёт отправителя" value={tx.counterparty.iban ?? "—"} mono />
          <Field label="Счёт посредника" value="—" mono />
          <Field label="Филиал" value={tx.branchName} />
          <Field label="Код филиала" value={tx.branchCode} mono />
          <Field label="Подразделение" value="—" />
          <Field label="Дата ордера" value="—" />
          <Field label="Номер ордера" value="—" mono />
        </div>
      </Block>

      {flags.length > 0 ? (
        <Block title="Риск-флаги">
          <div className="flex flex-wrap gap-1.5">
            {flags.map((f, i) => (
              <motion.span
                key={f.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${FLAG_TONE[f.tone]}`}
              >
                <Flag className="size-3" />
                {f.label}
              </motion.span>
            ))}
          </div>
        </Block>
      ) : null}

      {alerts.length > 0 ? (
        <Block title={`Оповещения · ${alerts.length}`}>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-4 py-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-foreground/[0.06] dark:bg-white/[0.06] px-2 py-0.5 text-xs font-mono">
                      Rule Match
                    </span>
                    <RiskBadge level={a.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.ruleName}</p>
                </div>
                <Link
                  href={`/alerts/${a.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-2 text-sm">
      <span className="text-xs text-muted-foreground pt-0.5">{label}</span>
      <span
        className={`${multiline ? "" : "truncate"} ${mono ? "font-mono text-xs" : ""} text-foreground`}
      >
        {value}
      </span>
    </div>
  );
}
