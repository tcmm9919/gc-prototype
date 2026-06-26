"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Users,
  Bell,
  Folder,
  ArrowLeftRight,
  ListChecks,
  AlertOctagon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Loader2,
  Settings2,
} from "lucide-react";
import { useMockData } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisplayNumber } from "@/components/ext/mono";
import { StatusBadge } from "@/components/ext/status-badge";
import { cn } from "@/lib/utils";

// ─── Activity: case-summary ───────────────────────────────────────────────────

interface ActivityCase {
  id: string;
  caseId: string | null;
  shortId: string;
  status: "resolved" | "in-progress" | "review-required" | "failed" | "system";
  statusLabel: string;
  minutesAgo: number;
  exactTime: string;
  href: string;
}

const activityCases: ActivityCase[] = [
  {
    id: "CASE-20260506-7F6A3D24",
    caseId: "CASE-20260506-7F6A3D24",
    shortId: "7F6A3D24",
    status: "resolved",
    statusLabel: "Решено автоматически",
    minutesAgo: 4,
    exactTime: "16:52",
    href: "/cases/CASE-20260506-7F6A3D24",
  },
  {
    id: "CASE-20260506-D88E7899",
    caseId: "CASE-20260506-D88E7899",
    shortId: "D88E7899",
    status: "review-required",
    statusLabel: "Требует ручной проверки",
    minutesAgo: 24,
    exactTime: "16:32",
    href: "/cases/CASE-20260506-D88E7899",
  },
  {
    id: "system:instruction-reload",
    caseId: null,
    shortId: "Система",
    status: "system",
    statusLabel: "Перезагрузка инструкции",
    minutesAgo: 45,
    exactTime: "16:11",
    href: "/ai/compliance-agent",
  },
  {
    id: "CASE-20260506-A1B2C3D4",
    caseId: "CASE-20260506-A1B2C3D4",
    shortId: "A1B2C3D4",
    status: "resolved",
    statusLabel: "Решено автоматически",
    minutesAgo: 62,
    exactTime: "15:54",
    href: "/cases/CASE-20260506-A1B2C3D4",
  },
  {
    id: "CASE-20260505-9F8E7D6C",
    caseId: "CASE-20260505-9F8E7D6C",
    shortId: "9F8E7D6C",
    status: "resolved",
    statusLabel: "Решено автоматически",
    minutesAgo: 60 * 26,
    exactTime: "14:10",
    href: "/cases/CASE-20260505-9F8E7D6C",
  },
];

const STATUS_CONFIG: Record<
  ActivityCase["status"],
  {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    filterLabel: string;
  }
