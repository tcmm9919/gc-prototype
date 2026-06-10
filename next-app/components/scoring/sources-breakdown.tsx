"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import type { Client } from "@/lib/mock"
import {
  type InternalScoringCategory,
  type NewsItem,
  type ScoreSourceKey,
  type TransactionTrigger,
} from "@/lib/scoring/sources"
import type { ScoreSourceData, ScoreContribution } from "@/lib/scoring/formula"
import { ScoreSourceRow } from "./score-source-row"
import { TransactionsDrillDown } from "./drill-downs/transactions-drill-down"
import { InternalScoringDrillDown } from "./drill-downs/internal-scoring-drill-down"
import { EddSummaryDrillDown } from "./drill-downs/edd-summary-drill-down"
import { NewsListDrillDown } from "./drill-downs/news-list-drill-down"
import { PdlDetailsDrillDown } from "./drill-downs/pdl-details-drill-down"

interface SourcesBreakdownProps {
  client: Client
  sources: ScoreSourceData[]
  contributions: ScoreContribution[]
  triggers: TransactionTrigger[]
  categories: InternalScoringCategory[]
  news: NewsItem[]
  baselineText?: string
  expanded: Set<ScoreSourceKey>
  onToggle: (source: ScoreSourceKey) => void
  rowRefs: React.MutableRefObject<
    Partial<Record<ScoreSourceKey, HTMLDivElement | null>>
  >
}

/** Секция 4 — «Источники профиля рисков»: collapsible-строки с drill-down */
export function SourcesBreakdown({
  client,
  sources,
  contributions,
  triggers,
  categories,
  news,
  baselineText,
  expanded,
  onToggle,
  rowRefs,
}: SourcesBreakdownProps) {
  const router = useRouter()
  const contribBySource = React.useMemo(
    () => new Map(contributions.map((c) => [c.source, c])),
    [contributions]
  )
  const activeCount = sources.filter((s) => s.hasData).length
  const emptyCount = sources.length - activeCount

  const drillDownFor = (s: ScoreSourceData): React.ReactNode => {
    switch (s.source) {
      case "anomalous_transactions":
        return (
          <TransactionsDrillDown
            triggers={triggers}
            baselineText={baselineText}
            clientId={client.id}
            onOpenTrigger={(t) => router.push(t.href)}
          />
        )
      case "internal_scoring":
        return <InternalScoringDrillDown categories={categories} />
      case "edd_agent":
        return (
          <EddSummaryDrillDown
            clientId={client.id}
            lastRun={s.lastRun}
            score={s.score}
          />
        )
      case "news_agent":
        return <NewsListDrillDown news={news} clientId={client.id} />
      case "pdl_check":
        return <PdlDetailsDrillDown lastRun={s.lastRun} />
    }
  }

  return (
    <div className="px-6 pb-2">
      <h3 className="pt-[18px] pb-1 text-[13px] font-medium">
        Источники профиля рисков{" "}
        <span className="font-normal text-muted-foreground">
          · {activeCount} активных, {emptyCount} без данных
        </span>
      </h3>
      <div className="flex flex-col">
        {sources.map((s) => (
          <ScoreSourceRow
            key={s.source}
            ref={(el) => {
              rowRefs.current[s.source] = el
            }}
            data={s}
            contribution={contribBySource.get(s.source)}
            expanded={expanded.has(s.source)}
            onToggle={() => onToggle(s.source)}
          >
            {drillDownFor(s)}
          </ScoreSourceRow>
        ))}
      </div>
    </div>
  )
}
