"use client"

import * as React from "react"
import { Play, Send, Sparkles, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"

const FAVORITE_SCENARIOS = [
  { id: "block", name: "Блокировка клиента" },
  { id: "doc-report", name: "Отчёт по документации от клиента" },
  { id: "full-check", name: "Полная проверка клиента — 6 шагов" },
  { id: "sanction-mail", name: "Санкционная проверка с отправкой на почту" },
]

const PROMPT_CHIPS = ["Санкционный скрининг", "Adverse media", "Объяснить риск", "Черновик SAR"]

export function ClientQuickActions() {
  const [aiPrompt, setAiPrompt] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const run = (label: string) => {
    toast.success(`Запущено: ${label}`, { description: "AI обработает и вернёт результат" })
    setOpen(false)
    setAiPrompt("")
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card p-4">
      {/* мягкое свечение — «AI» */}
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-primary/25 blur-3xl" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold leading-tight">AI Быстрые действия</p>
            <p className="text-xs text-muted-foreground">Проверки и сценарии по клиенту</p>
          </div>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
              <Sparkles className="size-4" />
              Открыть ассистента
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={12}
            className="w-[360px] rounded-2xl border-border/70 p-0 shadow-xl"
          >
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold leading-tight">AI-ассистент</p>
                  <p className="text-[11px] text-muted-foreground">Опишите задачу или выберите готовое</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Проверить по санкционным спискам, запустить adverse media…"
                  rows={3}
                  className="resize-none rounded-xl border-border/70 bg-foreground/[0.02] text-sm dark:bg-white/[0.03]"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAiPrompt((p) => (p ? `${p}. ${c}` : c))}
                      className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground transition-opacity hover:opacity-90"
                  disabled={!aiPrompt.trim()}
                  onClick={() => run(aiPrompt.trim())}
                >
                  <Send className="size-3.5" />
                  Запустить
                </Button>
              </div>

              <div className="border-t border-border/60 pt-3">
                <p className="mb-2 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">
                  Готовые сценарии
                </p>
                <ul className="flex flex-col gap-1.5">
                  {FAVORITE_SCENARIOS.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => run(s.name)}
                        className="group flex w-full items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2 text-left transition-colors hover:bg-primary/10 dark:bg-white/[0.03]"
                      >
                        <span className="text-xs">{s.name}</span>
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                          <Play className="size-2.5" fill="currentColor" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  onClick={() => run("Открыть полный AI-чат")}
                >
                  Перейти в AI-чат
                  <ArrowUpRight className="size-3" />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
