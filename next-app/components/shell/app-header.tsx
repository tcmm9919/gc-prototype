"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, ChevronRight, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockData } from "@/lib/mock";
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

const DETAIL_PARENTS: Record<string, { label: string; list: string }> = {
  clients: { label: "Клиенты", list: "/clients" },
  alerts: { label: "Оповещения", list: "/alerts" },
  cases: { label: "Кейсы", list: "/cases" },
  transactions: { label: "Транзакции", list: "/transactions" },
  rules: { label: "Правила", list: "/rules" },
  workflows: { label: "Сценарии", list: "/workflows" },
};

const RESERVED_SUB = new Set(["new", "builder"]);

function deriveTitle(pathname: string): string {
  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  if (STATIC_TITLES[normalized]) return STATIC_TITLES[normalized];
  for (const [route, title] of Object.entries(STATIC_TITLES)) {
    if (normalized.startsWith(route + "/")) return title;
  }
  return "Главная";
}

export function AppHeader() {
  const { open } = useCommandPalette();
  const pathname = usePathname() ?? "";
  const data = useMockData();

  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const segments = normalizedPath.split("/").filter(Boolean);
  const parentKey = segments[0];
  const idSeg = segments[1];
  const parent = parentKey ? DETAIL_PARENTS[parentKey] : undefined;
  const isDetail = Boolean(parent && idSeg && !RESERVED_SUB.has(idSeg));

  // ─── Detail page → breadcrumbs only ───
  if (isDetail && parent) {
    const id = decodeURIComponent(idSeg);
    const entityLabel =
      parentKey === "clients"
        ? data.clients.find((c) => c.id === id)?.fullName ?? id
        : parentKey === "rules"
          ? data.rules.find((r) => r.id === id)?.name ?? id
          : parentKey === "workflows"
            ? data.scenarios.find((s) => s.id === id)?.name ?? id
            : parentKey === "alerts"
              ? data.alerts.find((a) => a.id === id)?.ruleName ?? `#${id}`
              : id;

    return (
      <header className="sticky top-0 z-30 flex h-24 items-center px-8">
        <nav className="flex items-center gap-2 text-[14px]" aria-label="Хлебные крошки">
          <Link
            href={parent.list}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {parent.label}
          </Link>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
          <span className="truncate font-medium text-foreground">{entityLabel}</span>
        </nav>
      </header>
    );
  }

  // ─── Top-level page → standard header ───
  const title = deriveTitle(pathname);
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
