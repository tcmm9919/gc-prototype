"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { AlertTriangle, ArrowUp, CheckCircle2, Copy, FolderPlus, Sparkles } from "lucide-react"
import type { Alert, Client } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ext/status-badge"
import { RiskBadge } from "@/components/ext/risk-badge"
import { RelativeTime } from "@/components/ext/relative-time"
import { AssistantPanel } from "@/components/ext/assistant-panel"

const SEVERITY_LABEL = { low: "Низкая", medium: "Средняя", high: "Высокая", critical: "Критическая" } as const
const SEVERITY_TONE = { low: "info", medium: "warning", high: "warning", critical: "danger" } as const
const STATUS_LABEL = { new: "Открыто", in_progress: "На проверке", rejected: "Отклонено", escalated: "Эскалировано", closed: "Закрыто" } as const
const STATUS_TONE = { new: "info", in_progress: "warning", rejected: "danger", escalated: "danger", closed: "muted" } as const

/** Левый фикс-рейл оповещения — паспорт + действия. */
export function AlertIdentity({ alert, client }: { alert: Alert; client?: Client }) {
  const data = useMockData()
  const linkedCase = data.cases.find((c) => c.linkedAlertIds.includes(alert.id))

  const copyId = () => {
    navigator.clipboard?.writeText(alert.id)
    toast.success("ID оповещения скопирован")
  }

  return (
    <div className="flex flex-col gap-4">
      <Block>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-start gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-risk-high/15 text-risk-high">
                <AlertTriangle className="size-5" />
              </div>
              <h2 className="font-heading text-[16px] font-bold leading-tight tracking-[-0.02em]">{alert.ruleName}</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge tone={SEVERITY_TONE[alert.severity]}>{SEVERITY_LABEL[alert.severity]}</StatusBadge>
              <StatusBadge tone={STATUS_TONE[alert.status]}>{STATUS_LABEL[alert.status]}</StatusBadge>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono">{alert.id}</span>
              <button type="button" onClick={copyId} className="transition hover:text-foreground" aria-label="Копировать ID" title="Копировать ID">
                <Copy className="size-3" />
              </button>
            </span>
          </div>

          {client ? (
            <Link href={`/clients/${client.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{client.fullName}</span>
                <span className="text-xs text-muted-foreground">{client.id} · скор {client.internalScore}</span>
              </div>
              <RiskBadge level={client.riskLevel} />
            </Link>
          ) : null}

          <div className="flex flex-col gap-2.5 rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
            <Row label="Сработало" value={<RelativeTime iso={alert.date} />} />
            <Row label="Правило" value={<Link href={`/rules/${alert.ruleId}`} className="text-primary hover:underline">Открыть</Link>} />
            {alert.scenarioId ? (
              <Row label="Сценарий" value={<Link href={`/workflows/${alert.scenarioId}`} className="text-primary hover:underline">Открыть</Link>} />
            ) : null}
            <Row label="Кейс" value={linkedCase ? <Link href={`/cases/${linkedCase.id}`} className="text-primary hover:underline">{linkedCase.id}</Link> : "—"} />
          </div>

          <div className="flex flex-col gap-2.5">
            <Button asChild size="lg" className="w-full justify-center">
              <Link href={`/cases/new?fromAlert=${alert.id}&client=${alert.clientId}`}>
                <FolderPlus className="size-4" />
                В кейс
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center">
              <ArrowUp className="size-4" />
              Эскалировать
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center">
              <CheckCircle2 className="size-4" />
              Закрыть
            </Button>
            <AssistantPanel
              contextLabel={alert.ruleName}
              contextSubtitle={`${alert.id} · ${SEVERITY_LABEL[alert.severity]}`}
              quickPrompts={[
                "Почему сработало это правило именно сейчас?",
                "Похожие срабатывания за месяц",
                "Подготовь заключение для закрытия",
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
