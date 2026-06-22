import type { ScenarioPreset } from "./types";
import {
  seedAgents,
  seedAlerts,
  seedAudit,
  seedCases,
  seedClients,
  seedLLMUsage,
  seedRiskFactors,
  seedRules,
  seedScenarios,
  seedTransactions,
  seedUsers,
} from "./seeds";
import {
  morningShiftAlerts,
  morningShiftChatAlerts,
  morningShiftAIcases,
  morningShiftScenarios,
} from "./scenarios/morning-shift-busy";

export interface ScenarioBundle {
  clients: typeof seedClients;
  transactions: typeof seedTransactions;
  alerts: typeof seedAlerts;
  cases: typeof seedCases;
  rules: typeof seedRules;
  scenarios: typeof seedScenarios;
  agents: typeof seedAgents;
  audit: typeof seedAudit;
  llmUsage: typeof seedLLMUsage;
  riskFactors: typeof seedRiskFactors;
  users: typeof seedUsers;
}

const full: ScenarioBundle = {
  clients: seedClients,
  transactions: seedTransactions,
  alerts: seedAlerts,
  cases: seedCases,
  rules: seedRules,
  scenarios: seedScenarios,
  agents: seedAgents,
  audit: seedAudit,
  llmUsage: seedLLMUsage,
  riskFactors: seedRiskFactors,
  users: seedUsers,
};

const morningShiftBusy: ScenarioBundle = {
  ...full,
  alerts: [...morningShiftAlerts, ...morningShiftChatAlerts, ...full.alerts],
  cases: [...morningShiftAIcases, ...full.cases],
  scenarios: [...morningShiftScenarios, ...full.scenarios],
};

export const scenarioPresets: Record<ScenarioPreset, ScenarioBundle> = {
  morningShiftBusy,
  normalDay: full,
  busyDay: {
    ...full,
    alerts: [...full.alerts, ...full.alerts.slice(0, 30).map((a) => ({ ...a, id: `${a.id}-x`, status: "new" as const }))],
    cases: [...full.cases, ...full.cases.slice(0, 10).map((c) => ({ ...c, id: `${c.id}-x` }))],
  },
  emptyInbox: {
    ...full,
    alerts: [],
    cases: full.cases.filter((c) => c.status === "closed"),
  },
  criticalAlert: {
    ...full,
    alerts: full.alerts.map((a, i) => (i < 5 ? { ...a, severity: "critical" as const, status: "new" as const } : a)),
    clients: full.clients.map((c, i) =>
      // score тоже поднимаем (≥75), чтобы критический уровень совпадал с карточкой клиента
      i < 5 ? { ...c, internalScore: Math.max(c.internalScore, 88), riskLevel: "critical" as const, status: "review" as const } : c,
    ),
  },
};

export const scenarioLabels: Record<ScenarioPreset, string> = {
  morningShiftBusy: "Утренняя смена ЦПК",
  normalDay: "Обычный день",
  busyDay: "Загруженный день",
  emptyInbox: "Пустой инбокс",
  criticalAlert: "Критический алерт",
};
