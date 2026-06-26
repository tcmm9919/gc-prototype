"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, Bell, Briefcase, User } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useMockData, useTransaction } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ext/status-badge"
import { formatCurrency } from "@/lib/format"
import { TransactionIdentity } from "./transaction-identity"

const OP_KIND: Record<string, string> = { incoming: "in", outgoing: "out", transfer: "out", exchange: "exchange", cash: "cash" }
const SEVERITY_TONE = { low: "info", medium: "warning", high: "warning", critical: "danger" } as const
const CASE_STATUS_LABEL = { open: "Открыто", in_progress: "В работе", in_review: "На проверке", escalated: "Эскалировано", resolved: "Решено", closed: "Закрыто" } as const
const CASE_STATUS_TONE = { open: "info", in_progress: "warning", in_review: "info", escalated: "danger", resolved: "success", closed: "muted" } as const

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
}

export function TransactionDetail({ id }: { id: string }) {
  const tx = useTransaction(id)
  const data = useMockData()
  const [tab, setTab] = React.useState("info")

  if (!tx) {
    const first = data.transactions[0]
    if (!first) return null
    return <TransactionDetail id={first.id} />
  }

  const client = data.clients.find((c) => c.id === tx.clientId)
  const alerts = data.alerts.filter((a) => a.transactionId === tx.id)
  const cases = data.cases.filter((c) => c.linkedTransactionIds.includes(tx.id))

  const HIGH_RISK_COUNTRIES = ["AE", "TR", "CY", "RU", "IR", "KP", "AF"]
  type RiskFlag = { label: string; hint: string; tone: "danger" | "warning" | "info" }
  const riskFlags: RiskFlag[] = []
  if (tx.amountKZT >= 5_000_000)
    riskFlags.push({ label: "Крупная сумма", hint: "Операция свыше 5 млн ₸", tone: "warning" })
  if (tx.currency && tx.currency !== "KZT")
    riskFlags.push({ label: "Валютная операция", hint: `Операция в ${tx.currency}`, tone: "info" })
  if (tx.counterparty?.country && HIGH_RISK_COUNTRIES.includes(tx.counterparty.country))
    riskFlags.push({ label: "Юрисдикция повышенного риска", hint: `Контрагент из ${tx.counterparty.country}`, tone: "danger" })
  if (tx.riskLevel === "high" || tx.riskLevel === "critical")
    riskFlags.push({ label: tx.riskLevel === "critical" ? "Критический риск операции" : "Высокий риск операции", hint: "Оценка скоринг-модели операции", tone: tx.riskLevel === "critical" ? "danger" : "warning" })
  if (alerts.length > 0)
    riskFlags.push({ label: `Сработавших правил: ${alerts.length}`, hint: "По операции есть оповещения", tone: "danger" })
  for (const t of tx.tags ?? []) riskFlags.push({ label: t, hint: "Тег операции", tone: "warning" })

  const TABS: Array<{ value: string; label: string; count?: number; countTone?: "medium" | "primary" }> = [
    { value: "info", label: "Информация об операции" },
    { value: "parties", label: "Стороны операции" },
    { value: "risk", label: "Риск-флаги", count: riskFlags.length, countTone: "medium" },
    { value: "alerts", label: "Оповещения", count: alerts.length, countTone: "medium" },
    { value: "cases", label: "Связанные кейсы", count: cases.length, countTone: "primary" },
  ]
  const activeLabel = TABS.find((t) => t.value === tab)?.label ?? ""

  return (
    <div className="pb-6 pt-5">
      <div className="grid items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <TransactionIdentity tx={tx} client={client} />
        </aside>

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <TabsList className="flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 group-data-horizontal/tabs:h-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="-mb-px h-auto flex-none whitespace-nowrap rounded-t-lg rounded-b-none border border-transparent bg-transparent px-4 py-2.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus:outline-none focus-visible:ring-0 data-[state=active]:border-border data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none group-data-[variant=default]/tabs-list:data-active:shadow-none"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {t.label}
                    {t.count && t.count > 0 ? (
                      <span
                        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums ${
                          t.countTone === "primary"
                            ? "bg-primary/15 text-primary"
                            : "bg-risk-medium/15 text-risk-medium"
                        }`}
                      >
                        {t.count}
                      </span>
                    ) : null}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="client-shell rounded-b-2xl rounded-tr-2xl border border-t-0 border-border bg-card p-4 md:p-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <h3 className="mb-5 inline-flex items-center gap-2 font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">
                    {tab === "alerts" ? <AlertTriangle className="size-5 text-risk-medium" /> : null}
                    {tab === "risk" ? <AlertTriangle className="size-5 text-risk-high" /> : null}
                    {tab === "cases" ? <Briefcase className="size-5 text-primary" /> : null}
                    {activeLabel}
                  </h3>

                  {/* Информация об операции + Банковская */}
                  {tab === "info" && (
                    <>
                      <div className="divide-y divide-border/60">
                        <Field label="Номер операции" value={tx.id} mono />
                        <Field label="Дата загрузки" value={fmtDateTime(tx.date)} />
                        <Field label="Код назначения" value={tx.purposeCode || "—"} />
                        <Field label="Количество участников" value="—" />
                        <Field label="Сумма" value={formatCurrency(tx.amount, tx.currency)} />
                        <Field label="В тенге" value={tx.currency !== "KZT" ? formatCurrency(tx.amountKZT, "KZT") : "—"} />
                        <Field label="Дата документа-основания" value="—" />
                        <Field label="Номер документа-основания" value="—" />
                        <Field label="Вид операции" value={OP_KIND[tx.type] ?? tx.type} />
                        <Field label="Вид перевода" value={tx.type} />
                        <Field label="Назначение платежа" value={tx.purposeDescription} />
                        <Field label="Доп. информация" value={tx.additionalInfo ?? "—"} />
                      </div>
                      <div className="mt-4 border-t border-border pt-4">
                        <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Банковская информация</p>
                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                          <div className="space-y-2.5">
                            <p className="text-xs font-medium text-foreground">Банк отправителя</p>
                            <KV label="Наименование банка" value={tx.branchName ?? "—"} />
                            <KV label="Местонахождение" value="—" />
                            <KV label="Код банка/филиала" value={tx.branchCode ?? "—"} mono />
                            <KV label="Номер счёта" value={tx.counterparty.iban ?? "—"} mono />
                          </div>
                          <div className="space-y-2.5">
                            <p className="text-xs font-medium text-foreground">Банк получателя</p>
                            <KV label="Наименование банка" value="—" />
                            <KV label="Местонахождение" value="—" />
                            <KV label="Код банка/филиала" value="—" mono />
                            <KV label="Номер счёта" value="—" mono />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Стороны операции: Отправитель | Получатель */}
                  {tab === "parties" && (
                    <div className="grid gap-6 sm:grid-cols-2 sm:divide-x sm:divide-border">
                      <div className="space-y-2.5 sm:pr-6">
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Отправитель</p>
                        {client ? (
                          <>
                            <Link href={`/clients/${client.id}`} className="block text-sm font-semibold text-primary hover:underline">{client.fullName}</Link>
                            <KV label="ИИН/БИН" value={client.iin ?? client.bin ?? "—"} mono />
                            <KV label="Резидентство" value={client.countryFullName ?? client.country ?? "—"} />
                            <KV label="Тип участника" value={client.type === "legal" ? "legal" : "individual"} />
                            <KV label="Статус ПДЛ" value={client.pep ? "Да" : "Нет"} />
                            <KV label="Дата рождения" value={client.birthDate ?? "—"} />
                            <KV label="Место рождения" value={client.birthplace ?? "—"} />
                            <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
                              <Link href={`/clients/${client.id}`}><User className="size-3.5" />Открыть карточку</Link>
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">{tx.clientId}</p>
                        )}
                      </div>
                      <div className="space-y-2.5 sm:pl-6">
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Получатель</p>
                        {tx.counterparty?.name ? (
                          <>
                            <KV label="Наименование" value={tx.counterparty.name} />
                            <KV label="Страна" value={tx.counterparty.country ?? "—"} />
                            <KV label="Счёт" value={tx.counterparty.iban ?? "—"} mono />
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Получатель не указан</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Риск-флаги */}
                  {tab === "risk" && (
                    riskFlags.length > 0 ? (
                      <ul className="space-y-2">
                        {riskFlags.map((f, i) => (
                          <li
                            key={`${f.label}-${i}`}
                            className="flex items-center justify-between gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2.5 dark:bg-white/[0.03]"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <AlertTriangle
                                className={`size-3.5 shrink-0 ${
                                  f.tone === "danger" ? "text-risk-critical" : f.tone === "warning" ? "text-risk-high" : "text-muted-foreground"
                                }`}
                              />
                              <span className="truncate text-sm font-medium">{f.label}</span>
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">{f.hint}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Риск-флагов по операции нет</p>
                    )
                  )}

                  {/* Оповещения */}
                  {tab === "alerts" && (
                    alerts.length > 0 ? (
                      <ul className="space-y-2">
                        {alerts.map((a) => (
                          <li key={a.id}>
                            <Link href={`/alerts/${a.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
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
                    ) : (
                      <p className="text-sm text-muted-foreground">Нет оповещений по этой транзакции</p>
                    )
                  )}

                  {/* Связанные кейсы */}
                  {tab === "cases" && (
                    cases.length > 0 ? (
                      <ul className="space-y-2">
                        {cases.map((c) => (
                          <li key={c.id}>
                            <Link href={`/cases/${c.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2.5 transition hover:bg-foreground/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-medium">{c.id}</span>
                                  <StatusBadge tone={CASE_STATUS_TONE[c.status]}>{CASE_STATUS_LABEL[c.status]}</StatusBadge>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">{c.autoCase ? "Auto-case · " : ""}{c.type}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Нет связанных кейсов</p>
                    )
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
    <div className="grid grid-cols-[160px_1fr] items-start gap-2 py-2 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs break-all" : ""} text-foreground`}>{value}</span>
    </div>
  )
}

function KV({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className={`text-sm ${mono ? "font-mono text-xs break-all text-muted-foreground" : "text-foreground"}`}>{value}</div>
    </div>
  )
}
