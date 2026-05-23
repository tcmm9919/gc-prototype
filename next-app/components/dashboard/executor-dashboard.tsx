"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  AlertOctagon,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useMockData } from "@/lib/mock";
import { useMockStore } from "@/lib/mock/store";
import { currentUser } from "@/lib/mock/seeds";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Alert, Case } from "@/lib/mock/types";

// ═══════════════════════════════════════════════════════════════
// SLA logic
// ═══════════════════════════════════════════════════════════════

type SLAZone = "red" | "amber" | "green";

function getSLAZone(deadlineIso: string | undefined): SLAZone {
  if (!deadlineIso) return "green";
  const remaining = (new Date(deadlineIso).getTime() - Date.now()) / 60000;
  if (remaining < 60) return "red";
  if (remaining < 240) return "amber";
  return "green";
}

function formatRelativeFuture(deadlineIso: string | undefined): string {
  if (!deadlineIso) return "—";
  const remaining = (new Date(deadlineIso).getTime() - Date.now()) / 60000;
  if (remaining < 0) return "просрочено";
  if (remaining < 1) return "меньше мин";
  if (remaining < 60) return `через ${Math.round(remaining)} мин`;
  if (remaining < 24 * 60) {
    const h = Math.floor(remaining / 60);
    const m = Math.round(remaining % 60);
    return m === 0 ? `через ${h} ч` : `через ${h} ч ${m} м`;
  }
  if (remaining < 48 * 60) return "завтра";
  return `через ${Math.floor(remaining / (24 * 60))} дн`;
}

