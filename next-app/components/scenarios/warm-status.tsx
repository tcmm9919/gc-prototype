"use client";

import { Check, Clock, FlameKindling, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { useMockData } from "@/lib/mock";
import { PageHeader } from "@/components/ext/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { Button } from "@/components/ui/button";

type StepState = "done" | "running" | "pending" | "failed";

interface WarmStep {
  id: string;
  title: string;
  description: string;
  state: StepState;
  durationLabel?: string;
}

const STEPS: WarmStep[] = [
  { id: "1", title: "Загрузка истории клиента", description: "300 транзакций за 24 месяца", state: "done", durationLabel: "3 сек" },
  { id: "2", title: "Извлечение фичей", description: "Bank Offline Feature Store — 142 фичи", state: "done", durationLabel: "12 сек" },
  { id: "3", title: "Запуск TSAD", description: "Детекция аномалий во временных рядах", state: "done", durationLabel: "8 сек" },
  { id: "4", title: "Запуск CTSM", description: "Скоринг на CatBoost", state: "running", durationLabel: "идёт..." },
  { id: "5", title: "Анализ группы связанных клиентов", description: "Поиск общего бенефициара", state: "pending" },
  { id: "6", title: "Проверка контрагентов", description: "Санкции, OFAC, PEP", state: "pending" },
  { id: "7", title: "Compliance-агент: финальное заключение", description: "Агрегация выводов суб-агентов", state: "pending" },
];

const STATE_META: Record<StepState, { icon: React.ComponentType<{ className?: string }>; tone: string; label: string }> = {
  done: { icon: Check, tone: "text-risk-low", label: "Готово" },
  running: { icon: Loader2, tone: "text-primary animate-spin", label: "Выполняется" },
  pending: { icon: Clock, tone: "text-muted-foreground", label: "В очереди" },
  failed: { icon: X, tone: "text-risk-critical", label: "Ошибка" },
};

export function WarmStatus({ scenarioId }: { scenarioId: string }) {
  const data = useMockData();
  const sc = data.scenarios.find((s) => s.id === scenarioId) ?? data.scenarios[0];

  const done = STEPS.filter((s) => s.state === "done").length;
  const progress = (done / STEPS.length) * 100;

  return (
    <>
      <PageHeader
        title="WARM — запуск"
        description={`Сценарий: ${sc?.name ?? scenarioId}. Длительная комплексная проверка клиента (стикер 2)`}
        actions={
          <>
            <Button variant="outline" size="sm">Остановить</Button>
            <Button size="sm">Открыть в новом окне</Button>
          </>
        }
      />

      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FlameKindling className="size-6" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Шагов выполнено: {done} из {STEPS.length}</span>
                  <span className="tabular-nums text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                </div>
                <AnimatedProgress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Старт: 18:32 · ожидаемое завершение: 18:54 · процесс может занять до 30 минут.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Шаги пайплайна</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STEPS.map((s) => {
              const meta = STATE_META[s.state];
              const Icon = meta.icon;
              return (
                <div key={s.id} className="flex items-start gap-3 rounded-md border border-border/60 p-3">
                  <div className={cn("mt-0.5 size-9 shrink-0 rounded-full bg-muted flex items-center justify-center", meta.tone)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{s.title}</span>
                      <span className={cn("text-xs", meta.tone)}>{meta.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  {s.durationLabel ? <span className="text-xs text-muted-foreground shrink-0">{s.durationLabel}</span> : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
