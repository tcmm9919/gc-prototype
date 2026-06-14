"use client"

import { usePathname } from "next/navigation"
import { SettingsRail } from "@/components/settings/settings-rail"
import { SETTINGS_NAV_ITEMS } from "@/components/settings/settings-nav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ""
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname
  const active = SETTINGS_NAV_ITEMS.find((i) => normalized === i.href)

  return (
    <div className="pb-12 pt-6">
      {/* Один глобальный остров: рейл слева + контент справа */}
      <div className="grid min-h-[calc(100dvh-9rem)] overflow-hidden rounded-2xl border border-transparent dark:border-border bg-card lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* LEFT — навигационный рейл (на поверхности острова) */}
        <div className="border-b border-border p-3 lg:border-b-0 lg:border-r">
          <SettingsRail />
        </div>

        {/* RIGHT — контент (белый фон острова) */}
        <div className="min-w-0 bg-card p-5 md:p-6">
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
