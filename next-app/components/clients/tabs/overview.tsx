"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Upload,
  User as UserIcon,
  AlertTriangle,
  Lock,
  Crown,
  History,
} from "lucide-react"
import type { Client, ClientFlags } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import { Button } from "@/components/ui/button"
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

export function ClientOverview({ client }: { client: Client }) {
  const data = useMockData()

  // История запусков сценариев по клиенту — детерминированный mock.
  const scenarioRuns = React.useMemo(() => {
    const scs = data.scenarios
    if (!scs.length) return []
    const seed = Array.from(client.id).reduce((a, c) => a + c.charCodeAt(0), 0)
    const STATUSES = [
      { key: "success", label: "Успешно", tone: "success" as const },
      { key: "success", label: "Успешно", tone: "success" as const },
      { key: "error", label: "Ошибка", tone: "danger" as const },
      { key: "running", label: "В процессе", tone: "info" as const },
    ]
    const n = Math.min(scs.length, 4)
    return Array.from({ length: n }, (_, i) => {
      const sc = scs[(seed + i) % scs.length]
      const at = new Date(Date.now() - (i * 53 + 8) * 3_600_000)
      return { id: sc.id, name: sc.name, at, ...STATUSES[(seed + i) % STATUSES.length] }
    })
  }, [client.id, data.scenarios])

  const nameParts = client.fullName.split(" ")
  const detailFields: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Версия карточки клиента", value: client.cardVersion ?? "1" },
    { label: "Колвир-код", value: client.kolvirCode ?? "0356142" },
    { label: "Имя", value: client.firstName ?? nameParts[1] ?? "—" },
    { label: "Фамилия", value: client.lastName ?? nameParts[0] ?? "—" },
    { label: "Отчество", value: client.middleName ?? nameParts[2] ?? "—" },
    { label: "ИИН", value: client.iin ?? client.bin ?? "—" },
    { label: "Дата рождения", value: client.birthDate ?? "—" },
    { label: "Дата регистрации", value: client.registrationDate ?? "2025-10-05" },
    { label: "Срок обслуживания (дн.)", value: client.serviceDays ?? 241 },
    { label: "Страна резидентства", value: client.countryFullName ?? client.country ?? "Республика Казахстан (KZ / 398)" },
    { label: "Место рождения", value: client.birthplace ?? "г. Алматы" },
    { label: "Филиал открытия счёта", value: client.accountBranch ?? "Алматинский филиал" },
  ]

  const flags = client.flags ?? {}
  const activeFlags = (
    Object.keys(FLAG_LABELS) as Array<keyof ClientFlags>
  ).filter((key) => flags[key] === true)

  return (
    <div className="@container flex flex-col gap-6">
      {/* Подробности — список «лейбл → значение»; колонки адаптируются к ширине
          самой колонки (container query), значения переносятся, не обрезаются. */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 font-heading text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          Подробности
        </h3>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-1 @[40rem]:grid-cols-2">
          {detailFields.map((f) => (
            <Field key={f.label} label={f.label} value={f.value} />
          ))}
        </dl>
      </div>

      {/* Документы (слева, шире) + Канал (справа, уже) */}
      <div className="grid gap-6 @[48rem]:grid-cols-[2fr_1fr]">
        {/* Документы клиента */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="inline-flex items-center gap-2 font-heading text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              <FileText className="size-4 text-muted-foreground" />
              Документы клиента
            </h3>
            <Button size="sm" variant="outline">
              <Upload className="size-3.5" />
              Загрузить
            </Button>
          </div>
          <div className="space-y-1.5">
            {DOCUMENTS.slice(0, 4).map((d) => (
              <div
                key={d.name}
                className="flex items-start justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03]"
              >
                <span className="min-w-0 break-all font-mono text-primary">{d.name}</span>
                <StatusBadge tone="muted">{d.tag}</StatusBadge>
              </div>
            ))}
          </div>
          {DOCUMENTS.length > 4 ? (
            <button type="button" className="pt-3 text-xs text-primary hover:underline">
              Все {DOCUMENTS.length} документов →
            </button>
          ) : null}
        </div>

        {/* Канал уведомлений — серая карта, как блок риска */}
        <div className="rounded-2xl bg-foreground/[0.03] p-5 dark:bg-white/[0.04]">
          <h3 className="font-heading text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            Канал уведомлений
          </h3>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">
            Как клиент получает запросы и решения комплаенса
          </p>
          <div className="space-y-1.5">
            <ChannelCheckbox label="Email" defaultChecked />
            <ChannelCheckbox label="SMS" />
            <ChannelCheckbox label="Push на Freedom SuperApp" />
          </div>
        </div>
      </div>

      {/* История запусков сценариев */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 inline-flex items-center gap-2 font-heading text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          <History className="size-4 text-muted-foreground" />
          История запусков сценариев
          <span className="font-normal text-muted-foreground">{scenarioRuns.length}</span>
        </h3>
        {scenarioRuns.length > 0 ? (
          <ul className="space-y-1.5">
            {scenarioRuns.map((r, i) => (
              <li
                key={`${r.id}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2.5 dark:bg-white/[0.03]"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Link href={`/workflows/${r.id}`} className="truncate text-sm font-medium text-primary hover:underline">
                    {r.name}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {r.at.toLocaleDateString("ru-RU")} {r.at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
                <StatusBadge tone={r.tone}>{r.label}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Сценарии по клиенту не запускались</p>
        )}
      </div>

      {/* ACTIVE FLAGS — тоже белая карта + контур */}
      {activeFlags.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4">
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
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border/40 py-2 last:border-b-0 @[40rem]:[&:nth-last-child(2)]:border-b-0">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium">{value}</dd>
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
