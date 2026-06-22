"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bot,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/ext/empty-state"
import { StatusBadge } from "@/components/ext/status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useMockData, type Agent } from "@/lib/mock"

function pluralTools(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} инструмент`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return `${n} инструмента`
  return `${n} инструментов`
}

const MOCK_RESPONSES: Record<string, string> = {
  "AG-1":
    "Получено 3 новых оповещения.\n\n• AL-MORN-01 (critical, 999 300 KZT) → DISPATCH: создан кейс CASE-20260621-A1, запущен воркфлоу «EDD углублённая проверка».\n• AL-MORN-02 (high, 999 400 KZT) → ESCALATE: сумма > 50 000 USD-экв., эскалировано менеджеру Madina S.\n• AL-MORN-03 (medium, 580 000 KZT) → SKIP: дубликат AL-4412, пропущен с комментарием.\n\nSummary-письмо отправлено на madina.satybaldiyeva@globerce.capital.",
  "AG-2":
    "Клиент: ТОО «Caspian Trade Group» (CLT-007)\n\nИсточники средств:\n1. Основной доход — выручка от оптовой торговли (78% поступлений)\n2. Межфирменные переводы от связанных компаний (15%)\n3. Прочие поступления (7%)\n\nСверка с анкетой KYC: заявлен «оптовая торговля» — подтверждено.\nСанкционный скрининг контрагентов: чисто (0 совпадений).\n\nЗаключение: ПОДТВЕРЖДЁН.",
  "AG-3":
    "Compliance Summary — CLT-007\n\nСтатус: CLEAR\nRisk Score: 34 (Medium)\n\nКлючевые находки:\n• PEP-статус: не выявлен\n• Санкционный скрининг: чисто\n• Adverse media: 0 совпадений\n• Страна контрагентов: KZ, RU (обе — не в чёрном списке FATF)\n\nРекомендация: стандартный мониторинг, пересмотр через 12 месяцев.",
  "AG-4":
    "Описание рисков — CLT-012 «Жумабеков Е.К.»\n\n1. Географический риск: транзакции с контрагентами из RU (серая зона FATF) — 23% от объёма за 6 мес.\n2. Объёмный риск: средний чек вырос в 3.2 раза за последний квартал без видимого изменения деятельности.\n3. Структурный риск: 4 транзакции в диапазоне 980 000–999 999 KZT (возможное дробление для обхода порога 1 000 000).\n4. PEP-статус: не выявлен.\n\nИсточник данных: transaction_history (6 мес.), screening_results, risk_factors.",
}

type RunState = "idle" | "running" | "done"

function AgentRunPopover({
  agent,
  children,
}: {
  agent: Agent
  children: React.ReactNode
}) {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [useTools, setUseTools] = React.useState(true)
  const [runState, setRunState] = React.useState<RunState>("idle")
  const [response, setResponse] = React.useState("")
  const [iteration, setIteration] = React.useState(0)

  function handleRun() {
    setRunState("running")
    setIteration(1)
    setResponse("")

    setTimeout(() => {
      setIteration(2)
    }, 800)

    setTimeout(() => {
      setRunState("done")
      setResponse(
        MOCK_RESPONSES[agent.id] ??
          `Агент «${agent.name}» завершил выполнение. Результатов не найдено.`,
      )
    }, 1800)
  }

  function handleReset() {
    setRunState("idle")
    setInput("")
    setResponse("")
    setIteration(0)
  }

  function handleOpenChange(open: boolean) {
    setPopoverOpen(open)
    if (!open) handleReset()
  }

  return (
    <Popover open={popoverOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[420px] p-0 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-3 p-4">
          <Textarea
            placeholder="alert_id или данные клиента (имя, ИИН, ID)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={runState !== "idle"}
            rows={2}
            className="resize-y text-sm"
          />
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={useTools}
                onCheckedChange={(v) => setUseTools(v === true)}
                disabled={runState !== "idle"}
              />
              Использовать инструменты
            </label>
            <Button
              size="sm"
              onClick={handleRun}
              disabled={runState === "running" || (!input.trim() && runState === "idle")}
            >
              {runState === "running" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CirclePlay className="size-4" />
              )}
              Запустить
            </Button>
          </div>
        </div>

        {runState !== "idle" && (
          <div className="border-t px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ChevronRight className="size-3" />
              <span className="font-medium text-foreground">
                запуск: {agent.name}
              </span>
            </div>
            <div className="ml-4 mt-0.5 text-xs text-muted-foreground">
              {runState === "running" ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  итерация {iteration}…
                </span>
              ) : (
                <span>итерация 2 — завершено</span>
              )}
            </div>

            {response && (
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground/90">
                {response}
              </pre>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const [open, setOpen] = React.useState(false)

  const successRuns = agent.lastRuns.filter(
    (r) => r.status === "success",
  ).length
  const totalRuns = agent.lastRuns.length

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <h3 className="font-heading text-base font-semibold leading-tight">
                {agent.name}
              </h3>
              <p className="text-sm leading-snug text-muted-foreground">
                {agent.description}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge tone={agent.enabled ? "success" : "muted"}>
              {agent.enabled ? "Активен" : "Выключен"}
            </StatusBadge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-mono">{agent.model}</span>
          <span className="flex items-center gap-1">
            <Wrench className="size-3" />
            {pluralTools(agent.tools.length)}
          </span>
          <span>
            {totalRuns > 0
              ? `${successRuns}/${totalRuns} успешных запусков`
              : "Нет запусков"}
          </span>
        </div>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-1.5 border border-border/60 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            >
              <ChevronDown
                className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
              Системный промпт
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground/80">
              {agent.instructionsMd}
            </pre>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center gap-2 pt-1">
          <AgentRunPopover agent={agent}>
            <Button size="sm" variant="outline">
              <CirclePlay className="size-4" />
              Запустить
            </Button>
          </AgentRunPopover>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Редактировать ${agent.name}`}
            onClick={() => toast.info(`Редактирование «${agent.name}»`)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={
              agent.enabled
                ? `Выключить ${agent.name}`
                : `Включить ${agent.name}`
            }
            onClick={() =>
              toast.info(
                agent.enabled
                  ? `Агент «${agent.name}» выключен`
                  : `Агент «${agent.name}» включён`,
              )
            }
          >
            {agent.enabled ? (
              <PowerOff className="size-4" />
            ) : (
              <Power className="size-4" />
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                aria-label={`Удалить ${agent.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить агента?</AlertDialogTitle>
                <AlertDialogDescription>
                  Агент «{agent.name}» будет удалён вместе с системным промптом
                  и настройками инструментов. Это действие необратимо.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    toast.warning(`Агент «${agent.name}» удалён`)
                  }
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  const data = useMockData()
  const agents = data.agents

  return (
    <div className="mx-auto w-full max-w-3xl pt-6 pb-12">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/ai">AI</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Агенты</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button size="xl" asChild>
          <Link href="/ai/agents/new">
            <Plus className="size-4" />
            Новый агент
          </Link>
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Bot className="size-7" />}
            title="Агентов пока нет"
            description="Создайте первого AI-агента для автоматизации комплаенс-задач."
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
