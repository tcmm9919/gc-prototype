"use client"

import * as React from "react"
import {
  Activity,
  ShieldAlert,
  Newspaper,
  FileSearch,
  UserCheck,
  RefreshCcw,
} from "lucide-react"
import type { Client } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Block } from "@/components/ext/block"
import { cn } from "@/lib/utils"

function getRiskConfig(score: number) {
  if (score < 25)
    return {
      label: "Низкий",
      textClass: "text-risk-low",
      barClass: "bg-risk-low",
    }
  if (score < 50)
    return {
      label: "Средний",
      textClass: "text-risk-medium",
      barClass: "bg-risk-medium",
    }
  if (score < 75)
    return {
      label: "Высокий",
      textClass: "text-risk-high",
      barClass: "bg-risk-high",
    }
  return {
    label: "Критический",
    textClass: "text-risk-critical",
    barClass: "bg-risk-critical",
  }
}

const clamp = (n: number) => Math.max(0, Math.min(100, n))

interface SubScore {
  key: string
  agent: string
  score: number
  icon: React.ComponentType<{ className?: string }>
  desc: string
}

function buildSubscores(client: Client): SubScore[] {
  const anomaly =
    client.riskLevel === "critical"
      ? 90
      : client.riskLevel === "high"
        ? 65
        : client.riskLevel === "medium"
          ? 45
          : 60
  const internal = Math.round(client.internalScore * 0.5)
  const news = client.newsScore ?? (client.pep ? 75 : 0)
  const edd = client.eddScore ?? (client.sanctioned ? 90 : 5)
  const pdl = client.pep ? 60 : 0
  return [
    {
      key: "anomaly",
      agent: "Аномальные транзакции",
      score: anomaly,
      icon: Activity,
      desc: "Транзакций с оповещениями: 2; оповещений в кейсах: 0",
    },
    {
      key: "internal",
      agent: "Внутренний скоринг",
      score: internal,
      icon: ShieldAlert,
      desc: `Уровень внутреннего скоринга: ${internal < 25 ? "LOW_RISK" : internal < 50 ? "MEDIUM_RISK" : "HIGH_RISK"}`,
    },
    {
      key: "news",
      agent: "Новостной агент",
      score: news,
      icon: Newspaper,
      desc: `Новостной агент: последний risk_score = ${news}`,
    },
    {
      key: "edd",
      agent: "EDD-агент",
      score: edd,
      icon: FileSearch,
      desc: `EDD-агент: последний risk_score = ${edd}`,
    },
    {
      key: "pdl",
      agent: "Проверка на ПДЛ",
      score: pdl,
      icon: UserCheck,
      desc:
        pdl === 0
          ? "customers.pdl = None — ни один диапазон не совпал"
          : "Совпадение по диапазону ПДЛ",
    },
  ]
}

interface Typology {
  name: string
  total: number
  score: number
  triggered: { code: string; label: string; meta?: string; weight: string }[]
}

const TYPOLOGIES: Typology[] = [
  {
    name: "Общие признаки",
    total: 29,
    score: 0,
    triggered: [
      {
        code: "g002",
        label: "Возраст 18–25 лет",
        meta: "age=18",
        weight: "+15",
      },
      {
        code: "g009",
        label: "Ритейл-операции >50 тыс. тенге в месяц",
        weight: "−30",
      },
    ],
  },
  { name: "Мошенничество", total: 13, score: 0, triggered: [] },
  {
    name: "Незаконный оборот наркотиков / НОН",
    total: 14,
    score: 0,
    triggered: [],
  },
  { name: "Незаконный игровой бизнес", total: 6, score: 0, triggered: [] },
  { name: "Терроризм", total: 7, score: 0, triggered: [] },
  { name: "Финансовые пирамиды", total: 11, score: 0, triggered: [] },
  {
    name: "Коррупция, хищение бюджетных средств, налоговые преступления",
    total: 11,
    score: 0,
    triggered: [],
  },
  { name: "Незаконный оборот криптовалюты", total: 7, score: 0, triggered: [] },
  {
    name: "Международные экономические санкции / МЭС",
    total: 2,
    score: 0,
    triggered: [],
  },
]

function RiskChart({ points }: { points: number[] }) {
  const W = 320,
    H = 90,
    pad = 6,
    n = points.length
  const x = (i: number) => (n <= 1 ? pad : (i / (n - 1)) * (W - pad * 2) + pad)
  const y = (v: number) => H - pad - (v / 100) * (H - pad * 2)
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p).toFixed(1)}`)
    .join(" ")
  const area = `${line} L${x(n - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full text-risk-medium"
      style={{ height: 96 }}
    >
      {[0, 25, 50, 75, 100].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={W - pad}
          y1={y(g)}
          y2={y(g)}
          className="stroke-foreground/[0.06]"
          strokeWidth={0.5}
        />
      ))}
      <path d={area} fill="currentColor" fillOpacity={0.1} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.5} />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p)} r={2.2} fill="currentColor" />
      ))}
    </svg>
  )
}

