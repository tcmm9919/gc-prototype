"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import { Activity, Bot, FileEdit, LogIn, LogOut, ShieldAlert, UserPen, Workflow } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { Block } from "@/components/ext/block";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACTION_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  login: { label: "Вход в систему", icon: LogIn, tone: "text-primary" },
  logout: { label: "Выход", icon: LogOut, tone: "text-muted-foreground" },
  "client.view": { label: "Просмотр клиента", icon: Activity, tone: "text-muted-foreground" },
  "client.update": { label: "Изменение данных клиента", icon: UserPen, tone: "text-primary" },
  "alert.close": { label: "Закрытие оповещения", icon: ShieldAlert, tone: "text-risk-medium" },
  "case.create": { label: "Создание кейса", icon: FileEdit, tone: "text-risk-high" },
  "scenario.run": { label: "Запуск сценария", icon: Workflow, tone: "text-primary" },
  "agent.invoke": { label: "Вызов AI-агента", icon: Bot, tone: "text-primary" },
  "settings.update": { label: "Изменение настроек", icon: FileEdit, tone: "text-muted-foreground" },
};

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "Сегодня";
  if (isYesterday(d)) return "Вчера";
  return format(d, "d MMMM yyyy", { locale: ru });
}

function timeLabel(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function ClientHistory({ clientId }: { clientId: string }) {
  const data = useMockData();
  const events = data.audit
    .filter((e) => e.entityType === "client" && (e.entityId === clientId || (e.entityId?.endsWith(clientId.slice(-3)) ?? false)))
    .slice(0, 25);
  const list = events.length > 0 ? events : data.audit.slice(0, 20);
  const users = new Map(data.users.map((u) => [u.id, u]));

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof list>();
    for (const e of list) {
      const k = dayLabel(e.timestamp);
      const arr = map.get(k) ?? [];
      arr.push(e);
      map.set(k, arr);
    }
    return Array.from(map.entries());
  }, [list]);

  return (
    <div className="flex flex-col gap-6 pb-6">
      {grouped.map(([day, items], gIdx) => (
        <Block key={day} title={day} className="border border-border">
          <ol className="relative space-y-3 pl-9">
            <div className="pointer-events-none absolute left-2 top-2 bottom-2 w-px bg-foreground/[0.08] dark:bg-white/[0.10]" aria-hidden />
            {items.map((e, idx) => {
              const u = users.get(e.userId);
              const meta = ACTION_META[e.action] ?? { label: e.action, icon: Activity, tone: "text-muted-foreground" };
              const Icon = meta.icon;
              return (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (gIdx * 0.04) + idx * 0.025, duration: 0.2 }}
                  className="relative"
                >
                  <span
                    className={cn(
                      "absolute -left-9 top-1.5 size-5 rounded-full bg-background ring-4 ring-background flex items-center justify-center",
                      meta.tone,
                    )}
                    aria-hidden
                  >
                    <Icon className="size-2.5" />
                  </span>
                  <div className="rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        <span className="font-medium">{u?.fullName ?? e.userId}</span>{" "}
                        <span className="text-muted-foreground">— {meta.label}</span>
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{timeLabel(e.timestamp)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">IP {e.ip}</span>
                      <span>·</span>
                      <span title={formatDateTime(e.timestamp)}>{formatDateTime(e.timestamp)}</span>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </Block>
      ))}
    </div>
  );
}
