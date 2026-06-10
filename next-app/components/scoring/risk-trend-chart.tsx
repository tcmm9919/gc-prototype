"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RiskTrendChartProps {
  /** Дневной ряд риска 0–100 (последняя точка = сегодня). Обычно 30 точек. */
  data: number[]
  height?: number
}

/** Подписи оси X — номера дней */
const DAY_TICKS = [1, 5, 10, 15, 20, 25, 30]

const W = 800
const H = 200
const PAD_X = 4
const PAD_TOP = 14
const PAD_BOTTOM = 8

/**
 * RiskTrendChart — увеличенный line-граф риска за 30 дней (raw SVG, стиль sparkline).
 * Линия/заливка — цвет риск-тренда (растёт=янтарь, падает=зелёный). Ось X — номера дней.
 * end-dot — HTML-оверлей (идеальный круг при растяжении SVG). Единый x-scale x() для линии,
 * точки и подписей оси — чтобы подпись «30» совпадала с конечной точкой.
 */
export function RiskTrendChart({ data, height = 200 }: RiskTrendChartProps) {
  const n = data.length
  if (n < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = Math.max(max - min, 10)
  const x = (i: number) => (i / (n - 1)) * (W - PAD_X * 2) + PAD_X
  const y = (v: number) =>
    H - PAD_BOTTOM - ((v - min) / span) * (H - PAD_TOP - PAD_BOTTOM)

  const line = data
    .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ")
  const area = `${line} L${x(n - 1).toFixed(1)},${H - PAD_BOTTOM} L${x(0).toFixed(1)},${H - PAD_BOTTOM} Z`
  const rising = data[n - 1] >= data[0]
  const grid = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="w-full">
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className={cn(
            "block w-full",
            rising ? "text-risk-medium" : "text-risk-low"
          )}
          style={{ height }}
          aria-hidden
        >
          {grid.map((f) => {
            const yy = PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)
            return (
              <line
                key={f}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={yy}
                y2={yy}
                className="stroke-border"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
          <path d={area} fill="currentColor" fillOpacity={0.08} />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* end-dot — HTML overlay */}
        <span
          className={cn(
            "absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card",
            rising ? "bg-risk-medium" : "bg-risk-low"
          )}
          style={{
            left: `${(x(n - 1) / W) * 100}%`,
            top: `${(y(data[n - 1]) / H) * 100}%`,
          }}
          aria-hidden
        />
      </div>
      {/* Ось X — номера дней (тот же x-scale) */}
      <div className="relative mt-2 h-4">
        {DAY_TICKS.filter((d) => d - 1 < n).map((d) => (
          <span
            key={d}
            className="absolute -translate-x-1/2 text-[11px] text-muted-foreground tabular-nums"
            style={{ left: `${(x(d - 1) / W) * 100}%` }}
            aria-hidden
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}
