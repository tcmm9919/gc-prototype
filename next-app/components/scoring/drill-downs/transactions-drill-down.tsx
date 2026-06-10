"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  RULE_DESCRIPTIONS,
  SCORE_SOURCES,
  type TransactionTrigger,
} from "@/lib/scoring/sources"

interface TransactionsDrillDownProps {
  triggers: TransactionTrigger[]
  baselineText?: string
  clientId: string
  onOpenTrigger?: (t: TransactionTrigger) => void
}

/** Drill-down «Аномальные транзакции»: сработавшие транзакции + базовая линия */
export function TransactionsDrillDown({
  triggers,
  baselineText,
  clientId,
  onOpenTrigger,
}: TransactionsDrillDownProps) {
  const color = SCORE_SOURCES.anomalous_transactions.color
  return (
    <div className="flex flex-col gap-2">
      <span className="pl-3.5 text-xs text-muted-foreground">
        {triggers.length} сработавших транзакций
      </span>
      {triggers.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onOpenTrigger?.(t)}
          className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-[9px] px-3 py-[9px] text-left transition-opacity hover:opacity-80"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 8%, transparent)`,
            border: `0.5px solid color-mix(in oklch, ${color} 25%, transparent)`,
          }}
        >
          <span
            className="font-mono text-[14px] font-medium tabular-nums"
            style={{ color }}
          >
            {t.score}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium">{t.title}</span>
            <span className="truncate text-[10px] text-muted-foreground">
              {t.subtitle}
            </span>
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="cursor-default rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`,
                  color,
                }}
              >
                {t.ruleCode}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {RULE_DESCRIPTIONS[t.ruleCode] ?? t.ruleCode}
            </TooltipContent>
          </Tooltip>
          <ChevronRight className="size-4 text-muted-foreground/50" />
        </button>
      ))}
      {baselineText ? (
        <div className="flex items-start gap-2 rounded-lg bg-foreground/[0.03] px-3 py-[9px] text-[11px] leading-relaxed text-muted-foreground dark:bg-white/[0.04]">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>{baselineText}</span>
        </div>
      ) : null}
      <Link
        href={`/clients/${clientId}?tab=transactions`}
        className="inline-flex items-center gap-1 pl-1 text-xs font-medium text-primary hover:underline"
      >
        Все транзакции клиента
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
