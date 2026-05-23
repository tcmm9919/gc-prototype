"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ScenarioPreset,
  Alert,
  AlertStatus,
  Case,
  Client,
  Rule,
  Transaction,
  AlertSeverity,
  CaseStatus,
  CasePriority,
  TransactionStatus,
} from "./types";
import { scenarioPresets, type ScenarioBundle } from "./scenarios";
import { currentUser } from "./seeds";

function clonePreset(preset: ScenarioBundle): ScenarioBundle {
  return structuredClone(preset);
}

function newCaseId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `CASE-${date}-${rand}`;
}

function newAlertId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AL-MANUAL-${rand}`;
}

interface MockStore {
  // UI state
  scenario: ScenarioPreset;
  sidebarCollapsed: boolean;
  authed: boolean;

  // Mutable data layer (cloned from scenario preset)
  data: ScenarioBundle;

  // UI setters
  setScenario: (s: ScenarioPreset) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setAuthed: (v: boolean) => void;

  // Bulk mutations (patch in-place)
  bulkUpdateAlerts: (ids: string[], patch: Partial<Alert>) => void;
  bulkUpdateCases: (ids: string[], patch: Partial<Case>) => void;
  bulkUpdateTransactions: (ids: string[], patch: Partial<Transaction>) => void;

  // Remove mutations (items disappear from the list)
  bulkRemoveAlerts: (ids: string[]) => void;
  bulkRemoveCases: (ids: string[]) => void;
  bulkRemoveTransactions: (ids: string[]) => void;

  // Upsert/restore mutations (replace existing by id, or prepend missing — used for undo)
  bulkUpsertAlerts: (items: Alert[]) => void;
  bulkUpsertCases: (items: Case[]) => void;
  bulkUpsertTransactions: (items: Transaction[]) => void;

  // Client mutations
  bulkUpdateClients: (ids: string[], patch: Partial<Client>) => void;
  bulkUpsertClients: (items: Client[]) => void;

  // Rule mutations
  bulkUpdateRules: (ids: string[], patch: Partial<Rule>) => void;
  bulkUpsertRules: (items: Rule[]) => void;
  bulkRemoveRules: (ids: string[]) => void;

  // Side-effect mutations
  takeAlertsToWork: (alertIds: string[]) => string[]; // returns new case IDs
  createAlertsFromTransactions: (txIds: string[]) => string[]; // returns new alert IDs
}

export const useMockStore = create<MockStore>()(
  persist(
    (set, get) => ({
      scenario: "morningShiftBusy",
      sidebarCollapsed: false,
      authed: true,
      data: clonePreset(scenarioPresets.morningShiftBusy),

      setScenario: (scenario) =>
        set({
          scenario,
          data: clonePreset(scenarioPresets[scenario]),
        }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setAuthed: (authed) => set({ authed }),

      bulkUpdateAlerts: (ids, patch) =>
        set((state) => ({
          data: {
            ...state.data,
            alerts: state.data.alerts.map((a) =>
              ids.includes(a.id) ? { ...a, ...patch } : a
            ),
          },
        })),

      bulkUpdateCases: (ids, patch) =>
        set((state) => ({
          data: {
            ...state.data,
            cases: state.data.cases.map((c) =>
              ids.includes(c.id) ? { ...c, ...patch } : c
            ),
          },
        })),

      bulkUpdateTransactions: (ids, patch) =>
        set((state) => ({
          data: {
            ...state.data,
            transactions: state.data.transactions.map((t) =>
              ids.includes(t.id) ? { ...t, ...patch } : t
            ),
          },
        })),

      bulkRemoveAlerts: (ids) =>
        set((state) => ({
          data: { ...state.data, alerts: state.data.alerts.filter((a) => !ids.includes(a.id)) },
        })),

      bulkRemoveCases: (ids) =>
        set((state) => ({
          data: { ...state.data, cases: state.data.cases.filter((c) => !ids.includes(c.id)) },
        })),

      bulkRemoveTransactions: (ids) =>
        set((state) => ({
          data: {
            ...state.data,
            transactions: state.data.transactions.filter((t) => !ids.includes(t.id)),
          },
        })),

      bulkUpsertAlerts: (items) =>
        set((state) => {
          const idSet = new Set(items.map((a) => a.id));
          const itemMap = new Map(items.map((a) => [a.id, a]));
          const missing = items.filter((a) => !state.data.alerts.some((x) => x.id === a.id));
          return {
            data: {
              ...state.data,
              alerts: [...missing, ...state.data.alerts.map((a) => (idSet.has(a.id) ? itemMap.get(a.id)! : a))],
            },
          };
        }),

      bulkUpsertCases: (items) =>
        set((state) => {
          const idSet = new Set(items.map((c) => c.id));
          const itemMap = new Map(items.map((c) => [c.id, c]));
          const missing = items.filter((c) => !state.data.cases.some((x) => x.id === c.id));
          return {
            data: {
              ...state.data,
              cases: [...missing, ...state.data.cases.map((c) => (idSet.has(c.id) ? itemMap.get(c.id)! : c))],
            },
          };
        }),

      bulkUpsertTransactions: (items) =>
        set((state) => {
          const idSet = new Set(items.map((t) => t.id));
          const itemMap = new Map(items.map((t) => [t.id, t]));
          const missing = items.filter((t) => !state.data.transactions.some((x) => x.id === t.id));
          return {
            data: {
              ...state.data,
              transactions: [
                ...missing,
                ...state.data.transactions.map((t) => (idSet.has(t.id) ? itemMap.get(t.id)! : t)),
              ],
            },
          };
        }),

      bulkUpdateClients: (ids, patch) =>
        set((state) => ({
          data: {
            ...state.data,
            clients: state.data.clients.map((c) => (ids.includes(c.id) ? { ...c, ...patch } : c)),
          },
        })),

      bulkUpsertClients: (items) =>
        set((state) => {
          const idSet = new Set(items.map((c) => c.id));
          const itemMap = new Map(items.map((c) => [c.id, c]));
          const missing = items.filter((c) => !state.data.clients.some((x) => x.id === c.id));
          return {
            data: {
              ...state.data,
              clients: [...missing, ...state.data.clients.map((c) => (idSet.has(c.id) ? itemMap.get(c.id)! : c))],
            },
          };
        }),

      bulkUpdateRules: (ids, patch) =>
        set((state) => ({
          data: {
            ...state.data,
            rules: state.data.rules.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)),
          },
        })),

      bulkUpsertRules: (items) =>
        set((state) => {
          const idSet = new Set(items.map((r) => r.id));
          const itemMap = new Map(items.map((r) => [r.id, r]));
          const missing = items.filter((r) => !state.data.rules.some((x) => x.id === r.id));
          return {
            data: {
              ...state.data,
              rules: [...missing, ...state.data.rules.map((r) => (idSet.has(r.id) ? itemMap.get(r.id)! : r))],
            },
          };
        }),

      bulkRemoveRules: (ids) =>
        set((state) => ({
          data: { ...state.data, rules: state.data.rules.filter((r) => !ids.includes(r.id)) },
        })),

      takeAlertsToWork: (alertIds) => {
        const { data } = get();
        const alerts = data.alerts.filter((a) => alertIds.includes(a.id));
        const newCases: Case[] = alerts.map((alert) => ({
          id: newCaseId(),
          type: `Из оповещения: ${alert.ruleName}`,
          clientId: alert.clientId,
          status: "in_progress" as CaseStatus,
          priority: (
            alert.severity === "critical"
              ? "critical"
              : alert.severity === "high"
              ? "high"
              : alert.severity === "medium"
              ? "medium"
              : "low"
          ) as CasePriority,
          responsibleId: currentUser.id,
          openedAt: new Date().toISOString(),
          slaDueAt:
            alert.deadline ??
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          description: `Кейс создан вручную из оповещения ${alert.id}.`,
          linkedAlertIds: [alert.id],
          linkedTransactionIds: alert.transactionId ? [alert.transactionId] : [],
          tags: ["bulk-take"],
          commentCount: 0,
          evidenceCount: 0,
          subtaskCount: 0,
        }));
        const caseIds = newCases.map((c) => c.id);

        set((state) => ({
          data: {
            ...state.data,
            cases: [...newCases, ...state.data.cases],
            alerts: state.data.alerts.map((a) =>
              alertIds.includes(a.id)
                ? {
                    ...a,
                    responsibleId: currentUser.id,
                    status: "in_progress" as AlertStatus,
                  }
                : a
            ),
          },
        }));

        return caseIds;
      },

      createAlertsFromTransactions: (txIds) => {
        const { data } = get();
        const txs = data.transactions.filter((t) => txIds.includes(t.id));
        const newAlerts: Alert[] = txs.map((tx) => ({
          id: newAlertId(),
          date: new Date().toISOString(),
          clientId: tx.clientId,
          transactionId: tx.id,
          ruleId: "manual",
          ruleName: "Ручная проверка",
          severity: (tx.priority === "high" ? "high" : "medium") as AlertSeverity,
          status: "new" as const,
          responsibleId: currentUser.id,
        }));

        set((state) => ({
          data: {
            ...state.data,
            alerts: [...newAlerts, ...state.data.alerts],
          },
        }));

        return newAlerts.map((a) => a.id);
      },
    }),
    {
      name: "gcp-mock-store",
      // НЕ персистим data — она reset'ится из preset при reload
      partialize: (state) => ({
        scenario: state.scenario,
        sidebarCollapsed: state.sidebarCollapsed,
        authed: state.authed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.data = clonePreset(scenarioPresets[state.scenario]);
        }
      },
    },
  ),
);

// Helper для использования вне React-компонентов (если нужен doc/builder)
export const _unusedStatusUnion: TransactionStatus = "completed";
