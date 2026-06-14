"use client"

import * as React from "react"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { useClient, useMockData } from "@/lib/mock"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const TABS = [
  { value: "overview", label: "Обзор" },
  { value: "scoring", label: "Скоринг" },
  { value: "transactions", label: "Транзакции" },
  { value: "alerts", label: "Оповещения" },
  { value: "cases", label: "Кейсы" },
  { value: "edd", label: "EDD" },
  { value: "news", label: "Новости" },
  { value: "history", label: "История" },
  { value: "documents", label: "Документы" },
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
  const setTab = (next: string) => {
    const sp = new URLSearchParams(params?.toString() ?? "")
    if (next === "overview") sp.delete("tab")
    else sp.set("tab", next)
    const qs = sp.toString()
    router.replace(
      qs ? `/clients/${client.id}?${qs}` : `/clients/${client.id}`,
      { scroll: false },
    )
  }

  return (
    <div className="pb-6 pt-5">
      <ClientDemoProvider key={client.id}>
        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          {/* LEFT — identity (фикс-колонка, sticky) */}
          <aside className="self-start lg:sticky lg:top-20">
            <ClientIdentity client={client} />
          </aside>

          {/* CENTER — folder tabs + content card (scrolls) */}
          <div className="min-w-0">
            <Tabs value={currentTab} onValueChange={setTab} className="gap-0">
              <TabsList className="flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 group-data-horizontal/tabs:h-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <h3 className="mb-5 font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">
                      {TABS.find((t) => t.value === currentTab)?.label ?? ""}
                    </h3>
                    {currentTab === "overview" && <ClientOverview client={client} />}
                    {currentTab === "scoring" && <ClientScoring client={client} />}
                    {currentTab === "transactions" && (
                      <ClientTransactions clientId={client.id} />
                    )}
                    {currentTab === "alerts" && <ClientAlerts clientId={client.id} />}
                    {currentTab === "cases" && <ClientCases clientId={client.id} />}
                    {currentTab === "edd" && <ClientEDD />}
                    {currentTab === "news" && <ClientNews />}
                    {currentTab === "history" && (
                      <ClientHistory clientId={client.id} />
                    )}
                    {currentTab === "documents" && <ClientDocuments />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>

          {/* RIGHT — быстрые действия (фикс-колонка, sticky) */}
          <aside className="self-start lg:col-span-2 lg:sticky lg:top-20 xl:col-span-1">
            <ClientQuickActions />
          </aside>
        </div>
      </ClientDemoProvider>
    </div>
  )
}
