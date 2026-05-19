"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowRight, Folder, Timer, UserCheck } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { currentUser } from "@/lib/mock/seeds";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { SectionCard } from "./section-card";
import { cn } from "@/lib/utils";

type Row =
  | {
      kind: "alert";
      id: string;
      title: string;
      href: string;
      clientName?: string;
      severity: "low" | "medium" | "high" | "critical";
      score: number;
      iso: string;
    }
  | {
      kind: "case";
      id: string;
      title: string;
      href: string;
      clientName?: string;
      priority: "low" | "medium" | "high" | "critical";
      score: number;
      slaLabel: string;
      slaOverdue: boolean;
      slaIso: string;
    };

const RANK = { low: 1, medium: 2, high: 3, critical: 4 } as const;

export function AssignedToYou() {
  const data = useMockData();
  const clients = new Map(data.clients.map((c) => [c.id, c]));

  const alertRows: Row[] = data.alerts
    .filter((a) => a.responsibleId === currentUser.id && a.status !== "closed")
    .map((a) => ({
      kind: "alert" as const,
      id: a.id,
      title: a.ruleName,
      href: `/alerts/${a.id}`,
      clientName: clients.get(a.clientId)?.fullName,
      severity: a.severity,
      score: RANK[a.severity] * 10 - hoursSince(a.date) / 12,
      iso: a.date,
    }));

  const caseRows: Row[] = data.cases
    .filter((c) => c.responsibleId === currentUser.id && c.status !== "closed")
    .map((c) => {
      const dueIn = new Date(c.slaDueAt).getTime() - Date.now();
      const hoursToSla = dueIn / 3600_000;
      return {
        kind: "case" as const,
        id: c.id,
        title: c.type,
        href: `/cases/${c.id}`,
        clientName: clients.get(c.clientId)?.fullName,
        priority: c.priority,
        score:
          RANK[c.priority] * 10 + (hoursToSla < 0 ? 60 : Math.max(0, 36 - hoursToSla / 2)),
        slaOverdue: hoursToSla < 0,
        slaLabel:
          hoursToSla < 0
            ? `просрочен на ${Math.abs(Math.round(hoursToSla))} ч`
            : hoursToSla < 24
              ? `через ${Math.round(hoursToSla)} ч`
              : `через ${Math.round(hoursToSla / 24)} дн.`,
        slaIso: c.slaDueAt,
      };
    });

  const all = [...alertRows, ...caseRows].sort((a, b) => b.score - a.score);
  const visible = all.slice(0, 8);

  const counters = {
    alerts: alertRows.length,
    cases: caseRows.length,
  };

  return (
    <SectionCard
      icon={UserCheck}
      iconTone="primary"
      title="Назначено на вас"
      subtitle={`${counters.alerts} ${pluralize(counters.alerts, ["оповещение", "оповещения", "оповещений"])} · ${counters.cases} ${pluralize(counters.cases, ["кейс", "кейса", "кейсов"])} — отсортированы по серьёзности и SLA`}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href={`/alerts?responsible=${currentUser.id}`}>
            Все
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
          <span>Нет назначенных открытых элементов.</span>
        </div>
      ) : (
        visible.map((row, i) => (
            <motion.div
              key={`${row.kind}-${row.id}`}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.18, ease: "easeOut" }}
            >
              <Link
                href={row.href}
                className="group flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 transition hover:border-primary/40 hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    row.kind === "alert"
                      ? row.severity === "critical"
                        ? "bg-risk-critical/15 text-risk-critical"
                        : row.severity === "high"
                          ? "bg-risk-high/15 text-risk-high"
                          : "bg-muted text-muted-foreground"
                      : row.priority === "critical"
                        ? "bg-risk-critical/15 text-risk-critical"
                        : row.priority === "high"
                          ? "bg-risk-high/15 text-risk-high"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {row.kind === "alert" ? <AlertOctagon className="size-4" /> : <Folder className="size-4" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{row.title}</span>
                    {row.kind === "alert" ? (
                      <StatusBadge tone={severityTone(row.severity)}>
                        {severityLabel(row.severity)}
                      </StatusBadge>
                    ) : (
                      <RiskBadge level={row.priority} />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {row.id} · {row.clientName ?? "—"}
                  </span>
                </div>
                <div className="hidden flex-col items-end gap-0.5 text-right md:flex">
                  {row.kind === "case" ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs",
                        row.slaOverdue ? "text-risk-critical" : "text-risk-high",
                      )}
                    >
                      <Timer className="size-3" />
                      SLA {row.slaLabel}
                    </span>
                  ) : (
                    <RelativeTime iso={row.iso} className="text-xs" />
                  )}
                  {row.kind === "case" ? (
                    <RelativeTime iso={row.slaIso} className="text-[11px]" />
                  ) : null}
                </div>
                <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
              </Link>
            </motion.div>
          ))
      )}
    </SectionCard>
  );
}

function severityTone(s: "low" | "medium" | "high" | "critical"): "info" | "warning" | "danger" {
  if (s === "critical") return "danger";
  if (s === "high" || s === "medium") return "warning";
  return "info";
}

function severityLabel(s: "low" | "medium" | "high" | "critical"): string {
  return { low: "Низкая", medium: "Средняя", high: "Высокая", critical: "Критическая" }[s];
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600_000;
}

function pluralize(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}
