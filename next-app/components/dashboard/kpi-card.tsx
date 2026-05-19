"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KpiCellProps {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; positive: boolean };
  /** Под-строка с baseline и периодом: "из 207.3k · за 4 недели". */
  previousLabel?: string;
  period?: string;
  index?: number;
  /** Если задан, вся ячейка становится кликабельной ссылкой. */
  href?: string;
}

/**
 * Один KPI-«столбец» внутри KpiGroup. Отдельной рамки и тени не имеет —
 * полагается на родительский Card и divide-x границы между ячейками.
 * При указании href вся ячейка превращается в Link-навигацию.
 */
export function KpiCell({
  label,
  value,
  delta,
  previousLabel,
  period,
  index = 0,
  href,
}: KpiCellProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="-mr-1 -mt-1 size-6 text-muted-foreground opacity-0 transition group-hover:opacity-100"
          aria-label="Действия"
          onClick={(e) => e.preventDefault()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-heading text-3xl font-bold tabular-nums leading-none tracking-tight">
          {value}
        </span>
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
              delta.positive
                ? "bg-risk-low/15 text-risk-low"
                : "bg-risk-critical/15 text-risk-critical",
            )}
          >
            {delta.positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {delta.value}
          </span>
        ) : null}
      </div>

      {previousLabel || period ? (
        <span className="mt-auto text-xs text-muted-foreground tabular-nums">
          {previousLabel}
          {previousLabel && period ? " · " : null}
          {period}
        </span>
      ) : null}
    </>
  );

  const className = "group flex h-full flex-col gap-4 p-5 transition hover:bg-muted/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.22, ease: "easeOut" }}
    >
      {href ? (
        <Link href={href} className={className}>
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </motion.div>
  );
}

/**
 * Связанная группа KPI-ячеек: одна общая Card-обёртка с тонкими
 * вертикальными разделителями между ячейками. Используется на dashboard
 * для верхней «строки» метрик.
 */
export function KpiGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {children}
      </div>
    </Card>
  );
}

// Back-compat alias: чтобы старые импорты KpiCard не сломались.
export const KpiCard = KpiCell;
