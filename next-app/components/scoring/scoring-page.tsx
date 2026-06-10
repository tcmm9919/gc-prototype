"use client"

import * as React from "react"
import { toast } from "sonner"

import type { Client } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import {
  makeAnomalousTransactionsList,
  makeDailyRiskSeries,
  makeInternalScoringCategories,
  makeNewsList,
  makeScoreBreakdown,
  makeScoreHistory,
} from "@/lib/mock/factories"
import {
  AGENT_AVG_LATENCY_SEC,
  SCORE_SOURCES,
  type ScoreSourceKey,
} from "@/lib/scoring/sources"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useClientDemo } from "@/components/clients/client-demo-context"
import { ProfileHeader } from "./profile-header"
import { SourcesBreakdown } from "./sources-breakdown"
import { RiskHistoryCollapse } from "./risk-history-collapse"

/**
 * ScoringPage — одна карточка: итоговый риск + полоса-разделитель «как сложился балл»,
 * ниже «Источники профиля рисков», внизу «История» (со спрятанным line-графом).
 */
export function ScoringPage({ client }: { client: Client }) {
  const data = useMockData()
  const { demoScore } = useClientDemo()
  const [recalculating, setRecalculating] = React.useState(false)
  const [expanded, setExpanded] = React.useState<Set<ScoreSourceKey>>(
    () => new Set()
  )
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const rowRefs = React.useRef<
    Partial<Record<ScoreSourceKey, HTMLDivElement | null>>
  >({})

  // Демо: при активном демо-балле источники масштабируются под него (итог ≈ демо)
  const breakdown = React.useMemo(
    () => makeScoreBreakdown(client, demoScore ?? undefined),
    [client, demoScore]
  )
  const history = React.useMemo(() => makeScoreHistory(client, 30), [client])
  const dailySeries = React.useMemo(
    () => makeDailyRiskSeries(client, 30),
    [client]
  )
  const triggers = React.useMemo(
    () => makeAnomalousTransactionsList(client, data.transactions),
    [client, data.transactions]
  )
  const categories = React.useMemo(
    () => makeInternalScoringCategories(client),
    [client]
  )
  const news = React.useMemo(() => makeNewsList(client), [client])

  const apiScore = demoScore ?? client.internalScore
  const formulaSum = breakdown.contributions.reduce(
    (s, c) => s + c.contribution,
    0
  )

  const activeAgents = breakdown.sources.filter(
    (s) => s.hasData && !SCORE_SOURCES[s.source].excludeFromFormula
  ).length
  const estimatedSec = Math.round(activeAgents * AGENT_AVG_LATENCY_SEC)

  const baselineText = React.useMemo(() => {
    const txs = data.transactions.filter((t) => t.clientId === client.id)
    if (!txs.length || !triggers.length) return undefined
    const amounts = txs.map((t) => t.amountKZT).sort((a, b) => a - b)
    const median = amounts[Math.floor(amounts.length / 2)]
    const topAvg =
      triggers.length > 0
        ? txs
            .slice()
            .sort((a, b) => b.amountKZT - a.amountKZT)
            .slice(0, triggers.length)
            .reduce((s, t) => s + t.amountKZT, 0) / triggers.length
        : median
    const ratio = Math.max(2, Math.round(topAvg / Math.max(median, 1)))
    return `Базовая линия: ${Math.max(2, Math.round(txs.length / 2))} транзакций/месяц на ~${median.toLocaleString("ru-RU")} ₸. Эти ${triggers.length} выпадают ×${ratio} от типичной суммы`
  }, [data.transactions, client.id, triggers])

  const toggleSource = (source: ScoreSourceKey) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(source)) next.delete(source)
      else next.add(source)
      return next
    })

  const handleRecalc = () => {
    setRecalculating(true)
    toast.info(`Запущен пересчёт: ${activeAgents} агента, ~${estimatedSec} сек`)
    setTimeout(() => {
      setRecalculating(false)
      toast.success("Скоринг пересчитан", {
        description: `Композитный балл: ${apiScore} · конфиг ${breakdown.configVersion}`,
      })
    }, 1800)
  }

  return (
    <TooltipProvider>
      <div className="rounded-2xl border border-border bg-card">
        <ProfileHeader
          finalScore={apiScore}
          formulaSum={formulaSum}
          contributions={breakdown.contributions}
          configVersion={breakdown.configVersion}
          agentsCount={activeAgents}
          estimatedSec={estimatedSec}
          recalculating={recalculating}
          onRecalc={handleRecalc}
        />
        <SourcesBreakdown
          client={client}
          sources={breakdown.sources}
          contributions={breakdown.contributions}
          triggers={triggers}
          categories={categories}
          news={news}
          baselineText={baselineText}
          expanded={expanded}
          onToggle={toggleSource}
          rowRefs={rowRefs}
        />
        <RiskHistoryCollapse
          series={dailySeries}
          entries={history}
          calculatedAt={breakdown.calculatedAt}
          configVersion={breakdown.configVersion}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />
      </div>
    </TooltipProvider>
  )
}
