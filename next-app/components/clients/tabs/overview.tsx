"use client"

import * as React from "react"
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Sparkles,
  Upload,
  User as UserIcon,
  AlertTriangle,
  Lock,
  Crown,
} from "lucide-react"
import type { Client, ClientFlags } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Block } from "@/components/ext/block"
import { StatusBadge } from "@/components/ext/status-badge"
import { cn } from "@/lib/utils"

const FLAG_LABELS: Record<keyof ClientFlags, string> = {
  VIP: "VIP",
  PEP: "PEP",
  PDL: "PDL",
  EDD: "EDD",
  FATCA_group: "FATCA (гр.)",
  FATCA_individual: "FATCA (нал.)",
  OESR_group: "OESR (гр.)",
  OESR_individual: "OESR (нал.)",
  representative: "Представитель",
  antifraud: "Антифрод",
  limited_account: "Огранич. счёта",
  Blacklist: "Blacklist",
  iPDL: "iPDL",
  nPDL: "nPDL",
}

type FlagTone = "info" | "warning" | "danger" | "muted"

const FLAG_META: Record<
  keyof ClientFlags,
  { icon: React.ComponentType<{ className?: string }>; tone: FlagTone }
> = {
  VIP: { icon: Crown, tone: "info" },
  PEP: { icon: AlertTriangle, tone: "warning" },
  Blacklist: { icon: Lock, tone: "danger" },
  antifraud: { icon: AlertTriangle, tone: "warning" },
  EDD: { icon: ShieldAlert, tone: "info" },
  PDL: { icon: AlertTriangle, tone: "warning" },
  iPDL: { icon: AlertTriangle, tone: "warning" },
  nPDL: { icon: AlertTriangle, tone: "warning" },
  representative: { icon: UserIcon, tone: "muted" },
  limited_account: { icon: Lock, tone: "warning" },
  FATCA_group: { icon: ShieldCheck, tone: "muted" },
  FATCA_individual: { icon: ShieldCheck, tone: "muted" },
  OESR_group: { icon: ShieldCheck, tone: "muted" },
  OESR_individual: { icon: ShieldCheck, tone: "muted" },
}

const DOCUMENTS = [
  { name: "income_anomaly_remediation.pdf", tag: "income_proof" },
  { name: "edd_report_20260430_064829.html", tag: "edd_report" },
  { name: "edd_report_20260429_093630.html", tag: "edd_report" },
  { name: "edd_report_20260428_072744.html", tag: "edd_report" },
  { name: "income_report_bad_bb25f2c1.pdf", tag: "employment_letter" },
]

function getAIBrief(client: Client): string {
  const riskWord =
    client.internalScore < 25
      ? "Низкорисковый"
      : client.internalScore < 50
        ? "Среднерисковый"
        : client.internalScore < 75
          ? "Высокорисковый"
          : "Критический"
  const typeWord = client.type === "legal" ? "корпоративный" : "розничный"
  const pepNote = client.pep
    ? "PEP-статус активен — повышенное внимание"
    : "PEP/санкции — не обнаружены"
  const recommendation =
    client.internalScore < 50
      ? "Стандартный мониторинг."
      : "Рекомендован усиленный мониторинг и периодический EDD."
  return `${riskWord} ${typeWord} клиент. ${pepNote}. ${recommendation}`
}

export function ClientOverview({ client }: { client: Client }) {
  const allDetailFields: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Версия карточки", value: client.cardVersion },
    { label: "Колвир-код", value: client.kolvirCode },
    { label: "Дата регистрации", value: client.registrationDate },
    { label: "Срок обслуживания (дн.)", value: client.serviceDays },
    {
      label: "Страна резидентства",
      value: client.countryFullName ?? client.country,
    },
    { label: "Филиал открытия счёта", value: client.accountBranch },
  ]
  const filledFields = allDetailFields.filter(
    (f) => f.value !== undefined && f.value !== null && f.value !== ""
  )

  const flags = client.flags ?? {}
  const activeFlags = (
    Object.keys(FLAG_LABELS) as Array<keyof ClientFlags>
  ).filter((key) => flags[key] === true)

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* AI BRIEF */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.05] px-5 py-4 dark:bg-primary/[0.08]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
            Compliance Officer AI
          </span>
          <p className="text-sm text-foreground">{getAIBrief(client)}</p>
        </div>
      </div>

      {/* ACTIVE FLAGS */}
      {activeFlags.length > 0 ? (
        <Block dense>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Активные флаги
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeFlags.map((key) => (
                <FlagBadge key={key} flagKey={key} />
              ))}
            </div>
          </div>
        </Block>
      ) : null}

      {/* Details + Channel */}
      <div className="grid gap-5 lg:grid-cols-2">
        {filledFields.length > 0 ? (
          <Block title="Подробности">
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {filledFields.map((f) => (
                <Field key={f.label} label={f.label} value={f.value} />
              ))}
            </div>
            {filledFields.length < allDetailFields.length ? (
              <p className="mt-3 border-t border-foreground/[0.06] pt-3 text-xs text-muted-foreground dark:border-white/[0.06]">
                {allDetailFields.length - filledFields.length}{" "}
                {allDetailFields.length - filledFields.length === 1
                  ? "поле"
                  : "полей"}{" "}
                не заполнено
              </p>
            ) : null}
          </Block>
        ) : null}

        <Block title="Канал уведомлений">
          <p className="-mt-2 mb-3 text-xs text-muted-foreground">
            Как клиент получает запросы и решения комплаенса
          </p>
          <div className="space-y-1.5">
            <ChannelCheckbox label="Email" defaultChecked />
            <ChannelCheckbox label="SMS" />
            <ChannelCheckbox label="Push на Freedom SuperApp" />
          </div>
        </Block>
      </div>

      {/* Documents */}
      <Block
        title={
          <span className="inline-flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            Документы клиента
          </span>
        }
        actions={
          <Button size="sm" variant="outline">
            <Upload className="size-3.5" />
            Загрузить
          </Button>
        }
      >
        <div className="grid gap-1.5 md:grid-cols-2">
          {DOCUMENTS.slice(0, 4).map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03]"
            >
              <span className="truncate font-mono text-primary">{d.name}</span>
              <StatusBadge tone="muted">{d.tag}</StatusBadge>
            </div>
          ))}
        </div>
        {DOCUMENTS.length > 4 ? (
          <button
            type="button"
            className="pt-3 text-xs text-primary hover:underline"
          >
            Все {DOCUMENTS.length} документов →
          </button>
        ) : null}
      </Block>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  )
}

function FlagBadge({ flagKey }: { flagKey: keyof ClientFlags }) {
  const meta = FLAG_META[flagKey]
  const Icon = meta.icon
  const toneClass = {
    info: "bg-primary/15 text-primary",
    warning: "bg-risk-medium/15 text-risk-medium",
    danger: "bg-risk-critical/15 text-risk-critical",
    muted: "bg-foreground/[0.06] dark:bg-white/[0.06] text-foreground",
  }[meta.tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
        toneClass
      )}
    >
      <Icon className="size-3" />
      {FLAG_LABELS[flagKey]}
    </span>
  )
}

function ChannelCheckbox({
  label,
  defaultChecked,
}: {
  label: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = React.useState(defaultChecked ?? false)
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
        checked
          ? "bg-primary/10 text-foreground"
          : "bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.05] dark:bg-white/[0.03]"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="size-3.5 accent-primary"
      />
      {label}
    </label>
  )
}
