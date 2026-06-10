"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RiskTrendSparklineProps {
  /** Серия значений 0–100 (обычно 12 точек за 30 дней) */
  data: number[]
  className?: string
  /** Высота svg в px */
  height?: number
}

/**
 * RiskTrendSparkline — лёгкий inline-sparkline на raw SVG (без recharts).
 * Последняя точка подсвечена. Переиспользуется в EntityHeader и дашбордах.
 */
export function RiskTrendSparkline({
  data,
  className,
  height = 48,
}: RiskTrendSparklineProps) {
  const W = 280
  const H = 56
  const pad = 5
  const n = data.length
  if (n < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = Math.max(max - min, 8) // не схлопывать плоские серии
  const x = (i: number) => (i / (n - 1)) * (W - pad * 2) + pad
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2)

  const line = data
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ")
  const area = `${line} L${x(n - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`

  const rising = data[n - 1] >= data[0]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn(
        "w-full",
        rising ? "text-risk-medium" : "text-risk-low",
        className
      )}
      style={{ height }}
      aria-hidden
    >
      <path d={area} fill="currentColor" fillOpacity={0.08} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Последняя точка — highlighted */}
      <circle
        cx={x(n - 1)}
        cy={y(data[n - 1])}
        r={4}
        fill="currentColor"
        fillOpacity={0.25}
      />
      <circle cx={x(n - 1)} cy={y(data[n - 1])} r={2.2} fill="currentColor" />
    </svg>
  )
}
