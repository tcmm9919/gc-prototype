"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, Plus, RefreshCcw, Upload } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useMockData, type Case } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ext/status-badge"
import { Money } from "@/components/ext/money-kzt"
import { formatDateTime } from "@/lib/format"
import { CaseIdentity } from "./case-identity"

const STATUS_LABEL = { open: "Открыто", in_progress: "В работе", in_review: "На проверке", escalated: "Эскалировано", resolved: "Решено", closed: "Закрыто" } as const

const SEVERITY_TONE = { low: "info", medium: "warning", high: "warning", critical: "danger" } as const

const TABS = [
  { value: "info", label: "Информация о кейсе" },
  { value: "activity", label: "Активность" },
]

export function CaseDetail({ id }: { id: string }) {
  const data = useMockData()
  const cs = data.cases.find((c) => c.id === id) ?? data.cases[0]
  const [tab, setTab] = React.useState("info")
  const [actTab, setActTab] = React.useState("comments")
  const [status, setStatus] = React.useState<Case["status"]>(cs?.status ?? "open")
  const [assignee, setAssignee] = React.useState<string>(cs?.responsibleId ?? "")
  if (!cs) return null

  const client = data.clients.find((c) => c.id === cs.clientId)
  const linkedAlerts = data.alerts.filter((a) => cs.linkedAlertIds.includes(a.id))
  const linkedTx = data.transactions.filter((t) => cs.linkedTransactionIds.includes(t.id))
  const assignees = [
    { id: "USR-AI", name: "Compliance Officer AI" },
    ...data.users
      .filter((u) => u.id !== "USR-AI")
      .map((u) => ({ id: u.id, name: u.fullName })),
  ]

  return (
    <div className="pb-6 pt-5">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <CaseIdentity cs={cs} client={client} />
        </aside>

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0 group-data-horizontal/tabs:h-auto">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="-mb-px h-auto flex-none whitespace-nowrap rounded-t-lg rounded-b-none border border-transparent bg-transparent px-4 py-2.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus:outline-none focus-visible:ring-0 data-[state=active]:border-border data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none group-data-[variant=default]/tabs-list:data-active:shadow-none"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="client-shell rounded-b-2xl rounded-tr-2xl border border-t-0 border-border bg-card p-4 md:p-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: "easeOut" }}>
                  <h3 className="mb-5 font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">
                    {TABS.find((t) => t.value === tab)?.label ?? ""}
                  </h3>

                  {tab === "info" && (
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-card p-5">
                          <h4 className="mb-4 font-heading text-[15px] font-semibold">Детали</h4>
                          <div className="space-y-3">
                            <Field label="Клиент" value={client ? <Link href={`/clients/${client.id}`} className="text-primary hover:underline">{client.fullName}</Link> : "—"} />
                            <Field label="Номер кейса" value={cs.id} mono />
                            <Field label="Создано" value={formatDateTime(cs.openedAt)} />
                            <Field label="Обновлено" value={formatDateTime(cs.openedAt)} />
                            <Field label="Комментариев" value={cs.commentCount} />
                            <Field label="Вложений" value={cs.evidenceCount} />
                            <Field label="Пунктов" value={cs.subtaskCount} />
                          </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5">
                          <h4 className="mb-4 font-heading text-[15px] font-semibold">Управление</h4>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground">Исполнитель</label>
                              <Select value={assignee} onValueChange={setAssignee}>
                                <SelectTrigger className="w-full shadow-sm">
                                  <SelectValue placeholder="Выберите исполнителя" />
                                </SelectTrigger>
                                <SelectContent>
                                  {assignees.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground">Статус</label>
                              <Select value={status} onValueChange={(v) => setStatus(v as Case["status"])}>
                                <SelectTrigger className="w-full shadow-sm">
                                  <SelectValue placeholder="Выберите статус" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(STATUS_LABEL) as Array<Case["status"]>).map((s) => (
                                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-[130px_1fr] gap-2 text-sm">
                              <span className="pt-0.5 text-xs text-muted-foreground">SLA до</span>
                              <span>{formatDateTime(cs.slaDueAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {linkedTx.length > 0 ? (
                        <div className="rounded-2xl border border-border bg-card p-5">
                          <h4 className="mb-4 font-heading text-[15px] font-semibold">Связанные транзакции <span className="ml-1 font-normal text-muted-foreground">{linkedTx.length}</span></h4>
                          <ul className="space-y-2">
                            {linkedTx.map((t) => (
                              <li key={t.id}>
                                <Link href={`/transactions/${t.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                                  <div className="flex min-w-0 flex-col leading-tight">
                                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                                    <span className="truncate text-sm font-medium">{t.counterparty.name}</span>
                                  </div>
                                  <Money amount={t.amount} currency={t.currency} amountKZT={t.amountKZT} />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {linkedAlerts.length > 0 ? (
                        <div className="rounded-2xl border border-border bg-card p-5">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <h4 className="inline-flex items-center gap-2 font-heading text-[15px] font-semibold">
                              <Bell className="size-4 text-risk-high" />
                              Связанные оповещения
                              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-risk-high/15 px-1.5 text-xs font-medium text-risk-high tabular-nums">
                                {linkedAlerts.length}
                              </span>
                            </h4>
                            <Button variant="outline" size="sm"><RefreshCcw className="size-3.5" />Перепроверить правила</Button>
                          </div>
                          <ul className="space-y-2">
                            {linkedAlerts.map((a) => (
                              <li key={a.id}>
                                <Link
                                  href={`/alerts/${a.id}`}
                                  className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <Bell className="size-3.5 shrink-0 text-risk-high" />
                                    <span className="shrink-0 text-sm font-medium">Rule Match</span>
                                    <span className="truncate text-sm text-muted-foreground">{a.ruleName}</span>
                                  </span>
                                  <StatusBadge tone={SEVERITY_TONE[a.severity]}>{a.severity}</StatusBadge>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {tab === "activity" && (
                    <Tabs value={actTab} onValueChange={setActTab} className="gap-4">
                      <TabsList className="grid w-full grid-cols-4 rounded-xl bg-muted/60 p-1">
                        {[
                          { value: "comments", label: "Комментарии", count: cs.commentCount },
                          { value: "attachments", label: "Вложения", count: cs.evidenceCount },
                          { value: "checklist", label: "Чек-лист", count: cs.subtaskCount },
                          { value: "timeline", label: "Хронология" },
                        ].map((t) => (
                          <TabsTrigger
                            key={t.value}
                            value={t.value}
                            className="rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                          >
                            {t.label}
                            {t.count !== undefined ? <span className="ml-1.5 tabular-nums text-muted-foreground/70">{t.count}</span> : null}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {/* Комментарии */}
                      <TabsContent value="comments" className="mt-0">
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <h4 className="mb-3 font-heading text-[15px] font-semibold">Комментарии <span className="ml-1 font-normal text-muted-foreground">{cs.commentCount}</span></h4>
                        <Textarea placeholder="Написать комментарий..." rows={2} />
                        <div className="mt-2 flex justify-end">
                          <Button size="sm">Добавить комментарий</Button>
                        </div>
                        <ul className="mt-3 space-y-3">
                          {cs.autoCase ? (
                            <>
                              <CommentRow author="—" time="08.05.2026 12:47" text="Income proof «Screenshot 2026-05-06 at 11.30.01.png» получено через удалённый процесс верификации." />
                              <CommentRow author="Compliance Officer AI" time="06.05.2026 16:52" text="Правила перепроверены против оригинальных данных — все 1 оповещений больше не срабатывают. Кейс закрыт автоматически." aiAuthor />
                              <CommentRow author="—" time="06.05.2026 16:52" text="Заявленный месячный доход извлечён из документа: 6 240 000 KZT, confidence ~0.99." />
                              <CommentRow author="Compliance Officer AI" time="06.05.2026 16:49" text="Compliance Officer AI: кейс открыт автоматически по алерту." aiAuthor />
                            </>
                          ) : (
                            <CommentRow author="—" time="—" text="Комментариев пока нет." />
                          )}
                        </ul>
                      </div>
                      </TabsContent>

                      {/* Вложения */}
                      <TabsContent value="attachments" className="mt-0">
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="font-heading text-[15px] font-semibold">Вложения <span className="ml-1 font-normal text-muted-foreground">{cs.evidenceCount}</span></h4>
                          <Button variant="outline" size="sm"><Upload className="size-3.5" />Загрузить</Button>
                        </div>
                        {cs.evidenceCount > 0 ? (
                          <ul className="space-y-2">
                            <EvidenceRow name="income_anomaly_remediation.pdf" tag="income_proof" />
                            {cs.evidenceCount > 1 ? <EvidenceRow name="Screenshot 2026-05-06 at 11.30.01.png" tag="screenshot" /> : null}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Вложений нет.</p>
                        )}
                      </div>
                      </TabsContent>

                      {/* Чек-лист */}
                      <TabsContent value="checklist" className="mt-0">
                      <div className="rounded-2xl border border-border bg-card p-5">
                        <h4 className="mb-3 font-heading text-[15px] font-semibold">Чек-лист <span className="ml-1 font-normal text-muted-foreground">{cs.subtaskCount}</span></h4>
                        <div className="flex gap-2">
                          <Input placeholder="Новый пункт чек-листа..." className="h-9" />
                          <Button size="sm" className="shrink-0"><Plus className="size-3.5" />Добавить</Button>
                        </div>
                        <ul className="mt-3 space-y-2">
                          {cs.subtaskCount > 0 ? (
                            Array.from({ length: cs.subtaskCount }).map((_, i) => (
                              <li key={i} className="flex items-center gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2 text-sm dark:bg-white/[0.03]">
                                <input type="checkbox" className="size-4" />
                                <span>Пункт {i + 1}: запросить дополнительные документы</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground">Чек-лист пуст.</li>
                          )}
                        </ul>
                      </div>
                      </TabsContent>

                      {/* Хронология */}
                      <TabsContent value="timeline" className="mt-0">
                      <div className="rounded-2xl border border-border bg-card p-6">
                        <h4 className="mb-4 font-heading text-[15px] font-semibold">Хронология</h4>
                        <ol className="relative ml-2 space-y-6 border-l border-foreground/[0.08] pl-7 dark:border-white/[0.10]">
                          <TimelineRow time="06.05.2026 16:52" event="Кейс закрыт автоматически" by="Compliance Officer AI" />
                          <TimelineRow time="06.05.2026 16:52" event="Повторная проверка правил — всё чисто" by="Compliance Officer AI" />
                          <TimelineRow time="06.05.2026 16:50" event="Документ получен" by="клиент" />
                          <TimelineRow time="06.05.2026 16:49" event="Запущен сценарий Income Proof Remediation" by="Compliance Officer AI" />
                          <TimelineRow time="06.05.2026 16:49" event="Кейс открыт автоматически" by="Compliance Officer AI" />
                        </ol>
                      </div>
                      </TabsContent>
                    </Tabs>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 text-sm">
      <span className="pt-0.5 text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  )
}

function CommentRow({ author, time, text, aiAuthor }: { author: string; time: string; text: string; aiAuthor?: boolean }) {
  return (
    <li className="space-y-1 rounded-xl bg-foreground/[0.03] px-3 py-2 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between text-xs">
        <span className={aiAuthor ? "font-medium text-primary" : "font-medium text-foreground"}>{author}</span>
        <span className="text-muted-foreground tabular-nums">{time}</span>
      </div>
      <p className="text-sm">{text}</p>
    </li>
  )
}

function EvidenceRow({ name, tag }: { name: string; tag: string }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-foreground/[0.03] px-3 py-2 dark:bg-white/[0.03]">
      <span className="font-mono text-sm">{name}</span>
      <StatusBadge tone="muted">{tag}</StatusBadge>
    </li>
  )
}

function TimelineRow({ time, event, by }: { time: string; event: string; by: string }) {
  return (
    <li className="relative">
      <span className="absolute -left-[33px] top-1.5 size-2.5 -translate-x-px rounded-full bg-primary ring-4 ring-primary/15" />
      <div className="space-y-0.5">
        <div className="text-sm">{event}</div>
        <div className="text-xs text-muted-foreground tabular-nums">{time} · {by}</div>
      </div>
    </li>
  )
}
