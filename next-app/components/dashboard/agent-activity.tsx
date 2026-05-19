"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ext/relative-time";
import { formatNumber } from "@/lib/format";
import { SectionCard } from "./section-card";
import { cn } from "@/lib/utils";

export function AgentActivity() {
  const data = useMockData();

  // Достаём последние запуски всех агентов + 1 «текущий» running для живости.
  const runs = data.agents
    .flatMap((a) => a.lastRuns.map((r) => ({ ...r, agentName: a.name, agentId: a.id })))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 6);

  if (runs.length > 0) {
    runs[0] = { ...runs[0], status: "running" } as typeof runs[0];
  }

  return (
    <SectionCard
      icon={Sparkles}
      iconTone="primary"
      title="AI-агенты — поток"
      subtitle="Последние вызовы compliance-агентов"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/ai/compliance-agent">
            Все
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {runs.map((r, i) => {
        const isRunning = r.status === "running";
        const isFail = r.status === "failure";
        const Icon = isRunning ? Loader2 : isFail ? XCircle : CheckCircle2;
        return (
          <motion.div
            key={r.id + i}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.18, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 transition hover:border-primary/40 hover:bg-muted/40"
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isRunning && "animate-spin text-primary",
                isFail && "text-risk-critical",
                !isRunning && !isFail && "text-risk-low",
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <div className="flex items-center gap-2">
                <Link
                  href={`/ai/agents/${r.agentId}`}
                  className="font-medium truncate hover:underline"
                >
                  {r.agentName}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{r.id}</span>
                <span>·</span>
                <RelativeTime iso={r.startedAt} className="text-xs" />
              </div>
            </div>
            <div className="hidden flex-col items-end gap-0.5 text-right md:flex">
              <span className="text-xs text-muted-foreground tabular-nums">
                ↓{formatNumber(r.inputTokens)} / ↑{formatNumber(r.outputTokens)}
              </span>
              {!isRunning ? (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {(r.durationMs / 1000).toFixed(1)}s
                </span>
              ) : (
                <span className="text-[11px] text-primary">идёт…</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </SectionCard>
  );
}
