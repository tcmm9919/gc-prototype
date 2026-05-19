"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScenarioPreset } from "./types";

interface MockStore {
  scenario: ScenarioPreset;
  setScenario: (s: ScenarioPreset) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  authed: boolean;
  setAuthed: (v: boolean) => void;
}

export const useMockStore = create<MockStore>()(
  persist(
    (set) => ({
      scenario: "normalDay",
      setScenario: (scenario) => set({ scenario }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      authed: true,
      setAuthed: (authed) => set({ authed }),
    }),
    { name: "gcp-mock-store" },
  ),
);
