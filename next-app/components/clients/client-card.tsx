"use client"

import * as React from "react"
import { notFound, useRouter, useSearchParams } from "next/navigation"
import { ArrowUp, ShieldAlert, UserPlus } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useClient, useMockData } from "@/lib/mock"
import { DetailHeader } from "@/components/ext/block"
import { RiskBadge } from "@/components/ext/risk-badge"
import { StatusBadge } from "@/components/ext/status-badge"
import { AssistantPanel } from "@/components/ext/assistant-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

const STATUS_LABELS = {
  active: "Активен",
  review: "На проверке",
  edd: "EDD",
  blocked: "Заблокирован",
} as const

const STATUS_TONE = {
  active: "success",
  review: "warning",
  edd: "info",
  blocked: "danger",
} as const

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

  const responsible = data.users.find((u) => u.id === client.responsibleId)
  const currentTab = params?.get("tab") ?? "overview"

  const setTab = (next: string) => {
    const sp = new URLSearchParams(params?.toString() ?? "")
    if (next === "overview") sp.delete("tab")
    else sp.set("tab", next)
    const qs = sp.toString()
    router.replace(qs ? `/clients/${client.id}?${qs}` : `/clients/${client.id}`)
  }

  return (
    <div className="mx-auto max-w-5xl pb-6">
      {/* Header zone — px-6 чтобы совпадать с px-6 контента вкладок */}
      <div className="flex flex-col gap-4 px-6 pt-4">
        <DetailHeader
          title={client.fullName}
          subtitle={`${client.id} · ${client.type === "legal" ? "Юр. лицо" : "Физ. лицо"} · ${client.segment} · ответственный ${responsible?.fullName ?? "—"}`}
          badges={
            <>
              <RiskBadge level={client.riskLevel} />
              <StatusBadge tone={STATUS_TONE[client.status]}>
                {STATUS_LABELS[client.status]}
              </StatusBadge>
              {client.pep ? (
                <StatusBadge tone="warning">
                  <ShieldAlert className="size-3" />
                  PEP
                </StatusBadge>
              ) : null}
              {client.sanctioned ? (
                <StatusBadge tone="danger">
                  <ShieldAlert className="size-3" />
                  Санкции
                </StatusBadge>
              ) : null}
            </>
          }
          actions={
            <>
              <Button variant="outline" size="sm">
                <ArrowUp className="size-4" />
                Поднять риск
              </Button>
              <Button variant="outline" size="sm">
                <UserPlus className="size-4" />В кейс
              </Button>
              <AssistantPanel
                contextLabel={client.fullName}
                contextSubtitle={`${client.id} · риск ${client.riskLevel} · скор ${client.internalScore}`}
              />
            </>
          }
        />

        {/* Tab chips — горизонтальный wrap-ряд */}
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
      </div>

      {/* Tab content — у каждого таб-компонента свой px-6, совпадает с header zone */}
      <div className="mt-6">
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
              // ClientTransactions (DataTable) без своего px-6 — даём здесь
              <div className="px-6">
                <ClientTransactions clientId={client.id} />
              </div>
            )}
            {currentTab === "alerts" && <ClientAlerts clientId={client.id} />}
            {currentTab === "cases" && <ClientCases clientId={client.id} />}
            {currentTab === "edd" && <ClientEDD />}
            {currentTab === "news" && <ClientNews />}
            {currentTab === "history" && <ClientHistory clientId={client.id} />}
            {currentTab === "documents" && <ClientDocuments />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
