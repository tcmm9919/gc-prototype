"use client";

import Link from "next/link";
import { Play, Pause, Copy, Download, FlameKindling, Workflow } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { EntityHeader } from "@/components/ext/entity-header";
import { StatusBadge } from "@/components/ext/status-badge";
import { RelativeTime } from "@/components/ext/relative-time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { GroupGraph } from "./group-graph";

const STATUS_LABEL = {
  active: "Активен",
  paused: "Приостановлен",
  draft: "Черновик",
} as const;

const STATUS_TONE = {
  active: "success",
  paused: "warning",
  draft: "muted",
} as const;

export function ScenarioDetail({ id }: { id: string }) {
  const data = useMockData();
  const sc = data.scenarios.find((s) => s.id === id) ?? data.scenarios[0];
  if (!sc) return null;

  const rules = data.rules.filter((r) => sc.ruleIds.includes(r.id));

  return (
    <>
      <EntityHeader
        avatar={
          <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Workflow className="size-6" />
          </div>
        }
        title={sc.name}
        subtitle={`${sc.id} · ${sc.description}`}
        badges={
          <>
            <StatusBadge tone={STATUS_TONE[sc.status]}>{STATUS_LABEL[sc.status]}</StatusBadge>
            <StatusBadge tone="muted">{sc.type === "client" ? "Клиентский" : "Групповой"}</StatusBadge>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workflows/${sc.id}/warm`}>
                <FlameKindling className="size-4" />
                Запустить WARM
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="size-4" />
              Клонировать
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4" />
              JSON
            </Button>
            <Button size="sm">
              {sc.status === "active" ? (
                <>
                  <Pause className="size-4" />
                  Остановить
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Запустить
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Метрики качества</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Metric label="Сработок всего" value={sc.triggerCount.toString()} />
            <Metric label="Precision" value={`${((sc.precision ?? 0) * 100).toFixed(0)}%`} progress={(sc.precision ?? 0) * 100} />
            <Metric label="Recall" value={`${((sc.recall ?? 0) * 100).toFixed(0)}%`} progress={(sc.recall ?? 0) * 100} />
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Последний запуск: <RelativeTime iso={sc.lastRunAt ?? new Date().toISOString()} />
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Используемые правила ({rules.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rules.map((r) => (
              <Link key={r.id} href={`/rules/${r.id}`} className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2 transition hover:bg-muted/50">
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{r.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{r.description}</span>
                </div>
                <StatusBadge tone={r.enabled ? "success" : "muted"}>{r.enabled ? "Вкл" : "Выкл"}</StatusBadge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Параметры запуска</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
            <Field label="Расписание">Каждый час, по будням</Field>
            <Field label="On-demand">Через UI и API</Field>
            <Field label="Триггер по событию">Новая транзакция клиента из watchlist</Field>
            <Field label="Действия">Создание оповещения, повышение риска</Field>
            <Field label="ML-модели">CTSM, TSAD</Field>
            <Field label="Версия">v3 · обновлена 2 дня назад</Field>
          </CardContent>
        </Card>

        {sc.type === "group" ? (
          <div className="lg:col-span-3">
            <GroupGraph scenarioId={sc.id} />
          </div>
        ) : null}
      </div>
    </>
  );
}

function Metric({ label, value, progress }: { label: string; value: string; progress?: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      {progress !== undefined ? <AnimatedProgress value={progress} className="h-1.5" /> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
