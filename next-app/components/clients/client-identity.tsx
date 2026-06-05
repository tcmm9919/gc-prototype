"use client"

import * as React from "react"
import {
  ArrowUp,
  UserPlus,
  Bell,
  Folder,
  ArrowLeftRight,
  ShieldAlert,
} from "lucide-react"
import type { Client } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { AvatarCircle } from "@/components/ext/entity-header"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/ext/risk-badge"
import { StatusBadge } from "@/components/ext/status-badge"
import { AssistantPanel } from "@/components/ext/assistant-panel"
import { initialsFromName } from "@/lib/format"
import { cn } from "@/lib/utils"

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

function getRiskConfig(score: number) {
  if (score < 25)
    return {
      label: "Низкий риск",
      barClass: "bg-risk-low",
      textClass: "text-risk-low",
    }
  if (score < 50)
    return {
      label: "Средний риск",
      barClass: "bg-risk-medium",
      textClass: "text-risk-medium",
    }
  if (score < 75)
    return {
      label: "Высокий риск",
      barClass: "bg-risk-high",
      textClass: "text-risk-high",
    }
  return {
    label: "Критический риск",
    barClass: "bg-risk-critical",
    textClass: "text-risk-critical",
  }
}

function computeSparkline(
  transactions: { date: string; clientId: string }[],
  clientId: string
): number[] {
  const now = Date.now()
  const days = Array(30).fill(0)
  transactions
    .filter((t) => t.clientId === clientId)
    .forEach((t) => {
      const daysAgo = Math.floor(
        (now - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysAgo >= 0 && daysAgo < 30) days[29 - daysAgo] += 1
    })
  return days
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex h-10 items-end gap-[2px]">
      {data.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-sm transition-colors",
            v > 0
              ? "bg-primary/60"
              : "bg-foreground/[0.06] dark:bg-white/[0.06]"
          )}
          style={{
            height: v > 0 ? `${(v / max) * 100}%` : "10%",
            minHeight: "3px",
          }}
        />
      ))}
    </div>
  )
}

function CounterRow({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
  tone: "warning" | "info" | "muted"
}) {
  const iconColor = {
    warning: value > 0 ? "text-risk-medium" : "text-muted-foreground",
    info: value > 0 ? "text-primary" : "text-muted-foreground",
    muted: "text-muted-foreground",
  }[tone]
  return (
    <div className="flex items-center gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03]">
      <Icon className={cn("size-4 shrink-0", iconColor)} />
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
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
  const sparkline = React.useMemo(
    () => computeSparkline(data.transactions, client.id),
    [data.transactions, client.id]
  )
  const hasActivity = sparkline.some((v) => v > 0)
  const riskCfg = getRiskConfig(client.internalScore)
  const hue = (client.id.charCodeAt(3) * 47) % 360

  return (
    <Block dense>
      <div className="flex flex-col gap-5">
        {/* Identity */}
        <div className="flex flex-col items-center gap-3 text-center">
          <AvatarCircle
            initials={initialsFromName(client.fullName)}
            size="lg"
            hue={hue}
          />
          <div className="flex min-w-0 flex-col items-center gap-1.5">
            <h2 className="font-heading text-[18px] font-bold tracking-[-0.02em]">
              {client.fullName}
            </h2>
            <div className="flex flex-wrap justify-center gap-1.5">
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
              {client.id} · {client.type === "legal" ? "Юр. лицо" : "Физ. лицо"}
            </span>
            <span className="text-xs text-muted-foreground">
              Ответственный: {responsible?.fullName ?? "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full justify-center">
            <ArrowUp className="size-4" />
            Поднять риск
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-center">
            <UserPlus className="size-4" />В кейс
          </Button>
          <AssistantPanel
            contextLabel={client.fullName}
            contextSubtitle={`${client.id} · риск ${client.riskLevel} · скор ${client.internalScore}`}
          />
        </div>

        {/* Risk Score */}
        <div className="flex flex-col gap-2.5 rounded-2xl bg-foreground/[0.03] p-4 dark:bg-white/[0.05]">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Risk Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-[32px] leading-none font-bold tabular-nums">
              {client.internalScore}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.08] dark:bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                riskCfg.barClass
              )}
              style={{ width: `${client.internalScore}%` }}
            />
          </div>
          <span className={cn("text-sm font-semibold", riskCfg.textClass)}>
            {riskCfg.label}
          </span>
        </div>

        {/* Activity */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Активность за 30 дней
          </span>
          {hasActivity ? (
            <Sparkline data={sparkline} />
          ) : (
            <div className="py-1 text-xs text-muted-foreground">
              Нет активности
            </div>
          )}
        </div>

        {/* Counters */}
        <div className="flex flex-col gap-1.5">
          <CounterRow
            icon={Bell}
            value={openAlerts}
            label={openAlerts === 1 ? "открытый алерт" : "открытых алертов"}
            tone="warning"
          />
          <CounterRow
            icon={Folder}
            value={openCases}
            label={openCases === 1 ? "активный кейс" : "активных кейсов"}
            tone="info"
          />
          <CounterRow
            icon={ArrowLeftRight}
            value={totalTx}
            label={
              totalTx === 1
                ? "транзакция"
                : totalTx < 5
                  ? "транзакции"
                  : "транзакций"
            }
            tone="muted"
          />
        </div>
      </div>
    </Block>
  )
}
