"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { NewsItem } from "@/lib/scoring/sources"
import { cn } from "@/lib/utils"

const SENTIMENT_STYLES: Record<NewsItem["sentiment"], string> = {
  NEGATIVE: "bg-risk-critical/12 text-risk-critical",
  NEUTRAL: "bg-foreground/[0.06] text-muted-foreground dark:bg-white/[0.08]",
  POSITIVE: "bg-risk-low/12 text-risk-low",
}

/** Drill-down «Новостной агент»: список совпадений или empty state */
export function NewsListDrillDown({
  news,
  clientId,
}: {
  news: NewsItem[]
  clientId: string
}) {
  if (news.length === 0) {
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        За последние 30 дней adverse media не найдено. Проверено 14 источников:
        Reuters, Bloomberg, Kazinform, Курсив, Forbes.kz, …
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {news.map((n, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 rounded-lg bg-foreground/[0.03] px-3 py-2 dark:bg-white/[0.03]"
        >
          <span
            className={cn(
              "mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
              SENTIMENT_STYLES[n.sentiment]
            )}
          >
            {n.sentiment}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-medium">{n.title}</span>
            <span className="text-[10px] text-muted-foreground">
              {n.source} · {n.date}
            </span>
          </span>
        </div>
      ))}
      <Link
        href={`/clients/${clientId}?tab=news`}
        className="inline-flex items-center gap-1 pl-1 text-xs font-medium text-primary hover:underline"
      >
        Открыть таб Новости
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
