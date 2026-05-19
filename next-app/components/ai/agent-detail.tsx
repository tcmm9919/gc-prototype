"use client";

import { Bot, Wrench } from "lucide-react";
import { useMockData } from "@/lib/mock";
import { EntityHeader } from "@/components/ext/entity-header";
import { StatusBadge } from "@/components/ext/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RelativeTime } from "@/components/ext/relative-time";
import { formatNumber } from "@/lib/format";

export function AgentDetail({ id }: { id: string }) {
  const data = useMockData();
  const agent = data.agents.find((a) => a.id === id) ?? data.agents[0];
  if (!agent) return null;

  return (
    <>
      <EntityHeader
        avatar={
          <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="size-6" />
          </div>
        }
        title={agent.name}
        subtitle={`${agent.id} · модель: ${agent.model}`}
        badges={
          <StatusBadge tone={agent.enabled ? "success" : "muted"}>{agent.enabled ? "Включён" : "Выключен"}</StatusBadge>
        }
        actions={
          <>
            <Button variant="outline" size="sm">Тест-запуск</Button>
            <Button size="sm">Сохранить</Button>
          </>
        }
      />

      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Инструкции (Markdown)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={14} defaultValue={agent.instructionsMd} className="font-mono text-xs leading-relaxed" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Модель" value={agent.model} />
            <Field label="Температура" value="0.3" />
            <Field label="Max tokens" value="2 000" />
            <Field label="Описание">
              <span className="text-foreground">{agent.description}</span>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Инструменты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {agent.tools.map((t) => (
              <div key={t} className="flex items-center gap-2 rounded-md border border-border/60 px-2.5 py-1.5 text-sm font-mono">
                <Wrench className="size-3.5 text-muted-foreground" />
                {t}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Последние запуски</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agent.lastRuns.map((r) => (
              <div key={r.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-sm">
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-mono text-xs">{r.id}</span>
                  <RelativeTime iso={r.startedAt} className="text-xs" />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{(r.durationMs / 1000).toFixed(1)}s</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  ↓{formatNumber(r.inputTokens)} / ↑{formatNumber(r.outputTokens)}
                </span>
                <StatusBadge tone={r.status === "success" ? "success" : r.status === "running" ? "info" : "danger"}>
                  {r.status === "success" ? "Успех" : r.status === "running" ? "Идёт" : "Ошибка"}
                </StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {value !== undefined ? <span className="font-medium">{value}</span> : children}
    </div>
  );
}
