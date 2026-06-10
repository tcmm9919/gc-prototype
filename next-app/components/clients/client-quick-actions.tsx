"use client"

import * as React from "react"
import { Play, Send, Sparkles } from "lucide-react"
import { Block } from "@/components/ext/block"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const FAVORITE_SCENARIOS = [
  { id: "block", name: "Блокировка клиента" },
  { id: "doc-report", name: "Отчёт по документации от клиента" },
  { id: "full-check", name: "Полная проверка клиента 6 шагов" },
  { id: "sanction-mail", name: "Санкционная проверка с отправкой на почту" },
]

export function ClientQuickActions() {
  const [aiPrompt, setAiPrompt] = React.useState("")
  return (
    <Block
      dense
      title={
        <span className="inline-flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Быстрые действия
        </span>
      }
    >
      <Textarea
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        placeholder="Проверить по санкционным спискам, запустить adverse media..."
        rows={3}
        className="resize-none border-foreground/[0.06] bg-foreground/[0.03] text-xs dark:bg-white/[0.04]"
      />
      <div className="mt-2 mb-3 flex items-center justify-end">
        <Button size="sm" disabled={!aiPrompt.trim()}>
          <Send className="size-3.5" />
          Запустить
        </Button>
      </div>
      <div className="border-t border-foreground/[0.06] pt-3 dark:border-white/[0.06]">
        <p className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Готовые сценарии
        </p>
        <ul className="max-h-32 space-y-1.5 overflow-y-auto pr-1">
          {FAVORITE_SCENARIOS.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2 transition hover:bg-foreground/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
            >
              <span className="text-xs">{s.name}</span>
              <button
                type="button"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                aria-label="Запустить"
              >
                <Play className="size-2.5" fill="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Block>
  )
}
