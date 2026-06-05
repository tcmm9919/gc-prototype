"use client"

import * as React from "react"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { useClient, useMockData } from "@/lib/mock"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    router.replace(qs ? `/clients/${client.id}?${qs}` : `/clients/${client.id}`)
  }

  return (
    <div className="pb-6">
      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        {/* LEFT — identity (sticky) */}
        <aside className="self-start lg:sticky lg:top-28">
          <ClientIdentity client={client} />
        </aside>

        {/* CENTER — tabs + content (scrolls) */}
        <div className="flex min-w-0 flex-col gap-5">
          <Tabs value={currentTab} onValueChange={setTab}>
            <TabsList className="flex h-auto flex-wrap justify-start gap-1.5 bg-transparent p-0">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="h-auto rounded-full border-none bg-transparent px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none dark:hover:bg-white/[0.06]"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
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

        {/* RIGHT — quick actions (sticky) */}
        <aside className="self-start lg:sticky lg:top-28">
          <ClientQuickActions />
        </aside>
      </div>
    </div>
  )
}
