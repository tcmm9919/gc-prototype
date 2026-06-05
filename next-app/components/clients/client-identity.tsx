"use client"

import {
  ArrowUp,
  UserPlus,
  Bell,
  Folder,
  ArrowLeftRight,
  ShieldAlert,
  Sparkles,
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
  const hue = (client.id.charCodeAt(3) * 47) % 360

  return (
    <div className="flex flex-col gap-4">
      {/* Identity card */}
      <Block dense>
        <div className="flex flex-col gap-5">
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
                {client.id} ·{" "}
                {client.type === "legal" ? "Юр. лицо" : "Физ. лицо"}
              </span>
              <span className="text-xs text-muted-foreground">
                Ответственный: {responsible?.fullName ?? "—"}
              </span>
            </div>
          </div>

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

      {/* Actions card */}
      <Block dense>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="lg" className="w-full justify-center">
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
