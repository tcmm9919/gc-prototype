/**
 * Скоринг — конфигурация источников композитного риска.
 * Используется табом «Скоринг», блоком Risk Score в «Обзоре» и дашбордами.
 */
import {
  Activity,
  FileSearch,
  Newspaper,
  ShieldCheck,
  UserSearch,
  type LucideIcon,
} from "lucide-react"

export type ScoreSourceKey =
  | "anomalous_transactions"
  | "internal_scoring"
  | "edd_agent"
  | "news_agent"
  | "pdl_check"

export type DrillDownType =
  | "transactions"
  | "scoring_categories"
  | "edd_summary"
  | "news_list"
  | "pdl_details"

export interface ScoreSourceMeta {
  label: string
  /** Brand-цвет источника (риск-токены темы) */
  color: string
  icon: LucideIcon
  modelLabel: string
  drillDownType: DrillDownType
  relatedTab: string | null
  /** Визуально приглушён (не подскор) */
  dimmed?: boolean
  /** Не участвует в формуле */
  excludeFromFormula?: boolean
}

export const SCORE_SOURCES: Record<ScoreSourceKey, ScoreSourceMeta> = {
  anomalous_transactions: {
    label: "Аномальные транзакции",
    color: "var(--risk-high)",
    icon: Activity,
    modelLabel: "TSAD v1.2",
    drillDownType: "transactions",
    relatedTab: "transactions",
  },
  internal_scoring: {
    label: "Внутренний скоринг",
    color: "var(--risk-low)",
    icon: ShieldCheck,
    modelLabel: "CTSM v2.0 (Pied Piper)",
    drillDownType: "scoring_categories",
    relatedTab: null,
  },
  edd_agent: {
    label: "EDD-агент",
    color: "var(--risk-medium)",
    icon: FileSearch,
    modelLabel: "edd_full",
    drillDownType: "edd_summary",
    relatedTab: "edd",
  },
  news_agent: {
    label: "Новостной агент",
    color: "oklch(0.62 0.16 255)", // синий
    icon: Newspaper,
    modelLabel: "monitoring_agent",
    drillDownType: "news_list",
    relatedTab: "news",
  },
  // PRD: формула — 4 фактора (30/40/15/15). ПДЛ показывается как отдельная
  // проверка, но НЕ участвует во взвешенном среднем (решение Тимы 2026-06-26).
  pdl_check: {
    label: "Проверка на ПДЛ",
    color: "oklch(0.58 0.19 300)", // фиолетовый
    icon: UserSearch,
    modelLabel: "customers.pdl",
    drillDownType: "pdl_details",
    relatedTab: null,
    dimmed: true,
    excludeFromFormula: true,
  },
}

export const SCORE_SOURCE_KEYS = Object.keys(SCORE_SOURCES) as ScoreSourceKey[]

/** Веса источников — настраивает методолог в Настройки → Риск-факторы */
export const RISK_WEIGHTS: Record<ScoreSourceKey, number> & {
  _config_version: string
  _updated_at: string
} = {
  anomalous_transactions: 0.3,
  internal_scoring: 0.4,
  edd_agent: 0.15,
  news_agent: 0.15,
  pdl_check: 0, // вне формулы (excludeFromFormula)
  _config_version: "risk_v3.0",
  _updated_at: "2026-06-26T00:00:00Z",
}

/** Средняя латентность одного агента (для оценки времени пересчёта), сек */
export const AGENT_AVG_LATENCY_SEC = 7.5
/** Mock-стоимость полного пересчёта в LLM-токенах */
export const RECALC_COST_USD = 0.2

/** Человеческие описания правил-триггеров (для tooltips в drill-down) */
export const RULE_DESCRIPTIONS: Record<string, string> = {
  "IES-1": "Поставка санкционного товара или платёж в санкционную страну",
  "STR-4":
    "Дробление операций: серия сумм чуть ниже порога обязательного контроля",
  "LRG-2":
    "Разовая операция, превышающая типичную сумму клиента в 5 и более раз",
  "GEO-7":
    "Операция с контрагентом из юрисдикции повышенного риска (FATF grey list)",
}

// ─────────────────────────────────── domain types для drill-down'ов ──────

export interface TransactionTrigger {
  id: string
  href: string
  score: number
  /** Сумма + канал */
  title: string
  /** ID + timestamp */
  subtitle: string
  ruleCode: string
}

export interface InternalScoringCriterion {
  code: string
  label: string
  meta?: string
  /** «+15» / «−30» */
  weight: string
}

export interface InternalScoringCategory {
  name: string
  total: number
  triggered: InternalScoringCriterion[]
}

export interface NewsItem {
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
  title: string
  source: string
  date: string
}

export interface ScoreHistoryEntry {
  value: number
  date: string // ISO
}

// ───────────────────────────────────────────────────────── helpers ──────

/** Каноничная конфигурация уровней риска (пороги 25/50/75) */
export function getRiskConfig(score: number) {
  if (score < 25)
    return {
      key: "low" as const,
      label: "Низкий",
      textClass: "text-risk-low",
      barClass: "bg-risk-low",
      tintClass: "bg-risk-low/15",
      shine: "var(--color-risk-low)",
    }
  if (score < 50)
    return {
      key: "medium" as const,
      label: "Средний",
      textClass: "text-risk-medium",
      barClass: "bg-risk-medium",
      tintClass: "bg-risk-medium/15",
      shine: "var(--color-risk-medium)",
    }
  if (score < 75)
    return {
      key: "high" as const,
      label: "Высокий",
      textClass: "text-risk-high",
      barClass: "bg-risk-high",
      tintClass: "bg-risk-high/15",
      shine: "var(--color-risk-high)",
    }
  return {
    key: "critical" as const,
    label: "Критический",
    textClass: "text-risk-critical",
    barClass: "bg-risk-critical",
    tintClass: "bg-risk-critical/15",
    shine: "var(--color-risk-critical)",
  }
}

export const RISK_THRESHOLDS_HINT =
  "Пороги: Низкий 0–24, Средний 25–49, Высокий 50–74, Критический 75+"

/** Подсветка confidence: <50% — красный, <70% — янтарный, иначе secondary */
export function getConfidenceClass(confidence: number): string {
  if (confidence < 50) return "text-risk-critical"
  if (confidence < 70) return "text-risk-medium"
  return "text-muted-foreground"
}
