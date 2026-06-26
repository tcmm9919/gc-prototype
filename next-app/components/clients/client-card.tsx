"use client"

import * as React from "react"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  User,
  Gauge,
  ArrowLeftRight,
  Bell,
  Folder,
  FileSearch,
  Newspaper,
  History,
  FileText,
} from "lucide-react"

import { useClient, useMockData } from "@/lib/mock"
import { cn } from "@/lib/utils"

import { ClientDemoProvider } from "./client-demo-context"
import { ClientIdentity } from "./client-identity"
import { ClientQuickActions } from "./client-quick-actions"
import { ClientOverview } from "./tabs/overview"
import { ClientScoring } from "./tabs/scoring"
import { ClientTransactions } from "./tabs/transactions"
import { ClientAlerts } from "./tabs/alerts"
import { ClientCases } from "./tabs/cases"
import { ClientEDD } from "./tabs/edd"
import { ClientNews } from "./tabs/news"
import { ClientHistory } from "./tabs/history"
import { ClientDocuments } from "./tabs/documents"

type SectionIcon = typeof User
const SECTIONS: { value: string; label: string; icon: SectionIcon }[] = [
  { value: "overview", label: "Обзор", icon: User },
  { value: "scoring", label: "Скоринг", icon: Gauge },
  { value: "transactions", label: "Транзакции", icon: ArrowLeftRight },
  { value: "alerts", label: "Оповещения", icon: Bell },
  { value: "cases", label: "Кейсы", icon: Folder },
  { value: "edd", label: "EDD", icon: FileSearch },
  { value: "news", label: "Новости", icon: Newspaper },
  { value: "history", label: "История", icon: History },
  { value: "documents", label: "Документы", icon: FileText },
]

export function ClientCard({ id }: { id: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const client = useClient(id)
  const data = useMockData()

  if (!client) {
    const first = data.clients[0]
    if (!first) return notFound()
    return <ClientCard id={first.id} />
  }

  const currentTab = params?.get("tab") ?? "overview"
  // Карточные разделы: центральный блок во всю высоту экрана, список скроллится
  // внутри, пагинация прибита снизу.
  const isCardTab = currentTab === "transactions" || currentTab === "alerts" || currentTab === "cases"

  // Счётчики объёма прямо в навигации (видно не заходя в раздел).
  const counts: Record<string, number> = {
    transactions: data.transactions.filter((t) => t.clientId === client.id).length,
    alerts: data.alerts.filter((a) => a.clientId === client.id).length,
    cases: data.cases.filter((c) => c.clientId === client.id).length,
  }

  const setTab = (next: string) => {
    const sp = new URLSearchParams(params?.toString() ?? "")
    if (next === "overview") sp.delete("tab")
    else sp.set("tab", next)
    const qs = sp.toString()
    router.replace(qs ? `/clients/${client.id}?${qs}` : `/clients/${client.id}`, { scroll: false })
  }

  return (
    <div className="pb-6 pt-5">
      <ClientDemoProvider key={client.id}>
        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          {/* LEFT — разделы (вверху) + быстрые действия (под рейлом), sticky */}
          <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <nav
              role="tablist"
              aria-orientation="vertical"
              aria-label="Разделы клиента"
              className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card p-2"
            >
              {SECTIONS.map((s) => {
                const active = currentTab === s.value
                const Icon = s.icon
                const count = counts[s.value]
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(s.value)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
                      active
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="client-section-active"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    ) : null}
                    <Icon className="size-4 shrink-0" strokeWidth={2} />
                    <span className="flex-1 truncate text-left">{s.label}</span>
                    {count != null ? (
                      <span className={cn("text-xs tabular-nums", active ? "text-foreground/70" : "text-muted-foreground/60")}>
                        {count}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </nav>

            <ClientQuickActions />
          </aside>

          {/* CENTER — контент активного раздела, во всю высоту экрана */}
          <div className="min-w-0">
            <div className="client-shell flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <h3 className="mb-5 shrink-0 font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">
                    {SECTIONS.find((s) => s.value === currentTab)?.label ?? ""}
                  </h3>
                  {isCardTab ? (
                    <>
                      {currentTab === "transactions" && <ClientTransactions clientId={client.id} />}
                      {currentTab === "alerts" && <ClientAlerts clientId={client.id} />}
                      {currentTab === "cases" && <ClientCases clientId={client.id} />}
                    </>
                  ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      {currentTab === "overview" && <ClientOverview client={client} />}
                      {currentTab === "scoring" && <ClientScoring client={client} />}
                      {currentTab === "edd" && <ClientEDD />}
                      {currentTab === "news" && <ClientNews />}
                      {currentTab === "history" && <ClientHistory clientId={client.id} />}
                      {currentTab === "documents" && <ClientDocuments />}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — пассапорт клиента (контекст), sticky */}
          <aside className="self-start lg:col-span-2 lg:sticky lg:top-20 xl:col-span-1">
            <ClientIdentity client={client} />
          </aside>
        </div>
      </ClientDemoProvider>
    </div>
  )
}
