"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Check, ChevronRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMockData } from "@/lib/mock";
import { ThemeToggle } from "./theme-toggle";
import { NAV_GROUPS } from "./nav-config";

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
  "/settings": "Настройки",
  "/risk-factors": "Риск-факторы",
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
  // Longest-prefix match: prefer "/settings/llm-usage" over the shorter "/settings".
  let best = "";
  let bestTitle = "Главная";
  for (const [route, title] of Object.entries(STATIC_TITLES)) {
    if (normalized.startsWith(route + "/") && route.length > best.length) {
      best = route;
      bestTitle = title;
    }
  }
  return bestTitle;
}

const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function navItemForPath(path: string) {
  const matches = NAV_ITEMS.filter((i) => path === i.href || path.startsWith(i.href + "/"));
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => b.href.length - a.href.length)[0];
}

const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "kk", label: "Қазақша" },
  { code: "en", label: "English" },
];

function LanguageMenu() {
  const [lang, setLang] = React.useState("ru");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Сменить язык">
          <Languages className="size-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            className="justify-between"
          >
            {l.label}
            {lang === l.code ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
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
      <header className="sticky top-0 z-30 flex h-14 items-center bg-card px-8">
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
  const titleNav = navItemForPath(normalizedPath);
  const TitleIcon = titleNav?.icon ?? null;
  // Высокий хедер (как на дашборде) — для дашборда, Настроек, Конструктора.
  // Риск-факторы — обычный список → стандартный мелкий хедер (как Клиенты/Транзакции).
  const TALL_HEADER_PREFIXES = ["/dashboard", "/settings", "/workflows"];
  const isTallHeader = TALL_HEADER_PREFIXES.some(
    (p) => normalizedPath === p || normalizedPath.startsWith(p + "/"),
  );

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between gap-3 px-8 bg-card ${isTallHeader ? "h-16" : "h-14 pt-2"}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        {TitleIcon ? <TitleIcon className="size-[18px] shrink-0 text-foreground" strokeWidth={2.25} /> : null}
        <h1 className="truncate text-[14px] font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <LanguageMenu />
        <Button variant="ghost" size="icon" aria-label="Уведомления" className="relative rounded-full">
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-risk-medium ring-2 ring-background" aria-hidden />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
