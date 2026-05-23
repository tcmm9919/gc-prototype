"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useCommandPalette } from "./command-palette";
import { ProfileMenu } from "./profile-menu";

const STATIC_TITLES: Record<string, string> = {
  "/dashboard": "Главная",
  "/clients": "Клиенты",
  "/styleguide/dashboard-legacy": "Старый дашборд",
  "/transactions": "Транзакции",
  "/chat": "Чат",
  "/rules": "Правила",
  "/alerts": "Оповещения",
  "/cases": "Кейсы",
  "/workflows": "Конструктор сценариев",
  "/workflows/builder": "Новый сценарий",
  "/ai": "AI-Инструменты",
  "/agents": "AI-Инструменты",
  "/agents/compliance-officer": "Compliance Officer AI",
  "/instructions": "ML Модели",
  "/llm-usage": "Использование LLM",
  "/audit": "Журнал аудита",
  "/settings/users": "Пользователи",
  "/settings/system": "Системные настройки",
  "/settings/risk-factors": "Риск-факторы",
  "/profile": "Профиль",
};

function deriveTitle(pathname: string): string {
  const normalized = pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
  if (STATIC_TITLES[normalized]) return STATIC_TITLES[normalized];
  for (const [route, title] of Object.entries(STATIC_TITLES)) {
    if (normalized.startsWith(route + "/")) return title;
  }
  return "Главная";
}

export function AppHeader() {
  const { open } = useCommandPalette();
  const pathname = usePathname() ?? "";
  const title = deriveTitle(pathname);
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const isDashboard = normalizedPath === "/dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-24 items-center justify-between gap-3 px-8">
      <h1 className="font-heading text-[28px] font-bold tracking-[-0.02em] text-foreground leading-none">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {isDashboard && (
          <div className="hidden md:flex items-center gap-1.5 mr-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[12px] text-muted-foreground">
              Смена идёт · обновлено только что
            </span>
          </div>
        )}
        <button
          onClick={open}
          className="hidden md:inline-flex h-9 w-72 items-center gap-2.5 rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.07] px-3 pr-1.5 text-[13px] text-muted-foreground hover:text-foreground border border-foreground/[0.06] transition-all"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">Search clients, alerts, cases…</span>
          <span className="inline-flex items-center gap-0.5 rounded-md border border-foreground/[0.08] bg-foreground/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shrink-0">
            ⌘K
          </span>
        </button>
        <Button variant="ghost" size="icon" onClick={open} className="md:hidden rounded-full" aria-label="Поиск">
          <Search className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Уведомления" className="relative rounded-full">
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-risk-medium ring-2 ring-background" aria-hidden />
        </Button>
        <ThemeToggle />
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-full bg-primary/15 hover:bg-primary/20 text-primary border border-primary/25 transition-colors"
          aria-label="Switch organization"
        >
          <Globe className="size-3.5" />
          <span className="text-[12px] font-medium">Freedom Bank</span>
          <ChevronDown className="size-3.5" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
