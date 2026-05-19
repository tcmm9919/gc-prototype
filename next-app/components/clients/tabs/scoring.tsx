"use client";

import * as React from "react";
import { Newspaper, ShieldAlert, Activity, FileSearch, RefreshCcw } from "lucide-react";
import type { Client } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { RiskBadge } from "@/components/ext/risk-badge";

interface SubScore {
  key: string;
  agent: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  updatedAt?: string;
}

function buildSubscores(client: Client): SubScore[] {
  const anomalyScore = client.riskLevel === "critical" ? 90 : client.riskLevel === "high" ? 65 : client.riskLevel === "medium" ? 35 : 0;
  const internal = client.internalScore;
  const news = client.newsScore ?? (client.pep ? 75 : Math.min(internal + 10, 100));
  const edd = client.eddScore ?? (client.sanctioned ? 90 : Math.min(internal + 15, 100));

  return [
    {
      key: "anomaly",
      agent: "Аномальные транзакции",
      score: anomalyScore,
      icon: Activity,
      description:
        anomalyScore === 0
          ? "Нет транзакций с алертами или кейсами"
          : "Транзакции с высокой ст. отклонения от baseline",
    },
    {
      key: "internal",
      agent: "Внутренний скоринг",
      score: internal,
      icon: ShieldAlert,
      description:
        internal === 0 ? "Нет записи внутреннего скоринга" : "Скоринг на основе 90-дневной истории, модель CTSM",
    },
    {
      key: "news",
      agent: "Новостной агент",
      score: news,
      icon: Newspaper,
      description: `Новостной агент: последний risk_score = ${news}`,
    },
    {
      key: "edd",
      agent: "EDD-агент",
      score: edd,
      icon: FileSearch,
      description: `EDD-агент: последний risk_score = ${edd}`,
    },
  ];
}

function getCategoryLabel(score: number): { label: string; tone: "low" | "medium" | "high" | "critical" } {
  if (score >= 75) return { label: "Критический", tone: "critical" };
  if (score >= 50) return { label: "Высокий", tone: "high" };
  if (score >= 25) return { label: "Средний", tone: "medium" };
  return { label: "Низкий", tone: "low" };
}

export function ClientScoring({ client }: { client: Client }) {
  const subscores = buildSubscores(client);
  // Composite score — max of subscores (worst signal wins, matching boevoy adverse-media logic)
  const composite = Math.max(...subscores.map((s) => s.score));
  const category = getCategoryLabel(composite);
  const now = new Date().toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="p-6 space-y-4">
      {/* Composite */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Профиль рисков</h3>
              <p className="text-xs text-muted-foreground">
                Итоговый балл = max(подскоры). Обновлено {now}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCcw className="size-3.5" />
              Обновить
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-bold tabular-nums">{composite}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <RiskBadge level={category.tone} />
          </div>
          <AnimatedProgress value={composite} className="h-2" />
        </CardContent>
      </Card>

      {/* Subscores grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {subscores.map((s) => {
          const cat = getCategoryLabel(s.score);
          return (
            <Card key={s.key}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <s.icon className="size-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{s.agent}</span>
                      <span className="font-heading text-2xl font-bold tabular-nums">{s.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={cat.tone} />
                  <AnimatedProgress value={s.score} className="h-1.5 flex-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk history note */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">История рисков</h4>
            <p className="text-xs text-muted-foreground">Записей: {subscores.length * 10} · последняя {now}</p>
          </div>
          <Button variant="outline" size="sm">
            Открыть историю
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