export function ClientScoring({ client }: { client: Client }) {
  const composite = client.internalScore
  const cfg = getRiskConfig(composite)
  const subscores = buildSubscores(client)
  const now = new Date().toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  // Risk history (anchored to composite)
  const b = composite
  const history = [
    { value: clamp(b), date: "05.06.2026 19:34" },
    { value: clamp(b + 2), date: "03.06.2026 17:28" },
    { value: clamp(b + 8), date: "03.06.2026 17:25" },
    { value: clamp(b + 8), date: "03.06.2026 17:25" },
    { value: clamp(b + 2), date: "03.06.2026 17:25" },
    { value: clamp(b - 17), date: "03.06.2026 16:45" },
  ]
  const chartPoints = [...history].reverse().map((h) => h.value)

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Профиль рисков */}
      <Block
        title={
          <span className="inline-flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Профиль рисков
          </span>
        }
        actions={
          <Button variant="outline" size="sm">
            <RefreshCcw className="size-3.5" />
            Обновить
          </Button>
        }
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="font-heading text-[40px] leading-none font-bold tabular-nums">
            {composite}
          </span>
          <span
            className={cn(
              "rounded-full bg-foreground/[0.06] px-2.5 py-1 text-xs font-semibold dark:bg-white/[0.06]",
              cfg.textClass
            )}
          >
            {cfg.label}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">{now}</span>
        </div>
        <div className="flex flex-col divide-y divide-foreground/[0.06] dark:divide-white/[0.06]">
          {subscores.map((s) => {
            const c = getRiskConfig(s.score)
            const Icon = s.icon
            return (
              <div key={s.key} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-muted-foreground" />
                    {s.agent}
                  </span>
                  <span className="font-heading text-base font-bold tabular-nums">
                    {s.score}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-foreground/[0.06] dark:bg-white/[0.06]">
                  <div
                    className={cn("h-full rounded-full", c.barClass)}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </Block>

      {/* История рисков */}
      <Block
        title={
          <span className="inline-flex items-center gap-2">
            <Activity className="size-4 text-risk-medium" />
            История рисков{" "}
            <span className="font-normal text-muted-foreground">
              · {history.length} запис.
            </span>
          </span>
        }
      >
        <RiskChart points={chartPoints} />
        <div className="mt-3 flex flex-col divide-y divide-foreground/[0.06] dark:divide-white/[0.06]">
          {history.map((h, i) => {
            const c = getRiskConfig(h.value)
            return (
              <div key={i} className="flex items-center gap-3 py-2 text-sm">
                <span className="rounded-md bg-foreground/[0.05] px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/[0.06]">
                  Расчёт
                </span>
                <span className="font-semibold tabular-nums">{h.value}</span>
                <span className={cn("text-xs", c.textClass)}>({c.label})</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {h.date}
                </span>
              </div>
            )
          })}
        </div>
      </Block>

      {/* Внутренний скоринг — типологии */}
      <Block
        title={
          <span className="inline-flex items-center gap-2">
            <ShieldAlert className="size-4 text-primary" />
            Внутренний скоринг
          </span>
        }
      >
        <div className="mb-4 rounded-xl bg-foreground/[0.03] px-4 py-3 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Последний скоринг
            </span>
            <span className="text-xs text-muted-foreground">03.06.2026</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-heading text-2xl font-bold tabular-nums">
              0
            </span>
            <span className="rounded-full bg-risk-low/15 px-2 py-0.5 text-xs font-semibold text-risk-low">
              Низкий
            </span>
            <span className="ml-auto rounded-full bg-risk-medium/15 px-2 py-0.5 text-xs font-medium text-risk-medium">
              2 сработавших
            </span>
          </div>
        </div>
        <div className="flex flex-col divide-y divide-foreground/[0.06] dark:divide-white/[0.06]">
          {TYPOLOGIES.map((t) => (
            <div key={t.name} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium">{t.name}</span>
                <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                  {t.triggered.length} / {t.total} сработало
                </span>
              </div>
              {t.triggered.length > 0 ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  {t.triggered.map((cr) => (
                    <div
                      key={cr.code}
                      className="flex items-center gap-2 rounded-lg bg-foreground/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03]"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {cr.code}
                      </span>
                      <span className="flex-1">{cr.label}</span>
                      {cr.meta ? (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {cr.meta}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          cr.weight.startsWith("−") ||
                            cr.weight.startsWith("+-")
                            ? "text-risk-low"
                            : "text-risk-medium"
                        )}
                      >
                        {cr.weight}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Нет сработавших критериев
                </p>
              )}
            </div>
          ))}
        </div>
      </Block>
    </div>
  )
}