> = {
  resolved: {
    icon: Check,
    iconBg: "bg-primary/15 text-primary",
    filterLabel: "Решённые",
  },
  "in-progress": {
    icon: Loader2,
    iconBg: "bg-risk-low/15 text-risk-low",
    filterLabel: "В работе",
  },
  "review-required": {
    icon: AlertOctagon,
    iconBg: "bg-risk-medium/15 text-risk-medium",
    filterLabel: "Требуют проверки",
  },
  failed: {
    icon: X,
    iconBg: "bg-risk-critical/15 text-risk-critical",
    filterLabel: "Ошибки",
  },
  system: {
    icon: Settings2,
    iconBg: "bg-muted text-muted-foreground",
    filterLabel: "Система",
  },
};

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function formatRelativeTime(minutesAgo: number): string {
  if (minutesAgo < 1) return "сейчас";
  if (minutesAgo < 60) return `${minutesAgo} мин назад`;
  if (minutesAgo < 60 * 24) {
    const h = Math.floor(minutesAgo / 60);
    return `${h} ч назад`;
  }
  const eventDate = new Date(Date.now() - minutesAgo * 60 * 1000);
  const now = new Date();
  const isYesterday = (() => {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return eventDate.toDateString() === yesterday.toDateString();
  })();
  if (isYesterday) {
    return `Вчера ${eventDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (minutesAgo < 60 * 24 * 7) {
    const days = Math.floor(minutesAgo / (60 * 24));
    return `${days} дн назад`;
  }
  return eventDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

interface KpiData {
  label: string;
  value: number;
  delta?: { text: string; up: boolean };
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  highlight?: boolean;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardContent() {
  const data = useMockData();
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | ActivityCase["status"]
  >("all");

  const filteredCases =
    statusFilter === "all"
      ? activityCases
      : activityCases.filter((c) => c.status === statusFilter);

  const filterChips = [
    { id: "all" as const, label: "Все", count: activityCases.length, icon: null },
    ...Object.entries(STATUS_CONFIG)
      .map(([status, cfg]) => ({
        id: status as ActivityCase["status"],
        label: cfg.filterLabel,
        count: activityCases.filter((c) => c.status === status).length,
        icon: cfg.icon,
      }))
      .filter((chip) => chip.count > 0),
  ];

  // ── KPI data ────────────────────────────────────────────────────────────────
  const openAlerts = data.alerts.filter(
    (a) => a.status === "new" || a.status === "in_progress",
  ).length;
  const criticalAlerts = data.alerts.filter((a) => a.severity === "critical").length;
  const activeCases = data.cases.filter(
    (c) => c.status === "open" || c.status === "in_progress" || c.status === "in_review",
  ).length;
  const escalatedCases = data.cases.filter((c) => c.status === "escalated").length;
  const activeRules = data.rules.filter((r) => r.enabled).length;

  const kpis: KpiData[] = [
    {
      label: "Клиенты",
      value: data.clients.length,
      delta: { text: "+3", up: true },
      icon: Users,
      href: "/clients",
    },
    {
      label: "Открытые оповещения",
      value: openAlerts,
      delta: { text: "+12", up: true },
      icon: Bell,
      href: "/alerts",
      highlight: true,
    },
    {
      label: "Активные кейсы",
      value: activeCases,
      delta: { text: "−1", up: false },
      icon: Folder,
      href: "/cases",
    },
    {
      label: "Транзакции",
      value: data.transactions.length,
      delta: { text: "+28", up: true },
      icon: ArrowLeftRight,
      href: "/transactions",
    },
    { label: "Активные правила", value: activeRules, icon: ListChecks, href: "/rules" },
    {
      label: "Критические",
      value: criticalAlerts,
      delta: { text: `+${criticalAlerts}`, up: true },
      icon: AlertOctagon,
      href: "/alerts",
    },
  ];

  const alertsBySeverity = [
    {
      label: "Критический",
      count: data.alerts.filter((a) => a.severity === "critical").length,
      tone: "critical" as const,
    },
    {
      label: "Высокий",
      count: data.alerts.filter((a) => a.severity === "high").length,
      tone: "high" as const,
    },
    {
      label: "Средний",
      count: data.alerts.filter((a) => a.severity === "medium").length,
      tone: "medium" as const,
    },
    {
      label: "Низкий",
      count: data.alerts.filter((a) => a.severity === "low").length,
      tone: "low" as const,
    },
  ];
  const totalAlerts = data.alerts.length;

  const casesByStatus = [
    {
      label: "Открыто",
      count: data.cases.filter((c) => c.status === "open").length,
      tone: "info" as const,
    },
    {
      label: "В работе",
      count: data.cases.filter((c) => c.status === "in_progress").length,
      tone: "warning" as const,
    },
    { label: "Эскалировано", count: escalatedCases, tone: "danger" as const },
    {
      label: "Решено",
      count: data.cases.filter((c) => c.status === "resolved").length,
      tone: "success" as const,
    },
    {
      label: "Закрыто",
      count: data.cases.filter((c) => c.status === "closed").length,
      tone: "muted" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Hero banner */}
      <section>
        <div className="relative overflow-hidden rounded-2xl bg-card">
          <div className="relative flex items-center justify-between gap-8 flex-wrap px-6 py-5">
            <div className="space-y-2.5 min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                <span className="status-dot status-dot-pulse" />
                compliance_agent · active
              </span>
              <p className="text-[15px] leading-[1.5] text-foreground whitespace-nowrap">
                Compliance Officer AI закрыл{" "}
                <strong className="font-semibold">5 кейсов</strong> автоматически и сэкономил{" "}
                <strong className="font-semibold">~2.4 часа</strong> ручной работы.
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <Button size="lg" asChild className="h-10 px-4 text-[13px] font-medium">
                <Link href="/ai/compliance-agent">
                  <Sparkles className="size-3.5" />
                  Compliance Officer AI
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Unified 3-col grid — 2 rows: [KPI×2 | Alerts] [Activity×2 | Cases] */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Row 1 — Left: KPI block (col-span-2) */}
        <div className="lg:col-span-2 rounded-2xl bg-card overflow-hidden">
          <div className="grid grid-cols-3 h-full">
            {kpis.map((k, i) => {
              const isLastCol = i % 3 === 2;
              const isLastRow = Math.floor(i / 3) === Math.floor((kpis.length - 1) / 3);
              return (
                <KpiCell
                  key={k.label}
                  kpi={k}
                  index={i}
                  className={cn(
                    !isLastCol && "border-r border-border dark:border-white/10",
                    !isLastRow && "border-b border-border dark:border-white/10",
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Row 1 — Right: Оповещения */}
        <Card className="overflow-hidden py-0">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center size-7 rounded-md bg-muted text-muted-foreground">
                <Bell className="size-[15px]" />
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                <TrendingUp className="size-3" />
                +8
              </span>
            </div>
            <div className="space-y-1.5">
              <DisplayNumber size="2xl">{totalAlerts}</DisplayNumber>
              <p className="text-[12px] font-medium text-muted-foreground">Оповещения</p>
            </div>
            <div className="-mx-5 px-5 pt-3 border-t border-hairline space-y-0.5">
              {alertsBySeverity.map((row) => {
                const colorClass =
                  row.tone === "critical"
                    ? "bg-risk-critical"
                    : row.tone === "high"
                      ? "bg-risk-high"
                      : row.tone === "medium"
                        ? "bg-risk-medium"
                        : "bg-risk-low";
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-[13px] py-1"
                  >
                    <span className="inline-flex items-center gap-2 text-foreground">
                      <span className={cn("size-1.5 rounded-full", colorClass)} />
                      {row.label}
                    </span>
                    <span className="font-medium tabular-nums text-muted-foreground">
                      {row.count}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:gap-1.5 transition-all"
            >
              Открыть все оповещения
              <ArrowUpRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Row 2 — Left: Activity (col-span-2) */}
        <Card className="lg:col-span-2 overflow-hidden py-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-6 py-5">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="size-4 text-primary shrink-0" />
              <h3 className="font-heading text-[15px] font-semibold tracking-[-0.015em]">
                Активность
              </h3>
              <span className="text-muted-foreground/40 select-none" aria-hidden>·</span>
              <span className="text-[13px] text-muted-foreground truncate">
                {activityCases.length}{" "}
                {pluralize(activityCases.length, "кейс", "кейса", "кейсов")} за последний час
              </span>
            </div>
            <Link
              href="/ai/compliance-agent"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:gap-1.5 transition-all shrink-0"
            >
              Открыть
              <ArrowUpRight className="size-3" />
            </Link>
          </div>

          {/* Filter chips */}
          <div className="px-6 pt-2 pb-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-fit">
              {filterChips.map((chip) => {
                const isActive = statusFilter === chip.id;
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-border-strong",
                    )}
                  >
                    {Icon && <Icon className="size-3" />}
                    <span>{chip.label}</span>
                    <span
                      className={cn(
                        "tabular-nums opacity-70",
                        isActive ? "" : "text-subtle-foreground",
                      )}
                    >
                      {chip.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case list */}
          <CardContent className="p-0">
            {filteredCases.length === 0 ? (
              <div className="px-6 py-12 flex flex-col items-center text-center gap-2">
                <p className="text-[13px] text-muted-foreground">
                  Нет кейсов по выбранному фильтру
                </p>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-[12px] font-medium text-primary hover:underline"
                >
                  Сбросить фильтр
                </button>
              </div>
            ) : (
              filteredCases.map((c, ci) => {
                const cfg = STATUS_CONFIG[c.status];
                const Icon = cfg.icon;
                const isSystem = c.status === "system";
                return (
                  <Link
                    key={c.id}
                    href={c.href}
                    className={cn(
                      "group/case grid grid-cols-[32px_140px_1fr_auto] gap-4 items-center px-6 py-3 hover:bg-surface-tint transition-colors",
                      ci < filteredCases.length - 1 && "border-b border-hairline",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full",
                        cfg.iconBg,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span
                      className={cn(
                        "text-[12px] font-medium truncate",
                        isSystem
                          ? "text-muted-foreground"
                          : "font-mono text-foreground",
                      )}
                    >
                      {isSystem ? c.shortId : `CASE…${c.shortId}`}
                    </span>
                    <span className="text-[14px] font-medium leading-tight truncate">
                      {c.statusLabel}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-[11px] text-muted-foreground tabular-nums"
                        title={c.exactTime}
                      >
                        {formatRelativeTime(c.minutesAgo)}
                      </span>
                      <ArrowUpRight className="size-3 text-subtle-foreground opacity-0 group-hover/case:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Row 2 — Right: Кейсы */}
        <Card className="overflow-hidden py-0">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center size-7 rounded-md bg-muted text-muted-foreground">
                <Folder className="size-[15px]" />
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                <TrendingDown className="size-3" />
                −2
              </span>
            </div>
            <div className="space-y-1.5">
              <DisplayNumber size="2xl">{data.cases.length}</DisplayNumber>
              <p className="text-[12px] font-medium text-muted-foreground">Кейсы</p>
            </div>
            <div className="-mx-5 px-5 pt-3 border-t border-hairline space-y-0.5">
              {casesByStatus.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <StatusBadge tone={row.tone}>{row.label}</StatusBadge>
                  <span className="text-[14px] font-medium tabular-nums">{row.count}</span>
                </div>
              ))}
            </div>
            <Link
              href="/cases"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:gap-1.5 transition-all"
            >
              Открыть все кейсы
              <ArrowUpRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ─── KpiCell ──────────────────────────────────────────────────────────────────

function KpiCell({
  kpi,
  index,
  className,
}: {
  kpi: KpiData;
  index: number;
  className?: string;
}) {
  const Icon = kpi.icon;
  const highlight = kpi.highlight;

  const cell = (
    <div
      className={cn(
        "relative h-full p-5 transition-colors duration-200 group flex flex-col justify-between",
        "hover:bg-surface-tint",
        highlight && "bg-gradient-to-br from-transparent via-transparent to-primary/[0.04]",
        className,
      )}
      style={{ animation: `fade-up 0.5s ease-out ${index * 50}ms backwards` }}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center justify-center size-7 rounded-md",
            highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-[15px]" />
        </span>
        <div className="flex items-center gap-2">
          {highlight ? (
            <span aria-hidden className="status-dot status-dot-pulse text-primary shrink-0" />
          ) : null}
          {kpi.delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md",
                kpi.delta.up ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {kpi.delta.up ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {kpi.delta.text}
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <DisplayNumber size="2xl" tone={highlight ? "primary" : "default"}>
          {formatNumber(kpi.value)}
        </DisplayNumber>
        <p className="text-[12px] font-medium text-muted-foreground">{kpi.label}</p>
      </div>
    </div>
  );

  return kpi.href ? (
    <Link href={kpi.href} className="block">
      {cell}
    </Link>
  ) : (
    cell
  );
}
