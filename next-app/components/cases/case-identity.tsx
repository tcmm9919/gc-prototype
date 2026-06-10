"use client"

import Link from "next/link"
import { toast } from "sonner"
import { ArrowUp, CheckCircle2, Copy, Sparkles, UserCog } from "lucide-react"
import type { Case, Client } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ext/status-badge"
import { RiskBadge } from "@/components/ext/risk-badge"

const STATUS_LABEL = { open: "Открыто", in_progress: "В работе", in_review: "На проверке", escalated: "Эскалировано", resolved: "Решено", closed: "Закрыто" } as const
const STATUS_TONE = { open: "info", in_progress: "warning", in_review: "info", escalated: "danger", resolved: "success", closed: "muted" } as const
const PRIORITY_LABEL = { low: "Низкий", medium: "Средний", high: "Высокий", critical: "Критический" } as const
const PRIORITY_TONE = { low: "muted", medium: "warning", high: "warning", critical: "danger" } as const

/** Левый фикс-рейл кейса — паспорт + действия (детали/управление живут в табе «Информация о кейсе»). */
export function CaseIdentity({ cs, client }: { cs: Case; client?: Client }) {
  const copyId = () => {
    navigator.clipboard?.writeText(cs.id)
    toast.success("ID кейса скопирован")
  }

  return (
    <div className="flex flex-col gap-4">
      <Block>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-[18px] font-bold tracking-[-0.02em] tabular-nums">{cs.id}</h2>
              <button type="button" onClick={copyId} className="text-muted-foreground transition hover:text-foreground" aria-label="Копировать ID" title="Копировать ID">
                <Copy className="size-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge tone={STATUS_TONE[cs.status]}>{STATUS_LABEL[cs.status]}</StatusBadge>
              <StatusBadge tone={PRIORITY_TONE[cs.priority]}>Приоритет: {PRIORITY_LABEL[cs.priority]}</StatusBadge>
            </div>
            <span className="text-xs text-muted-foreground">{cs.autoCase ? "Авто-кейс · " : ""}{cs.type}</span>
          </div>

          {client ? (
            <Link
              href={`/clients/${client.id}`}
              className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{client.fullName}</span>
                <span className="text-xs text-muted-foreground">{client.id}</span>
              </div>
              <RiskBadge level={client.riskLevel} />
            </Link>
          ) : null}

          {cs.autoCase && cs.ai_decision_summary ? (
            <div className="rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                <Sparkles className="size-3.5" />
                AI-решение{cs.ai_confidence_pct ? ` · уверенность ${cs.ai_confidence_pct}%` : ""}
              </span>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{cs.ai_decision_summary}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            <Button variant="ghost" size="lg" className="w-full justify-center bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/15 hover:text-risk-critical">
              <ArrowUp className="size-4" />
              Эскалировать
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center">
              <UserCog className="size-4" />
              Передать офицеру
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center">
              <CheckCircle2 className="size-4" />
              Закрыть кейс
            </Button>
          </div>
        </div>
      </Block>
    </div>
  )
}
