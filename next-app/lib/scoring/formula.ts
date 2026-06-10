/**
 * Формула расчёта итогового балла.
 *
 * ⚠️ ГИПОТЕЗА: «взвешенное среднее» НЕ подтверждено банком (open question #1).
 * Когда банк даст реальную формулу — переделать calculateProfileRisk
 * и компонент <ScoreFormulaBreakdown>.
 */
import { SCORE_SOURCES, getRiskConfig, type ScoreSourceKey } from "./sources"

export type ScoreSourceData = {
  source: ScoreSourceKey
  score: number
  confidence: number
  weight: number
  hasData: boolean
  /** ISO timestamp последнего прогона */
  lastRun: string
  /** Подпись: что сделано / что сработало */
  note: string
}

export type ScoreContribution = {
  source: ScoreSourceKey
  contribution: number
  weight: number
  score: number
}

export type ScoreBreakdown = {
  finalScore: number
  category: "low" | "medium" | "high" | "critical"
  sources: ScoreSourceData[]
  contributions: ScoreContribution[]
  formulaVersion: "weighted-average-v1"
  configVersion: string
  calculatedAt: string
}

export function calculateProfileRisk(
  sources: ScoreSourceData[],
  configVersion = "risk_v2.4"
): ScoreBreakdown {
  const eligible = sources.filter(
    (s) => s.hasData && !SCORE_SOURCES[s.source].excludeFromFormula
  )

  const totalWeight = eligible.reduce((sum, s) => sum + s.weight, 0) || 1

  const contributions: ScoreContribution[] = eligible.map((s) => ({
    source: s.source,
    score: s.score,
    weight: s.weight,
    contribution: (s.score * s.weight) / totalWeight,
  }))

  const finalScore = Math.round(
    contributions.reduce((sum, c) => sum + c.contribution, 0)
  )

  return {
    finalScore,
    category: getRiskConfig(finalScore).key,
    sources,
    contributions,
    formulaVersion: "weighted-average-v1",
    configVersion,
    calculatedAt: sources.reduce(
      (max, s) => (s.lastRun > max ? s.lastRun : max),
      sources[0]?.lastRun ?? new Date(0).toISOString()
    ),
  }
}
