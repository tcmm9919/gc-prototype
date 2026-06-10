"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import type { InternalScoringCategory } from "@/lib/scoring/sources"
import { cn } from "@/lib/utils"

/**
 * Drill-down «Внутренний скоринг» — перенос блока 9 категорий типологий
 * со сработавшими признаками (+15 / −30) с прежней страницы Скоринга.
 */
export function InternalScoringDrillDown({
  categories,
}: {
  categories: InternalScoringCategory[]
}) {
  // По умолчанию раскрыта первая категория со сработавшими признаками
  const firstTriggered = categories.findIndex((c) => c.triggered.length > 0)
  const [open, setOpen] = React.useState<Set<number>>(
    () => new Set(firstTriggered >= 0 ? [firstTriggered] : [])
  )

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <div className="flex flex-col divide-y divide-border">
      {categories.map((cat, i) => {
        const expanded = open.has(i)
        return (
          <div key={cat.name} className="py-2 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="text-xs font-medium">{cat.name}</span>
              <span className="inline-flex shrink-0 items-center gap-2 text-[10px] whitespace-nowrap text-muted-foreground">
                {cat.triggered.length} / {cat.total} сработало
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    expanded && "rotate-180"
                  )}
                />
              </span>
            </button>
            {expanded ? (
              cat.triggered.length > 0 ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  {cat.triggered.map((cr) => (
                    <div
                      key={cr.code}
                      className="flex items-center gap-2 rounded-lg bg-foreground/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03]"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {cr.code}
                      </span>
                      <span className="flex-1">{cr.label}</span>
                      {cr.meta ? (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {cr.meta}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          cr.weight.startsWith("−")
                            ? "text-risk-low"
                            : "text-risk-medium"
                        )}
                      >
                        {cr.weight}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Нет сработавших критериев
                </p>
              )
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