function formatRelativeAgo(isoDate: string): string {
  const ago = (Date.now() - new Date(isoDate).getTime()) / 60000;
  if (ago < 1) return "сейчас";
  if (ago < 60) return `${Math.round(ago)} мин назад`;
  if (ago < 24 * 60) return `${Math.floor(ago / 60)} ч назад`;
  const d = new Date(isoDate);
  return `вчера ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatAmount(amount: number, currency: string): string {
  return `${new Intl.NumberFormat("ru-RU").format(amount)} ${currency}`;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// SLA × risk ranking — lower remaining time + higher severity = higher score
function rankAlert(a: Alert): number {
  const remaining = a.deadline
    ? (new Date(a.deadline).getTime() - Date.now()) / 60000
    : 9999;
  const slaUrgency = Math.max(0, Math.min(1, 1 - remaining / 240));
  const riskScore = {
    critical: 1.0,
    high: 0.75,
    medium: 0.5,
    low: 0.25,
  }[a.severity] || 0.5;
  return slaUrgency * 0.6 + riskScore * 0.4;
}

// ═══════════════════════════════════════════════════════════════
// AIValueCard — вертикальная карточка для правой колонки,
// показывает ценность AI за смену
// ═══════════════════════════════════════════════════════════════

function AIValueCard({ aiCases }: { aiCases: Case[] }) {
  if (aiCases.length === 0) return null;
  // Эвристика: каждый авто-кейс экономит ~30 мин ручной работы
  const minutesSaved = aiCases.length * 30;
  const hoursSaved = (minutesSaved / 60).toFixed(1).replace(".", ",");

  return (
    <Link
      href="/agents/compliance-officer"
      className="group/aicard rounded-2xl bg-white dark:bg-white/[0.04] p-5 flex flex-col gap-4 hover:bg-foreground/[0.02] dark:hover:bg-white/[0.06] transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-primary" />
          </div>
          <h3 className="font-heading text-[20px] font-bold tracking-[-0.02em] truncate">
            Compliance Officer AI
          </h3>
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground group-hover/aicard:text-primary transition-colors shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Закрыто
          </span>
          <div className="font-heading text-[22px] font-semibold tabular-nums leading-none">
            {aiCases.length}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {pluralize(aiCases.length, "кейс", "кейса", "кейсов")} за смену
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Сэкономлено
          </span>
          <div className="font-heading text-[22px] font-semibold tabular-nums leading-none text-primary">
            ~{hoursSaved} ч
          </div>
          <span className="text-[11px] text-muted-foreground">
            ручной работы
          </span>
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// SLABanner — conditional, only if red-zone alerts exist
// ═══════════════════════════════════════════════════════════════

function SLABanner({ alerts }: { alerts: Alert[] }) {
  const redZone = alerts.filter((a) => getSLAZone(a.deadline) === "red");
  if (redZone.length === 0) return null;
  const closest = redZone[0];
  return (
    <div className="rounded-2xl bg-risk-critical/15 border border-risk-critical/30 p-5 flex items-center gap-4">
      <div className="size-12 rounded-xl bg-risk-critical/25 flex items-center justify-center shrink-0">
        <AlertOctagon className="size-6 text-risk-critical" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-[15px] font-semibold text-risk-critical">
          {redZone.length} {redZone.length === 1 ? "заявка" : "заявок"} в красной зоне SLA
        </h3>
        <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
          Ближайший дедлайн {formatRelativeFuture(closest.deadline)} · #{closest.id}
        </p>
      </div>
      <Button asChild className="bg-risk-critical hover:bg-risk-critical/90 text-white shrink-0">
        <Link href="/alerts?filter=red-zone">Открыть сейчас</Link>
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QueueRow — single заявка in queue
// ═══════════════════════════════════════════════════════════════

function QueueRow({ alert }: { alert: Alert }) {
  const zone = getSLAZone(alert.deadline);
  const data = useMockData();
  const router = useRouter();
  const client = data.clients.find((c) => c.id === alert.clientId);
  const transaction = data.transactions.find((t) => t.id === alert.transactionId);
  const scenario = data.scenarios.find((s) => s.id === alert.scenarioId);
  const isInProgress = Boolean(alert.responsibleId);

  const zoneBarColor = {
    red: "bg-risk-critical",
    amber: "bg-risk-medium",
    green: "bg-foreground/[0.10]",
  }[zone];

  const zoneTimeColor = {
    red: "text-risk-critical",
    amber: "text-risk-medium",
    green: "text-muted-foreground",
  }[zone];

  const openAlert = () => router.push(`/alerts/${alert.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openAlert}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openAlert();
        }
      }}
      className="relative grid grid-cols-[4px_1fr_auto] gap-4 p-4 rounded-xl bg-foreground/[0.06] hover:bg-foreground/[0.10] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className={cn("w-1 rounded-full", zoneBarColor)} aria-hidden />
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {alert.channel || "—"}
          </span>
          <span className="font-heading text-[17px] font-semibold">
            {transaction ? formatAmount(transaction.amount, transaction.currency) : "—"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {scenario?.code && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-foreground/[0.10] text-foreground">
              {scenario.code}
            </span>
          )}
          {scenario?.risk_attributes?.[0] && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-foreground/[0.06] text-muted-foreground">
              {scenario.risk_attributes[0]}
            </span>
          )}
          {alert.cash_flag && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-foreground/[0.06] text-muted-foreground">
              наличные
            </span>
          )}
          {alert.geo_route && alert.geo_route[0] !== alert.geo_route[1] && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-foreground/[0.06] text-muted-foreground">
              {alert.geo_route[0]} → {alert.geo_route[1]}
            </span>
          )}
        </div>
        <div className="text-[12px] text-muted-foreground truncate">
          {client?.fullName || "—"} · #{alert.id}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={cn("text-[13px] font-medium tabular-nums", zoneTimeColor)}>
          {formatRelativeFuture(alert.deadline)}
        </span>
        {isInProgress ? (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/alerts/${alert.id}`);
            }}
          >
            Открыть
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const store = useMockStore.getState();
              const oldAlert = store.data.alerts.find((a) => a.id === alert.id);
              if (!oldAlert) return;
              const caseIds = useMockStore.getState().takeAlertsToWork([alert.id]);
              toast.success("Оповещение взято в работу", {
                description: `Создан кейс ${caseIds[0]}`,
                action: {
                  label: "Открыть /cases",
                  onClick: () => router.push("/cases"),
                },
                cancel: {
                  label: "Отменить",
                  onClick: () => {
                    useMockStore.getState().bulkUpsertAlerts([oldAlert]);
                    useMockStore.getState().bulkRemoveCases(caseIds);
                  },
                },
              });
            }}
          >
            Взять в работу
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MyQueue — block with top-5 + footer link
// ═══════════════════════════════════════════════════════════════

function MyQueue({ alerts }: { alerts: Alert[] }) {
  const mine = alerts.filter((a) => a.responsibleId === currentUser.id);
  const available = alerts.filter((a) => !a.responsibleId);

  const mineTop = mine.slice(0, 3);
  const availableTop = available.slice(0, 3);
  const mineMore = Math.max(0, mine.length - mineTop.length);
  const availableMore = Math.max(0, available.length - availableTop.length);

  const isEmpty = mineTop.length === 0 && availableTop.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-foreground/[0.04] p-2 h-full flex flex-col">
        <h2 className="font-heading text-[20px] font-bold tracking-[-0.02em] px-4 pt-3 pb-3">
          Моя очередь
        </h2>
        <div className="rounded-xl bg-foreground/[0.06] p-10 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-[15px] font-medium">Очередь пуста · отличная работа</p>
          <p className="text-[12px] text-muted-foreground mt-1">
            Новые заявки появятся когда сработают сценарии или менеджер передаст вам кейс
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-foreground/[0.04] p-2 h-full flex flex-col w-full">
      <div className="flex items-end justify-between px-4 pt-3 pb-3">
        <div className="space-y-1">
          <h2 className="font-heading text-[20px] font-bold tracking-[-0.02em]">Моя очередь</h2>
          <p className="text-[12px] text-muted-foreground">отсортировано по SLA × риску</p>
        </div>
        <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground/[0.06] hover:bg-foreground/[0.10] text-[12px] text-foreground transition-colors">
          Все типы
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {mineTop.length > 0 && (
          <QueueSection
            label="На мне"
            count={mine.length}
            rows={mineTop}
            moreCount={mineMore}
          />
        )}
        {availableTop.length > 0 && (
          <QueueSection
            label="Доступные"
            count={available.length}
            rows={availableTop}
            moreCount={availableMore}
          />
        )}
      </div>

      <Link
        href="/alerts"
        className="block text-center py-3 px-4 mt-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        Открыть всю очередь →
      </Link>
    </div>
  );
}

function QueueSection({
  label,
  count,
  rows,
  moreCount,
}: {
  label: string;
  count: number;
  rows: Alert[];
  moreCount: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2 px-4">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-[11px] tabular-nums text-muted-foreground/60">·</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((alert) => (
          <QueueRow key={alert.id} alert={alert} />
        ))}
      </div>
      {moreCount > 0 && (
        <Link
          href="/alerts"
          className="block text-center pt-1.5 px-4 text-[12px] text-muted-foreground/80 hover:text-foreground transition-colors"
        >
          + ещё {moreCount} {moreCount === 1 ? "заявка" : "заявок"}
        </Link>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// StatusTabs — объединённый блок "Моё состояние" + "Очередь по риску"
// через табы. Тайтлы табов работают как заголовок блока.
// ═══════════════════════════════════════════════════════════════

function StatusTabs({ cases, alerts }: { cases: Case[]; alerts: Alert[] }) {
  const [tab, setTab] = React.useState<"state" | "shape">("state");

  // ── Моё состояние ──────────────────────────────────────
  const inProgress = cases.filter(
    (c) => c.status === "in_progress" || c.status === "in_review"
  ).length;
  const overdue = cases.filter((c) => {
    if (!c.slaDueAt) return false;
    return (
      new Date(c.slaDueAt).getTime() < Date.now() &&
      c.status !== "closed" &&
      c.status !== "resolved"
    );
  }).length;
  const today = new Date().toDateString();
  const closedToday = cases.filter((c) => {
    if (!c.closed_at) return false;
    return new Date(c.closed_at).toDateString() === today;
  }).length;

  // ── Очередь по риску ───────────────────────────────────
  const shapeRows = [
    {
      label: "Критический",
      count: alerts.filter((a) => a.severity === "critical").length,
      dot: "bg-risk-critical",
    },
    {
      label: "Высокий",
      count: alerts.filter((a) => a.severity === "high").length,
      dot: "bg-risk-high",
    },
    {
      label: "Средний",
      count: alerts.filter((a) => a.severity === "medium").length,
      dot: "bg-risk-medium",
    },
    {
      label: "Низкий",
      count: alerts.filter((a) => a.severity === "low").length,
      dot: "bg-risk-low",
    },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-white/[0.04] p-5">
      {/* Tab headers — работают как заголовок блока */}
      <div className="flex items-baseline gap-4 mb-4 border-b border-border/60 dark:border-foreground/[0.06] -mx-5 px-5">
        <button
          type="button"
          onClick={() => setTab("state")}
          className={cn(
            "relative font-heading text-[17px] font-bold tracking-[-0.02em] pb-3 transition-colors whitespace-nowrap",
            tab === "state"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80",
            "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary after:transition-opacity",
            tab === "state" ? "after:opacity-100" : "after:opacity-0"
          )}
        >
          Моё состояние
        </button>
        <button
          type="button"
          onClick={() => setTab("shape")}
          className={cn(
            "relative font-heading text-[17px] font-bold tracking-[-0.02em] pb-3 transition-colors whitespace-nowrap",
            tab === "shape"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80",
            "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary after:transition-opacity",
            tab === "shape" ? "after:opacity-100" : "after:opacity-0"
          )}
        >
          Очередь по риску
        </button>
      </div>

      {/* Tab content */}
      {tab === "state" ? (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px]">В работе</span>
            <span className="font-heading text-[22px] font-semibold tabular-nums">
              {inProgress}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={cn("text-[13px]", overdue > 0 && "text-risk-critical")}>
              Просрочено
            </span>
            <span
              className={cn(
                "font-heading text-[22px] font-semibold tabular-nums",
                overdue > 0 && "text-risk-critical"
              )}
            >
              {overdue}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px]">Закрыто сегодня</span>
            <span className="font-heading text-[22px] font-semibold tabular-nums text-primary">
              {closedToday}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {shapeRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between text-[13px]"
            >
              <span className="inline-flex items-center gap-2 text-foreground">
                <span className={cn("size-1.5 rounded-full", row.dot)} aria-hidden />
                {row.label}
              </span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  row.count > 0 ? "text-foreground" : "text-muted-foreground/50"
                )}
              >
                {row.count}
              </span>
            </div>
          ))}
          <div className="pt-2 mt-1 border-t border-border/60 dark:border-foreground/[0.06] flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Всего в очереди</span>
            <span className="font-medium tabular-nums">{alerts.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ClientResponded — block (JTBD M4)
// Всегда рендерится с позитивным empty state, чтобы заполнять
// низ правой колонки и не оставлять «висящего» пространства.
// ═══════════════════════════════════════════════════════════════

function ClientResponded({ chatAlerts, className }: { chatAlerts: Alert[]; className?: string }) {
  const hasItems = chatAlerts.length > 0;

  return (
    <div className={cn("rounded-2xl bg-white dark:bg-white/[0.04] p-5 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-[20px] font-bold tracking-[-0.02em]">
          Клиент ответил
        </h3>
        {hasItems && (
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary/20 text-primary text-[12px] font-semibold tabular-nums">
            {chatAlerts.length}
          </span>
        )}
      </div>

      {hasItems ? (
        <>
          <div className="space-y-1 flex-1">
            {chatAlerts.slice(0, 3).map((alert) => (
              <Link
                key={alert.id}
                href={`/alerts/${alert.id}?tab=chat`}
                className="flex items-center justify-between gap-2 py-2 px-3 -mx-3 rounded-lg hover:bg-foreground/[0.04] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[12px] text-foreground">#{alert.id}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {alert.client_chat_last_action}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                  {alert.client_chat_last_action_minutes_ago !== undefined
                    ? `${alert.client_chat_last_action_minutes_ago} мин`
                    : "—"}
                </span>
              </Link>
            ))}
          </div>
          {chatAlerts.length > 3 && (
            <Link href="/chat" className="block text-[12px] text-primary hover:underline">
              Открыть все чаты →
            </Link>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
          <div className="size-9 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
            <MessageCircle className="size-4 text-muted-foreground" />
          </div>
          <p className="text-[12px] text-muted-foreground leading-tight">
            Все клиенты ответили или<br />ожидают вашего сообщения
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIReviewRow + AIReviewBlock (JTBD M3)
// ═══════════════════════════════════════════════════════════════

function AIReviewRow({ kase }: { kase: Case }) {
  const router = useRouter();
  const isEscalated = kase.status === "escalated";
  const confidence = kase.ai_confidence_pct ?? 100;
  const isLowConfidence = confidence < 70;

  const handleConfirm = () => {
    const snapshot = { ...kase };
    if (isEscalated) {
      useMockStore.getState().bulkUpdateCases([kase.id], {
        ai_decision_summary: undefined,
        responsibleId: currentUser.id,
        status: "in_progress",
      });
      toast.success(`Эскалация принята · ${kase.id}`, {
        action: {
          label: "Отменить",
          onClick: () => useMockStore.getState().bulkUpsertCases([snapshot]),
        },
      });
    } else {
      useMockStore.getState().bulkUpdateCases([kase.id], {
        ai_decision_summary: undefined,
      });
      toast.success(`Решение AI подтверждено · ${kase.id}`, {
        action: {
          label: "Отменить",
          onClick: () => useMockStore.getState().bulkUpsertCases([snapshot]),
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-[140px_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl hover:bg-foreground/[0.03] transition-colors">
      <span className="font-mono text-[12px] text-muted-foreground truncate">{kase.id}</span>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[14px] text-foreground font-medium truncate">
          {kase.ai_decision_summary || "—"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          <span className={cn(isLowConfidence && "text-risk-medium")}>
            Уверенность {confidence}%
          </span>
          {isLowConfidence && " · требует внимания"}
          {kase.closed_at && ` · ${formatRelativeAgo(kase.closed_at)}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" className="gap-1.5" onClick={handleConfirm}>
          <Check className="size-3.5" />
          {isEscalated ? "Принять" : "Согласен"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => router.push(`/cases/${kase.id}`)}>
          Открыть
        </Button>
      </div>
    </div>
  );
}

