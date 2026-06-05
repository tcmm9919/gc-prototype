"use client";

import * as React from "react";
import { Newspaper, ShieldAlert, Activity, FileSearch, RefreshCcw } from "lucide-react";
import type { Client } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Block } from "@/components/ext/block";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { cn } from "@/lib/utils";

interface SubScore {
  key: string;
  agent: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function buildSubscores(client: Client): SubScore[] {
  const anomalyScore = client.riskLevel === "critical" ? 90 : client.riskLevel === "high" ? 65 : client.riskLevel === "medium" ? 35 : 0;
  const internal = client.internalScore;
  const news = client.newsScore ?? (client.pep ? 75 : Math.min(internal + 10, 100));
  const edd = client.eddScore ?? (client.sanctioned ? 90 : Math.min(internal + 15, 100));

  return [
    { key: "anomaly", agent: "Аномальные транзакции", score: anomalyScore, icon: Activity, description: anomalyScore === 0 ? "Нет транзакций с алертами или кейсами" : "Транзакции с высокой ст. отклонения от baseline" },
    { key: "internal", agent: "Внутренний скоринг", score: internal, icon: ShieldAlert, description: internal === 0 ? "Нет записи внутреннего скоринга" : "Скоринг на основе 90-дневной истории, модель CTSM" },
    { key: "news", agent: "Новостной агент", score: news, icon: Newspaper, description: `Новостной агент: последний risk_score = ${news}` },
    { key: "edd", agent: "EDD-агент", score: edd, icon: FileSearch, description: `EDD-агент: последний risk_score = ${edd}` },
  ];
}

function getRiskConfig(score: number) {
  if (score < 25) return { label: "Низкий", barClass: "bg-risk-low", textClass: "text-risk-low" };
  if (score < 50) return { label: "Средний", barClass: "bg-risk-medium", textClass: "text-risk-medium" };
  if (score < 75) return { label: "Высокий", barClass: "bg-risk-high", textClass: "text-risk-high" };
  return { label: "Критический", barClass: "bg-risk-critical", textClass: "text-risk-critical" };
}

export function ClientScoring({ client }: { client: Client }) {
  const subscores = buildSubscores(client);
  const composite = Math.max(...subscores.map((s) => s.score));
  const cfg = getRiskConfig(composite);
  const now = new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      {/* Composite */}
      <Block
        title="Профиль рисков"
        actions={
          <Button variant="outline" size="sm">
            <RefreshCcw className="size-3.5" />
            Обновить
          </Button>
        }
      >
        <p className="text-xs text-muted-foreground -mt-2 mb-4">
          Итоговый балл = max(подскоров). Обновлено {now}
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-heading text-[36px] font-bold tabular-nums leading-none">{composite}</span>
          <span className="text-sm text-muted-foreground">/100</span>
          <span className={cn("text-sm font-semibold ml-2", cfg.textClass)}>{cfg.label} риск</span>
        </div>
        <AnimatedProgress value={composite} className="h-2" />
      </Block>

      {/* Subscores */}
      <div className="grid gap-4 md:grid-cols-2">
        {subscores.map((s) => {
          const cat = getRiskConfig(s.score);
          const Icon = s.icon;
          return (
            <Block key={s.key} dense>
              <div className="flex items-start gap-3 mb-3">
                <div className="size-10 shrink-0 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{s.agent}</span>
                    <span className="font-heading text-[22px] font-bold tabular-nums leading-none">{s.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AnimatedProgress value={s.score} className="h-1.5 flex-1" />
                <span className={cn("text-xs font-semibold shrink-0", cat.textClass)}>{cat.label}</span>
              </div>
            </Block>
          );
        })}
      </div>

      <Block>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">История рисков</h4>
            <p className="text-xs text-muted-foreground">Записей: {subscores.length * 10} · последняя {now}</p>
          </div>
          <Button variant="outline" size="sm">
            Открыть историю
          </Button>
        </div>
      </Block>
    </div>
  );
}
