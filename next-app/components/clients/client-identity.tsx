"use client"

import * as React from "react"
import { ArrowUp, UserPlus, ShieldAlert, Sparkles } from "lucide-react"
import type { Client } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/ext/risk-badge"
import { StatusBadge } from "@/components/ext/status-badge"
import { AssistantPanel } from "@/components/ext/assistant-panel"
import { ShineBorder } from "@/components/ui/shine-border"
import { cn } from "@/lib/utils"
import { useClientDemo } from "./client-demo-context"

const STATUS_LABELS = {
  active: "Активен",
  review: "На проверке",
  edd: "EDD",
  blocked: "Заблокирован",
} as const

const STATUS_TONE = {
  active: "success",
  review: "warning",
  edd: "info",
  blocked: "danger",
} as const

// score — эффективный балл (демо или реальный), чтобы AI-резюме совпадало с Risk Score
function getAIBrief(client: Client, score: number): string {
  const riskWord =
    score < 25 ? "Низкорисковый"
    : score < 50 ? "Среднерисковый"
    : score < 75 ? "Высокорисковый"
    : "Критический"
  const typeWord = client.type === "legal" ? "корпоративный" : "розничный"
  const pepNote = client.pep ? "PEP-статус активен — повышенное внимание" : "PEP/санкции — не обнаружены"
  const recommendation = score < 50 ? "Стандартный мониторинг." : "Рекомендован усиленный мониторинг и периодический EDD."
  return `${riskWord} ${typeWord} клиент. ${pepNote}. ${recommendation}`
}

function getRiskConfig(score: number) {
  if (score < 25) return { label: "Низкий риск", barClass: "bg-risk-low", textClass: "text-risk-low", shine: "var(--color-risk-low)" }
  if (score < 50) return { label: "Средний риск", barClass: "bg-risk-medium", textClass: "text-risk-medium", shine: "var(--color-risk-medium)" }
  if (score < 75) return { label: "Высокий риск", barClass: "bg-risk-high", textClass: "text-risk-high", shine: "var(--color-risk-high)" }
  return { label: "Критический риск", barClass: "bg-risk-critical", textClass: "text-risk-critical", shine: "var(--color-risk-critical)" }
}

export function ClientIdentity({ client }: { client: Client }) {
  const data = useMockData()
  const responsible = data.users.find((u) => u.id === client.responsibleId)
  const { demoScore, cycle } = useClientDemo()
  const score = demoScore ?? client.internalScore
  const riskCfg = getRiskConfig(score)

  return (
    <div className="flex flex-col gap-4">
      {/* Identity card — includes action buttons */}
      <Block>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-3">
            <div className="flex min-w-0 flex-col items-start gap-2">
              <h2 className="font-heading text-[18px] font-bold tracking-[-0.02em]">
                {client.fullName}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <RiskBadge level={client.riskLevel} />
                <StatusBadge tone={STATUS_TONE[client.status]}>
                  {STATUS_LABELS[client.status]}
                </StatusBadge>
                {client.pep ? (
                  <StatusBadge tone="warning">
                    <ShieldAlert className="size-3" />
                    PEP
                  </StatusBadge>
                ) : null}
                {client.sanctioned ? (
                  <StatusBadge tone="danger">
                    <ShieldAlert className="size-3" />
                    Санкции
                  </StatusBadge>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">
                {client.id} ·{" "}
                {client.type === "legal" ? "Юр. лицо" : "Физ. лицо"}
              </span>
              <span className="text-xs text-muted-foreground">
                Ответственный: {responsible?.fullName ?? "—"}
              </span>
            </div>
          </div>

          {/* Risk Score + AI-резюме — чистое разделение */}
          <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
            <ShineBorder
              borderWidth={1.5}
              duration={10}
              shineColor={riskCfg.shine}
            />
            {/* Risk Score (системная метрика) */}
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Risk Score
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <button
                  type="button"
                  onClick={cycle}
                  title="Демо: переключить уровень риска"
                  className="font-heading text-[28px] font-bold leading-none tabular-nums transition hover:opacity-60"
                >
                  {score}
                </button>
                <span className="text-sm text-muted-foreground">/100</span>
                <span className={cn("ml-auto text-xs font-semibold", riskCfg.textClass)}>
                  {riskCfg.label}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.08] dark:bg-white/[0.1]">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", riskCfg.barClass)}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            {/* AI-резюме (текст от AI — единственный зелёный акцент) */}
            <div className="border-t border-foreground/[0.06] pt-3 dark:border-white/[0.06]">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                <Sparkles className="size-3.5" />
                AI-резюме
              </span>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {getAIBrief(client, score)}
              </p>
            </div>
          </div>

          {/* Action buttons — moved into identity */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-center bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/15 hover:text-risk-critical"
            >
              <ArrowUp className="size-4" />
              Поднять риск
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center">
              <UserPlus className="size-4" />В кейс
            </Button>
            <AssistantPanel
              contextLabel={client.fullName}
              contextSubtitle={`${client.id} · риск ${client.riskLevel} · скор ${client.internalScore}`}
              triggerOverride={
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
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
