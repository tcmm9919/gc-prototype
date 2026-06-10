"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RefreshCcw, Sparkles } from "lucide-react"
import { toast } from "sonner"

import type { Client } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ext/empty-state"
import { ErrorState } from "@/components/ext/error-state"
import { useStateParam } from "@/components/ext/state-switch"
import { ScoringPage } from "@/components/scoring/scoring-page"

function ScoringSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      {/* Sources rows */}
      <div className="mt-8 space-y-3">
        <Skeleton className="h-[26px] w-full rounded-[6px]" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      {/* History */}
      <Skeleton className="mt-6 h-10 w-full rounded-lg" />
    </div>
  )
}

export function ClientScoring({ client }: { client: Client }) {
  const router = useRouter()
  const state = useStateParam()

  if (state === "loading") return <ScoringSkeleton />
  if (state === "empty")
    return (
      <EmptyState
        icon={<Sparkles className="size-7" />}
        title="У клиента нет рассчитанного скоринга"
        description="Запустите первый расчёт — все активные агенты соберут данные и построят композитный балл."
        action={
          <Button
            onClick={() => toast.info("Запущен первый расчёт · ~30 сек")}
          >
            <RefreshCcw className="size-4" />
            Запустить первый расчёт
          </Button>
        }
      />
    )
  if (state === "error")
    return (
      <ErrorState
        onRetry={() => router.replace(`/clients/${client.id}?tab=scoring`)}
      />
    )

  return <ScoringPage client={client} />
}
