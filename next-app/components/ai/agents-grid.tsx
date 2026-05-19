"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useMockData } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ext/status-badge";
import { AnimatedProgress } from "@/components/ext/animated-progress";

export function AgentsGrid() {
  const data = useMockData();
  return (
    <div className="grid gap-3 p-6 md:grid-cols-2 lg:grid-cols-3">
      {data.agents.map((a, idx) => {
        const runs = a.lastRuns.length;
        const failures = a.lastRuns.filter((r) => r.status === "failure").length;
        const okRate = runs > 0 ? Math.round(((runs - failures) / runs) * 100) : 100;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.22, ease: "easeOut" }}
          >
            <Link href={`/ai/agents/${a.id}`}>
              <Card className="group h-full transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center transition group-hover:scale-105 group-hover:bg-primary/15">
                      <Bot className="size-5" />
                    </div>
                    <StatusBadge tone={a.enabled ? "success" : "muted"}>{a.enabled ? "Включён" : "Выключен"}</StatusBadge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium leading-snug">{a.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Успех запусков</span>
                      <span className="tabular-nums font-medium">{okRate}%</span>
                    </div>
                    <AnimatedProgress value={okRate} className="h-1" />
                    <p className="text-xs text-muted-foreground pt-1">Модель: {a.model}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
