import type { Alert, Case, Client, Transaction } from "@/lib/mock";
import type { DashboardPeriod } from "@/components/dashboard/period-selector";
import { PERIOD_DAYS } from "@/components/dashboard/period-selector";

export interface PeriodMetric {
  current: number;
  previous: number;
  /** Знаковый процент изменения; null если предыдущий период был нулевой. */
  deltaPct: number | null;
  /** Знаковая абсолютная разница. */
  deltaAbs: number;
}

export interface DashboardMetrics {
  activeClients: PeriodMetric;
  newAlerts: PeriodMetric;
  newCases: PeriodMetric;
  riskyVolumeKZT: PeriodMetric;
}

interface Source {
  clients: Client[];
  alerts: Alert[];
  cases: Case[];
  transactions: Transaction[];
}

const inWindow = (iso: string | undefined, startMs: number, endMs: number): boolean => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= startMs && t < endMs;
};

function pct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function computeMetrics(data: Source, period: DashboardPeriod): DashboardMetrics {
  const now = Date.now();
  const days = PERIOD_DAYS[period];
  const win = days * 86400_000;

  const curStart = now - win;
  const prevStart = now - 2 * win;
  const prevEnd = curStart;

  const activeNow = data.clients.filter((c) => inWindow(c.lastTransactionAt, curStart, now)).length;
  const activePrev = data.clients.filter((c) => inWindow(c.lastTransactionAt, prevStart, prevEnd)).length;

  const alertsNow = data.alerts.filter((a) => inWindow(a.date, curStart, now)).length;
  const alertsPrev = data.alerts.filter((a) => inWindow(a.date, prevStart, prevEnd)).length;

  const casesNow = data.cases.filter((c) => inWindow(c.openedAt, curStart, now)).length;
  const casesPrev = data.cases.filter((c) => inWindow(c.openedAt, prevStart, prevEnd)).length;

  const txRisky = (t: Transaction) => t.riskLevel === "high" || t.riskLevel === "critical";
  const volNow = data.transactions
    .filter((t) => txRisky(t) && inWindow(t.date, curStart, now))
    .reduce((acc, t) => acc + t.amountKZT, 0);
  const volPrev = data.transactions
    .filter((t) => txRisky(t) && inWindow(t.date, prevStart, prevEnd))
    .reduce((acc, t) => acc + t.amountKZT, 0);

  return {
    activeClients: {
      current: activeNow,
      previous: activePrev,
      deltaPct: pct(activeNow, activePrev),
      deltaAbs: activeNow - activePrev,
    },
    newAlerts: {
      current: alertsNow,
      previous: alertsPrev,
      deltaPct: pct(alertsNow, alertsPrev),
      deltaAbs: alertsNow - alertsPrev,
    },
    newCases: {
      current: casesNow,
      previous: casesPrev,
      deltaPct: pct(casesNow, casesPrev),
      deltaAbs: casesNow - casesPrev,
    },
    riskyVolumeKZT: {
      current: volNow,
      previous: volPrev,
      deltaPct: pct(volNow, volPrev),
      deltaAbs: volNow - volPrev,
    },
  };
}

/**
 * Форматирует delta для KPI-карточки.
 * `lessIsBetter=true` — для метрик где рост — это плохо (алерты, кейсы, риск-объём).
 */
export function formatDelta(
  m: PeriodMetric,
  opts: { lessIsBetter?: boolean; mode?: "pct" | "abs" } = {},
): { value: string; positive: boolean } | undefined {
  const { lessIsBetter = false, mode = "pct" } = opts;
  if (m.deltaAbs === 0) return undefined;
  const isUp = m.deltaAbs > 0;
  const positive = lessIsBetter ? !isUp : isUp;
  const sign = isUp ? "+" : "−";
  if (mode === "abs" || m.deltaPct === null) {
    return { value: `${sign}${Math.abs(m.deltaAbs)}`, positive };
  }
  return { value: `${sign}${Math.abs(m.deltaPct).toFixed(1)}%`, positive };
}

export const PERIOD_LABEL: Record<DashboardPeriod, string> = {
  "1d": "за сегодня",
  "7d": "за 7 дней",
  "30d": "за 30 дней",
  "90d": "за 90 дней",
};
