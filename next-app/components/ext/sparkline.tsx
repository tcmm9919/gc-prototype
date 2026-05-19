import * as React from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "./status-dot";

const TONE_FILL: Record<StatusTone, string> = {
  success: "fill-risk-low stroke-risk-low",
  warning: "fill-risk-medium stroke-risk-medium",
  danger: "fill-risk-critical stroke-risk-critical",
  info: "fill-primary stroke-primary",
  muted: "fill-muted-foreground/60 stroke-muted-foreground/60",
};

/**
 * Tiny inline SVG. Decoration-as-data — place next to a metric to show
 * its trend without claiming chart-level space. Pure SVG = automatic
 * reduced-motion compliance.
 */
export function Sparkline({
  data,
  variant = "bars",
  width = 64,
  height = 20,
  tone = "info",
  className,
  ariaLabel,
}: {
  data: number[];
  variant?: "bars" | "line";
  width?: number;
  height?: number;
  tone?: StatusTone;
  className?: string;
  ariaLabel?: string;
}) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padY = 2;

  const norm = (v: number) => height - padY - ((v - min) / range) * (height - padY * 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      className={cn(TONE_FILL[tone], className)}
    >
      {variant === "bars" ? <Bars data={data} width={width} height={height} norm={norm} /> : null}
      {variant === "line" ? <LineArea data={data} width={width} height={height} norm={norm} /> : null}
    </svg>
  );
}

function Bars({
  data,
  width,
  height,
  norm,
}: {
  data: number[];
  width: number;
  height: number;
  norm: (v: number) => number;
}) {
  const slot = width / data.length;
  const barW = Math.max(slot - 1, 1);
  return (
    <g>
      {data.map((v, i) => {
        const y = norm(v);
        return <rect key={i} x={i * slot} y={y} width={barW} height={height - y} rx={0.75} />;
      })}
    </g>
  );
}

function LineArea({
  data,
  width,
  height,
  norm,
}: {
  data: number[];
  width: number;
  height: number;
  norm: (v: number) => number;
}) {
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => `${i * step},${norm(v)}`);
  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${(data.length - 1) * step},${height} L0,${height} Z`;
  return (
    <g>
      <path d={areaPath} className="opacity-15" stroke="none" />
      <path d={linePath} fill="none" strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}
