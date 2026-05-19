"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useMockData, type Alert } from "@/lib/mock";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ext/status-badge";
import { EmptyState } from "@/components/ext/empty-state";
import { RelativeTime } from "@/components/ext/relative-time";

const SEVERITY_TONE: Record<Alert["severity"], "info" | "warning" | "danger"> = {
  low: "info",
  medium: "warning",
  high: "warning",
  critical: "danger",
};

const SEVERITY_LABEL: Record<Alert["severity"], string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  critical: "Критическая",
};

const STATUS_LABEL: Record<Alert["status"], string> = {
  new: "Открыто",
  in_progress: "На проверке",
  rejected: "Отклонено",
  escalated: "Эскалировано",
  closed: "Закрыто",
};

export function ClientAlerts({ clientId }: { clientId: string }) {
  const data = useMockData();
  const alerts = data.alerts.filter((a) => a.clientId === clientId);

  if (alerts.length === 0) {
    return <EmptyState icon={<Bell className="size-6" />} title="Оповещений по клиенту нет" description="Срабатывания правил появятся здесь." />;
  }

  return (
    <div className="space-y-2 p-6">
      {alerts.map((a, idx) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03, duration: 0.2, ease: "easeOut" }}
        >
          <Link href={`/alerts/${a.id}`}>
            <Card className="px-4 py-3 transition hover:border-primary/40 hover:bg-muted/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{a.ruleName}</span>
                    <StatusBadge tone={SEVERITY_TONE[a.severity]}>{SEVERITY_LABEL[a.severity]}</StatusBadge>
                    <StatusBadge tone="muted">{STATUS_LABEL[a.status]}</StatusBadge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {a.id} · <RelativeTime iso={a.date} />
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
