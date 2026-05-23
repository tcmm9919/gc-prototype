"use client";

import { useMockStore } from "./store";
import { scenarioPresets, type ScenarioBundle } from "./scenarios";
import { currentUser } from "./seeds";

export { useMockStore } from "./store";
export { scenarioLabels, scenarioPresets } from "./scenarios";
export { currentUser } from "./seeds";
export * from "./types";
export * from "./factories";

export function useMockData(): ScenarioBundle {
  return useMockStore((s) => s.data);
}

export function useClient(id: string) {
  const data = useMockData();
  return data.clients.find((c) => c.id === id);
}

export function useTransaction(id: string) {
  const data = useMockData();
  return data.transactions.find((t) => t.id === id);
}

export function useAlert(id: string) {
  const data = useMockData();
  return data.alerts.find((a) => a.id === id);
}

export function useCase(id: string) {
  const data = useMockData();
  return data.cases.find((c) => c.id === id);
}

export function useUser(id: string) {
  const data = useMockData();
  return data.users.find((u) => u.id === id) ?? currentUser;
}
