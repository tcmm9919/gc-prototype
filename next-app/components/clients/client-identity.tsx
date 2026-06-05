"use client"

import { ArrowUp, UserPlus, ShieldAlert, Sparkles } from "lucide-react"
import type { Client } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/ext/risk-badge"
import { StatusBadge } from "@/components/ext/status-badge"
import { AssistantPanel } from "@/components/ext/assistant-panel"

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

function CounterRow({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl bg-foreground/[0.03] px-2.5 py-2.5 text-left dark:bg-white/[0.03]">
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-[10px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function ClientIdentity({ client }: { client: Client }) {
  const data = useMockData()
  const responsible = data.users.find((u) => u.id === client.responsibleId)
  const openAlerts = data.alerts.filter(
    (a) => a.clientId === client.id && a.status !== "closed"
  ).length
  const openCases = data.cases.filter(
    (c) => c.clientId === client.id && c.status !== "closed"
  ).length
  const totalTx = data.transactions.filter(
    (t) => t.clientId === client.id
  ).length

  return (
    <div className="flex flex-col gap-4">
      {/* Identity card */}
      <Block dense>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-start gap-3">
            <div className="flex min-w-0 flex-col items-start gap-1.5">
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

          <div className="grid grid-cols-3 gap-1.5">
            <CounterRow
              value={openAlerts}
              label={openAlerts === 1 ? "Открытый алерт" : "Открытых алертов"}
            />
            <CounterRow
              value={openCases}
              label={openCases === 1 ? "Активный кейс" : "Активных кейсов"}
            />
            <CounterRow
              value={totalTx}
              label={
                totalTx === 1
                  ? "Транзакция"
                  : totalTx < 5
                    ? "Транзакции"
                    : "Транзакций"
              }
            />
          </div>
        </div>
      </Block>

      {/* Actions card */}
      <Block dense>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center border-risk-critical/40 text-risk-critical hover:bg-risk-critical/10 hover:text-risk-critical"
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
      </Block>
    </div>
  )
}
