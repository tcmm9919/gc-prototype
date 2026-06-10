"use client"

import * as React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getRiskConfig, RISK_THRESHOLDS_HINT } from "@/lib/scoring/sources"
import { cn } from "@/lib/utils"
import { RiskTrendSparkline } from "./risk-trend-sparkline"

const SCALE_SEGMENTS = [
  { from: 0, to: 25, cls: "bg-risk-low" },
  { from: 25, to: 50, cls: "bg-risk-medium" },
  { from: 50, to: 75, cls: "bg-risk-high" },
  { from: 75, to: 100, cls: "bg-risk-critical" },
]

interface RiskScoreBlockProps {
  score: number
  /** Серия для тренда (12 точек за 30 дней). Без неё тренд скрыт. */
  trendData?: number[]
  /** Подписи дат под sparkline: [начало, середина, текущая] */
  trendLabels?: [string, string, string]
  /** full — с трендом (таб Скоринг), compact — без (Обзор) */
  showTrend?: boolean
  className?: string
}

/**
 * RiskScoreBlock — карточка «Итоговый риск»: число, категория,
 * 4-сегментная шкала с маркером, опционально тренд за 30 дней.
 */
export function RiskScoreBlock({
  score,
  trendData,
  trendLabels,
  showTrend = true,
  className,
}: RiskScoreBlockProps) {
  const cfg = getRiskConfig(score)
  const delta =
    trendData && trendData.length >= 2
      ? Math.round(trendData[trendData.length - 1] - trendData[0])
      : 0

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-5",
        className
      )}
    >
      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        Итоговый риск
      </span>

      <div className="mt-2 flex items-center gap-2.5">
        <span className="font-heading text-[48px] leading-none font-medium tabular-nums">
          {score}
        </span>
        <span className="text-sm text-muted-foreground">/ 100</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "ml-auto cursor-default rounded-full px-2.5 py-1 text-xs font-semibold",
                cfg.tintClass,
                cfg.textClass
              )}
            >
              {cfg.label}
            </span>
          </TooltipTrigger>
          <TooltipContent>{RISK_THRESHOLDS_HINT}</TooltipContent>
        </Tooltip>
      </div>

      {/* 4-сегментная шкала + маркер */}
      <div className="relative mt-5">
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          {SCALE_SEGMENTS.map((s) => (
            <div key={s.from} className={cn("flex-1", s.cls)} />
          ))}
        </div>
        <div
          className="absolute -top-[3px] -bottom-[3px] w-[2px] rounded-full bg-foreground"
          style={{ left: `${Math.max(0, Math.min(100, score))}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground">
        <span>Низкий 0</span>
        <span>Ср. 25</span>
        <span>Выс. 50</span>
        <span>Крит. 75</span>
        <span>100</span>
      </div>

      {/* Тренд за 30 дней */}
      {showTrend && trendData && trendData.length >= 2 ? (
        <div className="mt-4 border-t border-border pt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Тренд за 30 дней
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                delta > 0
                  ? "text-risk-medium"
                  : delta < 0
                    ? "text-risk-low"
                    : "text-muted-foreground"
              )}
            >
              {delta > 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : delta < 0 ? (
                <ArrowDownRight className="size-3.5" />
              ) : null}
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </div>
          <div className="mt-2">
            <RiskTrendSparkline data={trendData} />
          </div>
          {trendLabels ? (
            <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
              <span>{trendLabels[0]}</span>
              <span>{trendLabels[1]}</span>
              <span>{trendLabels[2]}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
