"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { formatDateTime } from "@/lib/format"

interface EddSummaryDrillDownProps {
  clientId: string
  lastRun: string
  score: number
}

/** Drill-down «EDD-агент»: summary последнего отчёта + метаданные */
export function EddSummaryDrillDown({
  clientId,
  lastRun,
  score,
}: EddSummaryDrillDownProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs leading-relaxed text-muted-foreground">
        {score >= 50
          ? "Источник средств подтверждён частично: справка о доходах покрывает ~60% оборота. Рекомендовано запросить документы по дивидендным выплатам."
          : "Расширенная проверка завершена без существенных замечаний: источник средств подтверждён, бенефициары установлены."}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span>Версия отчёта: edd_full v3</span>
        <span>Дата: {formatDateTime(lastRun)}</span>
        <span>Длительность генерации: 42 сек</span>
      </div>
      <Link
        href={`/clients/${clientId}?tab=edd`}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Открыть полный EDD-отчёт
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
