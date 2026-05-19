"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { ThemeToggle } from "./theme-toggle";
import { useCommandPalette } from "./command-palette";
import { ProfileMenu } from "./profile-menu";

/**
 * Linear-clean header — translucent backdrop, prominent search, minimal chrome.
 * On /dashboard the left slot shows the date instead of the breadcrumb «Дашборд».
 */
export function AppHeader() {
  const { open } = useCommandPalette();
  const pathname = usePathname() ?? "";
  const isDashboard = pathname === "/dashboard";

  const formattedDate = new Date().toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      {isDashboard ? (
        <span className="text-[13px] font-medium text-muted-foreground capitalize">
          {formattedDate}
        </span>
      ) : (
        <AppBreadcrumbs />
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={open}
          className="hidden md:inline-flex h-9 w-72 items-center gap-2.5 rounded-lg bg-surface px-3 pr-1.5 text-[13px] text-ink-soft hover:text-foreground border border-border hover:border-border-strong hover:shadow-xs transition-all"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">Search clients, alerts, cases…</span>
          <span className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shrink-0">
            ⌘K
          </span>
        </button>
        <Button variant="ghost" size="icon" onClick={open} className="md:hidden rounded-lg" aria-label="Поиск">
          <Search className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Уведомления" className="relative rounded-lg">
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-risk-medium ring-2 ring-background" aria-hidden />
        </Button>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
