"use client"

import * as React from "react"

/** Демо-значения: по одному на каждый уровень риска (показать все цвета shine) */
const DEMO_SCORES = [18, 40, 62, 88]

interface ClientDemoValue {
  /** Активное демо-значение балла или null (реальный балл клиента) */
  demoScore: number | null
  /** Переключить демо по кругу: null → 18 → 40 → 62 → 88 → 18 … */
  cycle: () => void
}

const ClientDemoContext = React.createContext<ClientDemoValue | null>(null)

/** Провайдер демо-риска — общий для сайдбара (Risk Score) и таба «Скоринг». */
export function ClientDemoProvider({ children }: { children: React.ReactNode }) {
  const [idx, setIdx] = React.useState<number | null>(null)
  const value = React.useMemo<ClientDemoValue>(
    () => ({
      demoScore: idx === null ? null : DEMO_SCORES[idx],
      cycle: () =>
        setIdx((p) => (p === null ? 0 : (p + 1) % DEMO_SCORES.length)),
    }),
    [idx]
  )
  return (
    <ClientDemoContext.Provider value={value}>
      {children}
    </ClientDemoContext.Provider>
  )
}

/** Хук демо-риска. Вне провайдера — безопасный no-op (реальный балл). */
export function useClientDemo(): ClientDemoValue {
  return (
    React.useContext(ClientDemoContext) ?? { demoScore: null, cycle: () => {} }
  )
}
