"use client";

import * as React from "react";
import type { DailyUsagePoint } from "@/lib/mock/ai-limits";

const DAY_TICKS = [1, 5, 10, 15, 20, 25, 30];
const VW = 1000;
const VH = 300;
const GRID = [0, 0.25, 0.5, 0.75, 1];

function compact(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/** Округляет максимум до «красивого» значения для оси (1/2/5 × 10^k). */
function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const f = n / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * base;
}

/**
 * Барчарт расхода токенов по дням (raw SVG, как risk-trend-chart).
 * Бары — `fill-primary`, ось Y/X — HTML-оверлеи (чёткий текст при растяжении SVG).
 * Подписи X — номера дней 1…30 (hydration-safe, без absolute-дат).
 */
export function TokenUsageBars({
  data,
  height = 240,
}: {
  data: DailyUsagePoint[];
  height?: number;
}) {
  const n = data.length;
  if (n === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.tokens));
  const niceMax = niceCeil(max);
  const slot = VW / n;
  const barW = slot * 0.62;

  return (
    <div className="w-full">
      <div className="flex">
        {/* Ось Y */}
        <div className="relative mr-2 w-10 shrink-0" style={{ height }} aria-hidden>
          {GRID.map((f) => (
            <span
              key={f}
              className="absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground"
              style={{ top: `${(1 - f) * 100}%` }}
            >
              {compact(Math.round(niceMax * f))}
            </span>
          ))}
        </div>

        {/* График */}
        <div className="relative min-w-0 flex-1" style={{ height }}>
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            preserveAspectRatio="none"
            className="block h-full w-full"
            role="img"
            aria-label="Расход токенов по дням за 30 дней"
          >
            {GRID.map((f) => {
              const y = VH - f * VH;
              return (
                <line
                  key={f}
                  x1={0}
                  x2={VW}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={f === 0 ? undefined : "4 4"}
                />
              );
            })}
            {data.map((d) => {
              const h = (d.tokens / niceMax) * VH;
              const x = (d.day - 1) * slot + (slot - barW) / 2;
              return (
                <rect
                  key={d.day}
                  x={x}
                  y={VH - h}
                  width={barW}
                  height={h}
                  rx={3}
                  className="fill-primary transition-colors"
                >
                  <title>{`День ${d.day}: ${d.tokens.toLocaleString("ru-RU")} ток.`}</title>
                </rect>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Ось X — номера дней */}
      <div className="relative mt-2 ml-12 h-4" aria-hidden>
        {DAY_TICKS.filter((d) => d <= n).map((d) => (
          <span
            key={d}
            className="absolute -translate-x-1/2 text-[11px] tabular-nums text-muted-foreground"
            style={{ left: `${((d - 0.5) / n) * 100}%` }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
