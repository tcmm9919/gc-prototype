"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { useMockData } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ext/status-badge"
import { Money } from "@/components/ext/money-kzt"
import { formatDateTime } from "@/lib/format"
import { AlertIdentity } from "./alert-identity"

const DIRECTION: Record<string, string> = { transfer: "Перевод", incoming: "Поступление", outgoing: "Исходящая", exchange: "Обмен", cash: "Кассовая" }
const CHANNEL_LABEL: Record<string, string> = { mobile: "Мобильное", web: "Web", branch: "Отделение", api: "API" }
const FIELD_LABELS: Record<string, string> = {
  amountKZT: "Сумма в тенге",
  amount: "Сумма",
  "counterparty.country": "Страна контрагента",
  type: "Тип операции",
  channel: "Канал",
  riskLevel: "Уровень риска",
  purposeCode: "Код назначения",
}
const OP_SYMBOL: Record<string, string> = { eq: "=", ne: "≠", gt: ">", lt: "<", in: "∈", nin: "∉", contains: "содержит", between: "между" }

function fmtVal(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ")
  if (typeof v === "number") return v.toLocaleString("ru-RU")
  return String(v)
}

export function AlertDetail({ id }: { id: string }) {
  const data = useMockData()
  const alert = data.alerts.find((a) => a.id === id) ?? data.alerts[0]
  if (!alert) return null

  const client = data.clients.find((c) => c.id === alert.clientId)
  const tx = alert.transactionId ? data.transactions.find((t) => t.id === alert.transactionId) : undefined
  const rule = data.rules.find((r) => r.id === alert.ruleId)
  // Фолбэк: курируемые алерты ссылаются на RL-S0x, которых нет в seedRules —
  // показываем условия репрезентативного правила, чтобы блок не пустовал.
  const conditions = rule?.conditions ?? data.rules[0]?.conditions ?? []
  const responsible = alert.responsibleId ? data.users.find((u) => u.id === alert.responsibleId)?.fullName : undefined
  const description = `Правило «${alert.ruleName}» сработало${tx ? ` по транзакции ${tx.id} (${tx.amount.toLocaleString("ru-RU")} ${tx.currency})` : ""}.`

  return (
    <div className="pb-6 pt-5">
      <div className="grid items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <AlertIdentity alert={alert} client={client} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          {/* Детали | Назначение */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-transparent dark:border-border bg-card p-5">
              <h4 className="mb-4 font-heading text-[15px] font-semibold">Детали оповещения</h4>
              <div className="space-y-3">
                <Field label="ID оповещения" value={alert.id} mono />
                <Field label="Тип" value="Срабатывание правила" />
                <Field label="Правило" value={alert.ruleName} />
                <Field label="Создано" value={formatDateTime(alert.date)} />
              </div>
            </div>
            <div className="rounded-2xl border border-transparent dark:border-border bg-card p-5">
              <h4 className="mb-4 font-heading text-[15px] font-semibold">Назначение</h4>
              <div className="space-y-3">
                <Field label="Назначено" value={responsible ?? "—"} />
                <Field label="Нарушение SLA" value="Нет" />
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="rounded-2xl border border-transparent dark:border-border bg-card p-5">
            <h4 className="mb-3 font-heading text-[15px] font-semibold">Описание</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Совпавшие условия */}
          {conditions.length > 0 ? (
            <div className="rounded-2xl border border-transparent dark:border-border bg-card p-5">
              <h4 className="mb-4 font-heading text-[15px] font-semibold">Совпавшие условия</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {conditions.map((c) => (
                  <div key={c.id} className="rounded-xl bg-risk-critical/5 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{FIELD_LABELS[c.field] ?? c.field}</span>
                      <StatusBadge tone="danger">сработало</StatusBadge>
                    </div>
                    <div className="mt-1.5 text-sm">
                      <span className="font-mono text-muted-foreground">{OP_SYMBOL[c.op] ?? c.op}</span>{" "}
                      <span className="font-medium">{fmtVal(c.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Связанная транзакция (полная) */}
          {tx ? (
            <div className="rounded-2xl border border-transparent dark:border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="font-heading text-[15px] font-semibold">Связанная транзакция</h4>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/transactions/${tx.id}`}>
                    <ExternalLink className="size-3.5" />
                    Открыть детали
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <TxField label="Сумма" value={<Money amount={tx.amount} currency={tx.currency} amountKZT={tx.amountKZT} />} />
                <TxField label="Направление" value={DIRECTION[tx.type] ?? tx.type} />
                <TxField label="Приоритет" value={tx.priority.toUpperCase()} />
                <TxField label="Контрагент" value={`${tx.counterparty.name} · ${tx.counterparty.country}`} />
                <TxField label="Канал" value={CHANNEL_LABEL[tx.channel] ?? tx.channel} />
                <TxField label="Статус" value={tx.complianceStatus} />
                <TxField label="Назначение" value={tx.purposeDescription} className="sm:col-span-2 lg:col-span-3" />
                <TxField label="ID транзакции" value={tx.id} mono className="sm:col-span-2 lg:col-span-3" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 text-sm">
      <span className="pt-0.5 text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs break-all" : ""}>{value}</span>
    </div>
  )
}

function TxField({ label, value, mono, className }: { label: string; value: React.ReactNode; mono?: boolean; className?: string }) {
  return (
    <div className={`rounded-xl bg-foreground/[0.03] px-4 py-3 dark:bg-white/[0.03] ${className ?? ""}`}>
      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{label}</span>
      <div className={`mt-1 text-sm ${mono ? "font-mono text-xs break-all text-muted-foreground" : "font-medium"}`}>{value}</div>
    </div>
  )
}
