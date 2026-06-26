"use client"

import * as React from "react"
import { AlertTriangle, CircleHelp, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  RECALC_COST_USD,
  RISK_WEIGHTS,
  SCORE_SOURCES,
} from "@/lib/scoring/sources"
import type { ScoreContribution } from "@/lib/scoring/formula"
import { cn } from "@/lib/utils"

// Формула — 4 фактора (ПДЛ вне формулы, excludeFromFormula).
const WEIGHT_ROWS = (
  ["anomalous_transactions", "internal_scoring", "edd_agent", "news_agent", "pdl_check"] as const
).filter((k) => !SCORE_SOURCES[k].excludeFromFormula)

interface ProfileHeaderProps {
  finalScore: number
  /** Расчёт по формуле (для warning при расхождении с API-баллом) */
  formulaSum: number
  contributions: ScoreContribution[]
  configVersion: string
  agentsCount: number
  estimatedSec: number
  recalculating: boolean
  onRecalc: () => void
}

/**
 * Шапка скоринга (одна колонка): итоговый балл + Пересчитать, ниже полоса
 * «Как сложился балл» во всю ширину — работает разделителем перед «Источниками».
 */
export function ProfileHeader({
  finalScore,
  formulaSum,
  contributions,
  configVersion,
  agentsCount,
  estimatedSec,
  recalculating,
  onRecalc,
}: ProfileHeaderProps) {
  const mismatch = Math.abs(formulaSum - finalScore) > 5
  const sum = contributions.reduce((s, c) => s + c.contribution, 0)
  const sumRounded = Math.round(sum * 100) / 100
  const rest = Math.max(0, 100 - sum)
  const rounded = Math.round(sum) !== sumRounded

  return (
    <div className="border-b border-border">
      {/* Итоговый риск + Пересчитать */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-[22px]">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold tracking-[0.4px] text-muted-foreground uppercase">
            Итоговый риск
          </span>
          <div className="flex items-center gap-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-[48px] leading-none font-bold text-foreground tabular-nums">
                {finalScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            {mismatch ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="size-4 cursor-default text-risk-medium" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Балл от API ({finalScore}) отличается от расчёта по модели
                  «взвешенное среднее» ({Math.round(formulaSum * 100) / 100}).
                  Возможно, в системе другая формула. Сообщите методологу.
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={onRecalc} disabled={recalculating}>
              <RefreshCcw
                className={cn("size-3.5", recalculating && "animate-spin")}
              />
              {recalculating ? "Пересчитываем…" : "Пересчитать"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Запустит {agentsCount} активных агентов. Ожидаемое время ~
            {estimatedSec} сек, стоимость ~${RECALC_COST_USD} в LLM-токенах
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Полоса «Как сложился балл» — разделитель во всю ширину */}
      <div className="px-6 pt-4 pb-5">
        <div className="mb-2 flex items-center gap-1.5">
          <h3 className="text-[10px] font-semibold tracking-[0.4px] text-muted-foreground uppercase">
            Как сложился балл
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleHelp className="size-3.5 cursor-default text-muted-foreground/60" />
            </TooltipTrigger>
            <TooltipContent>
              вклад = балл × вес / Σ весов активных источников
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex h-[26px] overflow-hidden rounded-[6px]">
          {contributions.map((c) => (
            <div
              key={c.source}
              className="flex min-w-0 items-center justify-center"
              style={{
                flexGrow: c.contribution,
                flexBasis: 0,
                backgroundColor: SCORE_SOURCES[c.source].color,
              }}
              title={`${SCORE_SOURCES[c.source].label}: +${Math.round(c.contribution * 10) / 10}`}
            >
              {c.contribution >= 4 ? (
                <span className="truncate px-1 text-[11px] font-medium text-white tabular-nums">
                  {Math.round(c.contribution * 10) / 10}
                </span>
              ) : null}
            </div>
          ))}
          {rest > 0 ? (
            <div
              className="bg-foreground/[0.06] dark:bg-white/[0.08]"
              style={{ flexGrow: rest, flexBasis: 0 }}
              aria-hidden
            />
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            Итого {sumRounded} из 100 → итоговый балл{" "}
            <span className="font-medium text-foreground">{finalScore}</span>
          </span>
          {rounded && Math.round(sum) === finalScore ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">(скруглено)</span>
              </TooltipTrigger>
              <TooltipContent>
                Сумма вкладов {sumRounded} округляется до целого {finalScore}
              </TooltipContent>
            </Tooltip>
          ) : null}
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="text-primary hover:underline">
                как считается балл?
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 text-sm" align="start">
              <div className="flex flex-col gap-3">
                <p className="font-semibold">Модель расчёта: взвешенное среднее</p>
                <p className="text-xs text-muted-foreground">
                  Итоговый балл = Σ (балл_источника × вес_источника), где Σ весов
                  = 100%
                </p>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Веса на 07.06.2026:</span>
                  {WEIGHT_ROWS.map((key) => (
                    <div key={key} className="flex justify-between">
                      <span>{SCORE_SOURCES[key].label}</span>
                      <span className="font-semibold tabular-nums">
                        {Math.round(RISK_WEIGHTS[key] * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Веса задаёт методолог в Настройки → Риск-факторы. Текущая версия
                  конфига: <span className="font-mono">{configVersion}</span>.
                </p>
                <p className="border-t border-border pt-2 text-[11px] text-muted-foreground italic">
                  Эта модель — текущее видение. Если ваш банк использует другую
                  формулу,{" "}
                  <a
                    href="mailto:gcp-team@freedom.kz?subject=Формула%20риска"
                    className="text-primary hover:underline"
                  >
                    сообщите команде
                  </a>
                  .
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
