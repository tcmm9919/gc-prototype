"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SETTINGS_NAV_ITEMS } from "./settings-nav"

function isActive(pathname: string, href: string) {
  const n = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname
  return n === href || n.startsWith(href + "/")
}

export function SettingsRail() {
  const pathname = usePathname() ?? ""
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Настройки">
      {SETTINGS_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition-colors",
                active
                  ? "bg-primary/[0.08] font-medium text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
    </nav>
  )
}
