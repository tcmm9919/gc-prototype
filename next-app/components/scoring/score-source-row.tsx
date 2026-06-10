"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { RiskBadge } from "@/components/ext/risk-badge"
import {
  SCORE_SOURCES,
  getConfidenceClass,
  getRiskConfig,
} from "@/lib/scoring/sources"
import type { ScoreSourceData, ScoreContribution } from "@/lib/scoring/formula"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

interface ScoreSourceRowProps {
  data: ScoreSourceData
  /** Вклад в итог (× вес → +баллы). Есть только у активных источников формулы */
  contribution?: ScoreContribution
  expanded: boolean
  onToggle: () => void
  /** Drill-down контент (рендерится при раскрытии) */
  children?: React.ReactNode
}

/**
 * ScoreSourceRow — collapsible-строка источника в Sources Breakdown.
 * PDL — приглушённая (не подскор, см. TODO(pdl-placement)).
 */
export const ScoreSourceRow = React.forwardRef<
  HTMLDivElement,
  ScoreSourceRowProps
>(function ScoreSourceRow({ data, contribution, expanded, onToggle, children }, ref) {
  const meta = SCORE_SOURCES[data.source]
  const Icon = meta.icon
  const cfg = getRiskConfig(data.score)
  const dimmed = meta.dimmed

  return (
    <div
      ref={ref}
      className={cn("border-b border-border last:border-b-0", dimmed && "opacity-55")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 py-3 text-left"
      >
        {/* Иконка-плашка — фон = цвет источника (как на полосе), иконка белая */}
        <span
          className="flex size-8 items-center justify-center rounded-[9px]"
          style={{ backgroundColor: meta.color }}
        >
          <Icon className="size-4 text-white" />
        </span>
        {/* Основная инфо */}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium">{meta.label}</span>
          <span className="truncate text-xs text-muted-foreground">
            {meta.modelLabel} · {data.note}
            {data.hasData ? (
              <>
                {" · "}
                <span className={getConfidenceClass(data.confidence)}>
                  уверенность {data.confidence}%
                </span>
              </>
            ) : null}
            {" · "}
            {formatDateTime(data.lastRun)}
          </span>
        </span>
        {/* Категория подскора */}
        {data.hasData ? (
          <RiskBadge level={cfg.key} />
        ) : (
          <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/[0.06]">
            {meta.excludeFromFormula ? "не подскор" : "нет данных"}
          </span>
        )}
        {/* Score block — балл сверху, вклад в итог снизу */}
        <span className="flex flex-col items-end gap-0.5">
          <span className="text-[17px] leading-none font-medium tabular-nums">
            {data.hasData ? data.score : "—"}
          </span>
          {contribution ? (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              × {Math.round(contribution.weight * 100)}% →{" "}
              <span className="font-medium text-foreground">
                +{Math.round(contribution.contribution * 10) / 10}
              </span>
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground/60 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Drill-down «ветка» */}
      {expanded ? (
        <div
          className="mb-4 ml-4 pt-1.5 pr-0 pb-2 pl-[46px]"
          style={{
            borderLeft: `2px solid color-mix(in oklch, ${meta.color} 35%, transparent)`,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
})
