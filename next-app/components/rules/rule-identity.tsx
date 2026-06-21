"use client"

import * as React from "react"
import { toast } from "sonner"
import { Copy, Download, Trash2 } from "lucide-react"
import type { Rule } from "@/lib/mock"
import { useMockData } from "@/lib/mock"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ext/status-badge"
import { formatDateTime } from "@/lib/format"

const ENTITY_LABEL: Record<string, string> = { client: "Клиенты", transaction: "Транзакции", group: "Группы" }
const SEVERITY_LABEL = { low: "Низкая", medium: "Средняя", high: "Высокая", critical: "Критическая" } as const
const SEVERITY_TONE = { low: "info", medium: "warning", high: "warning", critical: "danger" } as const

export function RuleIdentity({ rule }: { rule: Rule }) {
  const data = useMockData()
  const author = data.users.find((u) => u.id === rule.authorId)?.fullName ?? rule.authorId
  const sev = rule.severity ?? "high"

  return (
    <div className="flex flex-col gap-4">
      <Block>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] font-semibold tracking-[0.4px] text-muted-foreground uppercase">Правило</span>
            <h2 className="font-heading text-[16px] font-bold leading-tight tracking-[-0.02em]">{rule.name}</h2>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge tone="muted">{ENTITY_LABEL[rule.entity] ?? rule.entity}</StatusBadge>
              <StatusBadge tone={SEVERITY_TONE[sev]}>{SEVERITY_LABEL[sev]}</StatusBadge>
              <StatusBadge tone={rule.enabled ? "success" : "muted"}>{rule.enabled ? "Включено" : "Выключено"}</StatusBadge>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{rule.id}</span>
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
            <Row label="Автор" value={author} />
            <Row label="Обновлено" value={formatDateTime(rule.updatedAt)} />
            <Row label="Условий" value={rule.conditions.length} />
          </div>

          <div className="flex flex-col gap-2.5">
            <Button size="lg" className="w-full justify-center" onClick={() => toast.success("Правило сохранено")}>
              Сохранить
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center"><Copy className="size-4" />Клонировать</Button>
            <Button variant="outline" size="lg" className="w-full justify-center"><Download className="size-4" />JSON</Button>
            <Button variant="ghost" size="lg" className="w-full justify-center bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/15 hover:text-risk-critical">
              <Trash2 className="size-4" />Удалить
            </Button>
          </div>
        </div>
      </Block>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  )
}
