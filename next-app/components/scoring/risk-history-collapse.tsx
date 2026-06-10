"use client"

import * as React from "react"
import { ChevronDown, LineChart } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { RiskBadge } from "@/components/ext/risk-badge"
import { getRiskConfig, type ScoreHistoryEntry } from "@/lib/scoring/sources"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { RiskTrendChart } from "./risk-trend-chart"

interface RiskHistoryCollapseProps {
  entries: ScoreHistoryEntry[]
  /** Дневной ряд для графика динамики */
  series: number[]
  calculatedAt: string
  configVersion: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** История риска: слева график динамики (сужен вдвое), справа логи расчётов. */
export const RiskHistoryCollapse = React.forwardRef<
  HTMLDivElement,
  RiskHistoryCollapseProps
>(function RiskHistoryCollapse(
  { entries, series, calculatedAt, configVersion, open, onOpenChange },
  ref
) {
  const rows = [...entries].reverse()

  return (
    <div ref={ref} className="border-t border-border px-6 pb-[18px]">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 pt-7 pb-3.5 text-left"
          >
            <LineChart className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">История изменений риска</span>
            <span className="text-xs text-muted-foreground">
              · {entries.length} расчётов за 30 дней
            </span>
            <ChevronDown
              className={cn(
                "ml-auto size-4 text-muted-foreground/60 transition-transform",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pt-1 pb-2 md:flex-row md:gap-5">
            {/* ── ЛЕВО — график динамики (сужен вдвое) ── */}
            <div className="md:flex-1 md:min-w-0">
              <RiskTrendChart data={series} height={200} />
              <div className="mt-2 text-right text-[11px] text-muted-foreground">
                Обновлено {formatDateTime(calculatedAt)} · конфиг{" "}
                <span className="font-mono text-[10px]">{configVersion}</span>
              </div>
            </div>

            {/* Вертикальный разделитель */}
            <div
              className="hidden w-px self-stretch bg-border md:block"
              aria-hidden
            />

            {/* ── ПРАВО — логи расчётов ── */}
            <div className="flex flex-col md:flex-1 md:min-w-0">
              {rows.map((h, i) => {
                const prev = rows[i + 1]
                const delta = prev ? h.value - prev.value : null
                const cfg = getRiskConfig(h.value)
                return (
                  <div
                    key={h.date}
                    className="grid grid-cols-[76px_auto_1fr_auto] items-center gap-2.5 py-[7px]"
                  >
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {new Date(h.date).toLocaleDateString("ru-RU")}
                    </span>
                    <span className="text-[13px] font-medium tabular-nums">
                      {h.value}
                    </span>
                    <span className="justify-self-start">
                      <RiskBadge level={cfg.key} />
                    </span>
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
                        delta === null
                          ? "text-muted-foreground"
                          : delta > 0
                            ? "text-risk-medium"
                            : delta < 0
                              ? "text-risk-low"
                              : "text-muted-foreground"
                      )}
                    >
                      {delta === null
                        ? "первый"
                        : delta > 0
                          ? `↑ +${delta}`
                          : delta < 0
                            ? `↓ ${delta}`
                            : "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
})
