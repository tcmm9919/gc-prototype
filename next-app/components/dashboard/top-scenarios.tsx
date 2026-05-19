"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Workflow } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/ext/sparkline";
import { StatusBadge } from "@/components/ext/status-badge";
import { SectionCard } from "./section-card";

function trendFromSeed(seed: string, points = 14): number[] {
  const code = seed.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: points }, (_, i) => {
    const v = Math.sin((code + i) * 0.6) * 5 + Math.cos((code + i) * 0.2) * 3 + 8 + (i % 3);
    return Math.max(0, Math.round(v));
  });
}

export function TopScenarios() {
  const data = useMockData();
  const top = [...data.scenarios]
    .filter((s) => s.status === "active")
    .sort((a, b) => b.triggerCount - a.triggerCount)
    .slice(0, 5);

  const maxTriggers = top[0]?.triggerCount ?? 1;

  return (
    <SectionCard
      icon={Flame}
      iconTone="warning"
      title="Топ сценариев"
      subtitle="По срабатываниям за 14 дней"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/workflows">
            Все
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
      contentClassName="space-y-2"
    >
      {top.map((s, i) => {
        const share = Math.round((s.triggerCount / maxTriggers) * 100);
        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2, ease: "easeOut" }}
          >
            <Link
              href={`/workflows/${s.id}`}
              className="group flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 transition hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Workflow className="size-3.5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{s.name}</span>
                  <StatusBadge tone="muted">{s.type === "client" ? "клиентский" : "групповой"}</StatusBadge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="tabular-nums">{s.triggerCount} сработок</span>
                  <span>·</span>
                  <span>{Math.round((s.precision ?? 0) * 100)}% precision</span>
                </div>
                <div className="mt-1 h-1 w-full max-w-[14rem] overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-risk-medium"
                    initial={{ width: 0 }}
                    animate={{ width: `${share}%` }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <Sparkline data={trendFromSeed(s.id)} variant="line" tone="warning" width={70} height={26} className="hidden sm:block" />
            </Link>
          </motion.div>
        );
      })}
    </SectionCard>
  );
}
