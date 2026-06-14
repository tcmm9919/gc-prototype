"use client"

import { useMockData } from "@/lib/mock"
import { RuleIdentity } from "./rule-identity"
import { RuleBuilder } from "./rule-builder"

export function RuleDetail({ id }: { id: string }) {
  const data = useMockData()
  const rule = data.rules.find((r) => r.id === id) ?? data.rules[0]
  if (!rule) return null

  return (
    <div className="pb-6 pt-5">
      <div className="grid items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <RuleIdentity rule={rule} />
        </aside>
        <div className="min-w-0 rounded-2xl border border-transparent dark:border-border bg-card p-4 md:p-5">
          <RuleBuilder key={rule.id} rule={rule} />
        </div>
      </div>
    </div>
  )
}
