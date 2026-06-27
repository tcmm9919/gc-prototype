"use client"

import { usePathname } from "next/navigation"
import { SettingsRail } from "@/components/settings/settings-rail"
import { SETTINGS_NAV_ITEMS } from "@/components/settings/settings-nav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ""
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname
  const active = SETTINGS_NAV_ITEMS.find((i) => normalized === i.href)

  return (
    <div className="pb-12 pt-4">
      {/* Один глобальный остров: рейл слева + контент справа */}
      <div className="flex h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:flex-row">
        {/* LEFT — навигационный рейл (фиксирован, не скроллится вместе с контентом) */}
        <div className="shrink-0 overflow-y-auto border-b border-border p-3 lg:w-[220px] lg:border-b-0 lg:border-r">
          <SettingsRail />
        </div>

        {/* RIGHT — контент со своим вертикальным скроллом (остров фиксирован по высоте).
            Скоуп-правило: все вложенные Card получают видимый контур и в светлой теме. */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-card p-5 md:p-6 [&_[data-slot=card]]:border-border">
          {active ? (
            <div className="pb-6">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">{active.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
