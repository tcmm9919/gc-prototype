"use client"

import * as React from "react"
import { AlertTriangle, Check } from "lucide-react"
import { formatDateTime } from "@/lib/format"

// open question #4: решено — ПДЛ участвует в формуле как критический источник.

/** Списки ПДЛ: какой совпал (match), какие чисты */
const PDL_LISTS: Array<{ label: string; matched: boolean }> = [
  {
    label: "Республиканский список ПДЛ (Агентство РК по противодействию коррупции)",
    matched: false,
  },
  { label: "Списки иностранных публичных должностных лиц (iPDL)", matched: true },
  { label: "Списки национальных публичных должностных лиц (nPDL)", matched: false },
]

/** Drill-down «Проверка на ПДЛ»: по каким спискам проверено и результат */
export function PdlDetailsDrillDown({ lastRun }: { lastRun: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        Проверено {formatDateTime(lastRun)} · результат:{" "}
        <span className="font-medium text-risk-critical">совпадение</span> ·
        влияет на балл (критический вклад)
      </span>
      <div className="flex flex-col gap-1">
        {PDL_LISTS.map((l) => (
          <div
            key={l.label}
            className="flex items-center gap-2 text-[11px] text-muted-foreground"
          >
            {l.matched ? (
              <AlertTriangle className="size-3 shrink-0 text-risk-critical" />
            ) : (
              <Check className="size-3 shrink-0 text-risk-low" />
            )}
            <span className={l.matched ? "text-foreground" : undefined}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
