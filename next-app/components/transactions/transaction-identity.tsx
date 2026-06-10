"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeftRight, Copy, FolderPlus, Sparkles } from "lucide-react"
import type { Transaction, Client } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ext/status-badge"
import { RiskBadge } from "@/components/ext/risk-badge"
import { RelativeTime } from "@/components/ext/relative-time"
import { AssistantPanel } from "@/components/ext/assistant-panel"
import { formatCurrency } from "@/lib/format"

const COMPLIANCE_TONE = {
  Завершена: "success",
  Обработана: "success",
  "Авто-отказ": "danger",
  Ожидание: "warning",
  Отклонена: "danger",
} as const
const PRIORITY_TONE = { low: "muted", medium: "warning", high: "danger" } as const
const PRIORITY_UPPER = { low: "LOW", medium: "MEDIUM", high: "HIGH" } as const
const DIRECTION: Record<string, string> = { transfer: "Перевод", incoming: "Поступление", outgoing: "Исходящая", exchange: "Обмен", cash: "Кассовая" }
const CHANNEL_LABEL: Record<string, string> = { mobile: "Мобильное", web: "Web", branch: "Отделение", api: "API" }

/** Левый фикс-рейл транзакции — сумма-герой + паспорт + действия. */
export function TransactionIdentity({ tx, client }: { tx: Transaction; client?: Client }) {
  const copyId = () => {
    navigator.clipboard?.writeText(tx.id)
    toast.success("ID транзакции скопирован")
  }

  return (
    <div className="flex flex-col gap-4">
      <Block>
        <div className="flex flex-col gap-6">
          {/* Сумма-герой */}
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.4px] text-muted-foreground uppercase">
              <ArrowLeftRight className="size-3.5" />
              {DIRECTION[tx.type] ?? tx.type}
            </span>
            <span className="font-heading text-[30px] leading-none font-bold tabular-nums">
              {formatCurrency(tx.amount, tx.currency)}
            </span>
            {tx.currency !== "KZT" ? (
              <span className="text-sm text-muted-foreground tabular-nums">
                ≈ {formatCurrency(tx.amountKZT, "KZT")}
              </span>
            ) : null}
            <div className="mt-1 flex flex-wrap gap-1.5">
              <StatusBadge tone={COMPLIANCE_TONE[tx.complianceStatus]}>{tx.complianceStatus}</StatusBadge>
              <StatusBadge tone={PRIORITY_TONE[tx.priority]}>{PRIORITY_UPPER[tx.priority]}</StatusBadge>
            </div>
            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono break-all">{tx.id}</span>
              <button type="button" onClick={copyId} className="shrink-0 transition hover:text-foreground" aria-label="Копировать ID" title="Копировать ID">
                <Copy className="size-3" />
              </button>
            </span>
          </div>

          {/* Клиент → досье */}
          {client ? (
            <Link href={`/clients/${client.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{client.fullName}</span>
                <span className="text-xs text-muted-foreground">{client.id}</span>
              </div>
              <RiskBadge level={client.riskLevel} />
            </Link>
          ) : null}

          {/* Поля */}
          <div className="flex flex-col gap-2.5 rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
            <Row label="Дата" value={<RelativeTime iso={tx.date} />} />
            <Row label="Канал" value={CHANNEL_LABEL[tx.channel] ?? tx.channel} />
            <Row label="Риск операции" value={<RiskBadge level={tx.riskLevel} />} />
            <Row label="Контрагент" value={tx.counterparty.country ?? "—"} />
          </div>

          {/* Действия */}
          <div className="flex flex-col gap-2.5">
            <Button asChild size="lg" className="w-full justify-center">
              <Link href={`/cases/new?fromTx=${tx.id}&client=${tx.clientId}`}>
                <FolderPlus className="size-4" />
                В кейс
              </Link>
            </Button>
            <AssistantPanel
              contextLabel={`Транзакция ${tx.id}`}
              contextSubtitle={`${tx.purposeDescription} · риск ${tx.riskLevel}`}
              quickPrompts={[
                "Объясни почему транзакция помечена как рисковая",
                "Покажи похожие операции этого клиента",
                "Составь черновик SAR-отчёта",
              ]}
              triggerOverride={
                <Button variant="outline" size="lg" className="w-full justify-center">
                  <Sparkles className="size-4" />
                  AI Ассистент
                </Button>
              }
            />
          </div>
        </div>
      </Block>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  )
}