function AIReviewBlock({ cases }: { cases: Case[] }) {
  if (cases.length === 0) return null;
  return (
    <div className="rounded-2xl bg-white dark:bg-white/[0.04] p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <CheckCheck className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-[15px] font-semibold">
              AI обработал {cases.length} {cases.length === 1 ? "кейс" : "кейсов"} автоматически
            </h3>
            <p className="text-[12px] text-muted-foreground">
              Требуется ваше подтверждение · политика 4-eyes
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/cases?filter=ai-pending-review">
            Проверить все
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {cases.slice(0, 4).map((kase) => (
            <motion.div
              key={kase.id}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 16, height: 0, marginTop: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <AIReviewRow kase={kase} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ExecutorDashboard — main composition
// ═══════════════════════════════════════════════════════════════

export function ExecutorDashboard() {
  const data = useMockData();

  const queueAlerts = React.useMemo(() => {
    return data.alerts
      .filter((a) => a.status !== "closed" && a.deadline !== undefined && a.client_chat_status !== "client_responded")
      .sort((a, b) => rankAlert(b) - rankAlert(a));
  }, [data.alerts]);

  const chatAlerts = React.useMemo(() => {
    return data.alerts.filter((a) => a.client_chat_status === "client_responded");
  }, [data.alerts]);

  const aiCases = React.useMemo(() => {
    return data.cases
      .filter((c) => c.autoCase === true && c.ai_decision_summary !== undefined)
      .sort((a, b) => {
        const aTime = a.closed_at ? new Date(a.closed_at).getTime() : 0;
        const bTime = b.closed_at ? new Date(b.closed_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [data.cases]);

  // Empty state — нет ничего
  const isEmpty =
    queueAlerts.length === 0 && chatAlerts.length === 0 && aiCases.length === 0;

  if (isEmpty) {
    const today = new Date().toDateString();
    const closedToday = data.cases.filter(
      (c) => c.closed_at && new Date(c.closed_at).toDateString() === today,
    ).length;
    const aiClosedToday = data.cases.filter(
      (c) =>
        c.autoCase === true &&
        c.closed_at &&
        new Date(c.closed_at).toDateString() === today,
    ).length;
    const hoursSaved = ((aiClosedToday * 30) / 60).toFixed(1).replace(".", ",");
    const myInProgress = data.cases.filter(
      (c) =>
        c.responsibleId === currentUser.id &&
        (c.status === "in_progress" || c.status === "in_review"),
    ).length;

    return (
      <div className="flex flex-col gap-6 pb-12 max-w-2xl mx-auto pt-12 w-full">
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] p-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <Check className="size-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em]">
                Очередь чиста · смена закрыта
              </h2>
              <p className="text-[13px] text-muted-foreground">
                {myInProgress > 0
                  ? `У вас ${myInProgress} ${pluralize(
                      myInProgress,
                      "кейс",
                      "кейса",
                      "кейсов",
                    )} в работе. Новые заявки появятся когда сработают сценарии.`
                  : "Все заявки закрыты. Новые появятся когда сработают сценарии."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-foreground/[0.04] p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Закрыто сегодня
              </span>
              <div className="font-heading text-[26px] font-semibold tabular-nums leading-none">
                {closedToday}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {pluralize(closedToday, "кейс", "кейса", "кейсов")}
              </span>
            </div>
            <div className="rounded-xl bg-foreground/[0.04] p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                Сэкономлено
              </span>
              <div className="font-heading text-[26px] font-semibold tabular-nums leading-none text-primary">
                ~{hoursSaved} ч
              </div>
              <span className="text-[11px] text-muted-foreground">ручной работы</span>
            </div>
            <div className="rounded-xl bg-foreground/[0.04] p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                AI закрыл
              </span>
              <div className="font-heading text-[26px] font-semibold tabular-nums leading-none">
                {aiClosedToday}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {pluralize(aiClosedToday, "кейс", "кейса", "кейсов")} автоматически
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {myInProgress > 0 && (
              <Button asChild>
                <Link href="/cases">
                  К моим кейсам в работе
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/agents/compliance-officer">
                Отчёт ассистента
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SLABanner alerts={queueAlerts} />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <MyQueue alerts={queueAlerts} />
          <AIReviewBlock cases={aiCases} />
        </div>
        <div className="flex flex-col gap-4">
          <AIValueCard aiCases={aiCases} />
          <StatusTabs cases={data.cases} alerts={queueAlerts} />
          <ClientResponded chatAlerts={chatAlerts} />
        </div>
      </div>
    </div>
  );
}
