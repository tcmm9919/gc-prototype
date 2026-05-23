"use client";

import { motion } from "framer-motion";
import { AlertOctagon, AlertTriangle, Bell, Inbox } from "lucide-react";

import { useMockData, type AlertSeverity, type AlertStatus } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ext/animated-number";
import { cn } from "@/lib/utils";

const SEVERITY_META: Record<AlertSeverity | "all" | "open", { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  all: { label: "Всего", icon: Bell, tone: "bg-muted text-muted-foreground" },
  open: { label: "В работе", icon: Inbox, tone: "bg-primary/10 text-primary" },
  low: { label: "Низкая", icon: Bell, tone: "bg-risk-low/15 text-risk-low" },
  medium: { label: "Средняя", icon: AlertTriangle, tone: "bg-risk-medium/15 text-risk-medium" },
  high: { label: "Высокая", icon: AlertTriangle, tone: "bg-risk-high/15 text-risk-high" },
  critical: { label: "Критическая", icon: AlertOctagon, tone: "bg-risk-critical/15 text-risk-critical" },
};

export function AlertsSummary() {
  const data = useMockData();
  const total = data.alerts.length;
  const open = data.alerts.filter((a) => a.status !== "closed").length;
  const counts: Record<AlertSeverity, number> = {
    low: data.alerts.filter((a) => a.severity === "low").length,
    medium: data.alerts.filter((a) => a.severity === "medium").length,
    high: data.alerts.filter((a) => a.severity === "high").length,
    critical: data.alerts.filter((a) => a.severity === "critical").length,
  };

  const items: Array<{ key: "all" | "open" | AlertSeverity; value: number }> = [
    { key: "all", value: total },
    { key: "open", value: open },
    { key: "critical", value: counts.critical },
    { key: "high", value: counts.high },
    { key: "medium", value: counts.medium },
    { key: "low", value: counts.low },
  ];

  return (
    <div className="grid gap-2 pb-4 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it, i) => {
        const meta = SEVERITY_META[it.key];
        const Icon = meta.icon;
        return (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.22, ease: "easeOut" }}
          >
            <Card className="transition hover:-translate-y-0.5 hover:shadow-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <div className={cn("size-9 shrink-0 rounded-lg flex items-center justify-center", meta.tone)}>
                  <Icon className="size-4" />
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-xs text-muted-foreground">{meta.label}</span>
                  <span className="font-heading text-xl font-semibold tabular-nums">
                    <AnimatedNumber value={it.value} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// чтобы tree-shaker не выкинул статус-импорт, оставим маркер
export type { AlertStatus };
