"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertOctagon, ArrowRight, Folder, Timer } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { SectionCard } from "./section-card";
import { cn } from "@/lib/utils";

type Item =
  | {
      kind: "alert";
      id: string;
      title: string;
      href: string;
      clientName?: string;
      urgencyScore: number;
      urgencyLabel: string;
      severity: "low" | "medium" | "high" | "critical";
      iso: string;
    }
  | {
      kind: "case";
      id: string;
      title: string;
      href: string;
      clientName?: string;
      urgencyScore: number;
      urgencyLabel: string;
      priority: "low" | "medium" | "high" | "critical";
      slaIso: string;
    };

const SEVERITY_SCORE = { low: 1, medium: 2, high: 3, critical: 4 } as const;

export function UrgentQueue() {
  const data = useMockData();
  const clients = new Map(data.clients.map((c) => [c.id, c]));

  const alertItems: Item[] = data.alerts
    .filter((a) => a.severity === "critical" || a.severity === "high")
    .filter((a) => a.status !== "closed")
    .map((a) => ({
      kind: "alert",
      id: a.id,
      title: a.ruleName,
      href: `/alerts/${a.id}`,
      clientName: clients.get(a.clientId)?.fullName,
      urgencyScore: SEVERITY_SCORE[a.severity] * 100 - hoursSince(a.date),
      urgencyLabel: `сработало ${relativeShort(a.date)}`,
      severity: a.severity,
      iso: a.date,
    }));

  const caseItems: Item[] = data.cases
    .filter((c) => c.status !== "closed")
    .map((c) => {
      const dueIn = new Date(c.slaDueAt).getTime() - Date.now();
      const hoursToSla = dueIn / 3600_000;
      return {
        kind: "case" as const,
        id: c.id,
        title: c.type,
        href: `/cases/${c.id}`,
        clientName: clients.get(c.clientId)?.fullName,
        urgencyScore: SEVERITY_SCORE[c.priority] * 100 + (hoursToSla < 0 ? 400 : Math.max(0, 200 - hoursToSla)),
        urgencyLabel:
          hoursToSla < 0
            ? `SLA просрочен на ${Math.abs(Math.round(hoursToSla))} ч`
            : hoursToSla < 24
              ? `SLA через ${Math.round(hoursToSla)} ч`
              : `SLA через ${Math.round(hoursToSla / 24)} дн.`,
        priority: c.priority,
        slaIso: c.slaDueAt,
      };
    })
    .filter((c) => {
      const dueIn = new Date(c.slaIso).getTime() - Date.now();
      return c.priority === "critical" || c.priority === "high" || dueIn < 24 * 3600_000;
    });

  const merged = [...alertItems, ...caseItems]
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 8);

  return (
    <SectionCard
      icon={AlertOctagon}
      iconTone="danger"
      accentBorder="danger"
      title="Требует внимания"
      subtitle={
        merged.length > 0
          ? `${merged.length} событий по убыванию срочности`
          : "Очередь пуста — все элементы под контролем"
      }
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/alerts">
            Все
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {merged.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
          <span>Очередь пуста.</span>
        </div>
      ) : (
        merged.map((it, i) => (
            <motion.div
              key={`${it.kind}-${it.id}`}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.18, ease: "easeOut" }}
            >
              <Link
                href={it.href}
                className="group flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 transition hover:border-primary/40 hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    it.kind === "alert"
                      ? it.severity === "critical"
                        ? "bg-risk-critical/15 text-risk-critical"
                        : "bg-risk-high/15 text-risk-high"
                      : it.priority === "critical"
                        ? "bg-risk-critical/15 text-risk-critical"
                        : "bg-risk-medium/15 text-risk-medium",
                  )}
                >
                  {it.kind === "alert" ? <AlertOctagon className="size-4" /> : <Folder className="size-4" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{it.title}</span>
                    {it.kind === "alert" ? (
                      <StatusBadge tone={it.severity === "critical" ? "danger" : "warning"}>
                        {it.severity === "critical" ? "Critical" : "High"}
                      </StatusBadge>
                    ) : (
                      <RiskBadge level={it.priority} />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {it.id} · {it.clientName ?? "—"}
                  </span>
                </div>
                <div className="hidden flex-col items-end gap-0.5 text-right md:flex">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs",
                      it.kind === "case" && it.urgencyLabel.startsWith("SLA просрочен")
                        ? "text-risk-critical"
                        : it.kind === "case"
                          ? "text-risk-high"
                          : "text-muted-foreground",
                    )}
                  >
                    <Timer className="size-3" />
                    {it.urgencyLabel}
                  </span>
                  {it.kind === "alert" ? (
                    <RelativeTime iso={it.iso} className="text-[11px]" />
                  ) : (
                    <RelativeTime iso={it.slaIso} className="text-[11px]" />
                  )}
                </div>
                <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
            </Link>
          </motion.div>
        ))
      )}
    </SectionCard>
  );
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600_000;
}

function relativeShort(iso: string): string {
  const h = hoursSince(iso);
  if (h < 1) return "только что";
  if (h < 24) return `${Math.round(h)} ч назад`;
  return `${Math.round(h / 24)} дн. назад`;
}
