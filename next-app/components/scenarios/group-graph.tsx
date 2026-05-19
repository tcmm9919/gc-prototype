"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserCog } from "lucide-react";

import { useMockData, type Client } from "@/lib/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarCircle } from "@/components/ext/entity-header";
import { RiskBadge } from "@/components/ext/risk-badge";
import { initialsFromName } from "@/lib/format";

interface GroupGraphProps {
  /** Сценарий-сидер; используется как seed для выбора группы и имени бенефициара. */
  scenarioId?: string;
}

/**
 * Радиальная диаграмма связей: центральный бенефициар → 5 связанных клиентов.
 * Координаты считаются в viewBox 600×360; HTML-ноды позиционируются по тем же
 * относительным координатам через left/top в процентах.
 */
export function GroupGraph({ scenarioId }: GroupGraphProps) {
  const data = useMockData();

  // Стабильный набор клиентов на основе scenarioId — чтобы при перерисовке
  // не прыгал и был немного похож на «реальную» группу.
  const group = React.useMemo<Client[]>(() => {
    const seed = scenarioId ? scenarioId.charCodeAt(scenarioId.length - 1) : 3;
    const candidates = data.clients.filter((c) => c.riskLevel !== "low");
    const picked: Client[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = (seed + i * 7) % candidates.length;
      const c = candidates[idx];
      if (c && !picked.find((x) => x.id === c.id)) picked.push(c);
    }
    while (picked.length < 5 && data.clients.length > picked.length) {
      const next = data.clients.find((c) => !picked.find((x) => x.id === c.id));
      if (next) picked.push(next);
      else break;
    }
    return picked.slice(0, 5);
  }, [data.clients, scenarioId]);

  // Координаты в виртуальной системе 600×360.
  const VB_W = 600;
  const VB_H = 360;
  const cx = VB_W / 2;
  const cy = VB_H / 2;
  const radius = 145;

  const positions = group.map((_, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / group.length;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const beneficiary = {
    name: "Бенефициар И.И. Иванов",
    role: "Общий УПД",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Группа связанных клиентов</CardTitle>
            <p className="text-sm text-muted-foreground">
              {group.length} клиентов с общим бенефициаром · {beneficiary.role}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Развернуть связи
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative w-full overflow-hidden rounded-md border border-border/60 bg-muted/30"
          style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
        >
          {/* SVG-слой со связями */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden
          >
            <defs>
              <radialGradient id="grad-center" cx="50%" cy="50%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={radius + 30} fill="url(#grad-center)" />
            {positions.map((p, i) => {
              const c = group[i];
              const stroke = c.riskLevel === "critical" ? "var(--risk-critical)"
                : c.riskLevel === "high" ? "var(--risk-high)"
                : c.riskLevel === "medium" ? "var(--risk-medium)"
                : "var(--border)";
              return (
                <motion.line
                  key={c.id}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke={stroke}
                  strokeWidth={1.2}
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.65 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.45, ease: "easeOut" }}
                />
              );
            })}
          </svg>

          {/* Центральная нода (бенефициар) */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-background px-3 py-2 shadow-md">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                <UserCog className="size-4" />
              </div>
              <div className="flex flex-col leading-tight pr-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{beneficiary.role}</span>
                <span className="text-sm font-medium">{beneficiary.name}</span>
              </div>
            </div>
          </motion.div>

          {/* Внешние ноды (клиенты) */}
          {positions.map((p, i) => {
            const c = group[i];
            const leftPct = (p.x / VB_W) * 100;
            const topPct = (p.y / VB_H) * 100;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.07, duration: 0.25, ease: "easeOut" }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <Link
                  href={`/clients/${c.id}`}
                  className="group flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
                >
                  <AvatarCircle
                    initials={initialsFromName(c.fullName)}
                    size="sm"
                    hue={(c.id.charCodeAt(3) * 47) % 360}
                  />
                  <div className="flex flex-col leading-tight pr-1 max-w-[10rem]">
                    <span className="truncate text-xs font-medium group-hover:underline">{c.fullName}</span>
                    <div className="flex items-center gap-1">
                      <RiskBadge level={c.riskLevel} className="!px-1 !py-0 text-[10px]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Граф собран по совпадениям УПД, телефонов и адресов между клиентами. Полная цепочка связей — на отдельной странице (доступна по кнопке выше).
        </p>
      </CardContent>
    </Card>
  );
}
