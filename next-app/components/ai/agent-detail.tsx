"use client";

import * as React from "react";
import { Bot, Wrench, Play } from "lucide-react";
import { toast } from "sonner";

import { useMockData, type Agent } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
const RUN_TONE = { success: "success", failure: "danger", running: "info" } as const;
const RUN_LABEL = { success: "Успешно", failure: "Ошибка", running: "В процессе" } as const;

export function AgentDetail({ id }: { id: string }) {
  const data = useMockData();
  const agent: Agent | undefined = data.agents.find((a) => a.id === id) ?? data.agents[0];
  const [enabled, setEnabled] = React.useState(agent?.enabled ?? true);
  if (!agent) return null;

  const runs = agent.lastRuns ?? [];
  const ok = runs.filter((r) => r.status === "success").length;

  return (
    <div className="pb-6 pt-5">
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* LEFT — пассапорт */}
        <aside className="self-start lg:sticky lg:top-20">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col items-start gap-2">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm">
                <Bot className="size-5" />
              </div>
              <h1 className="font-heading text-[17px] font-bold leading-tight tracking-[-0.02em]">{agent.name}</h1>
              <StatusBadge tone={enabled ? "success" : "muted"}>{enabled ? "Активен" : "Выключен"}</StatusBadge>
              <span className="font-mono text-xs text-muted-foreground">{agent.id}</span>
            </div>

            <p className="text-xs leading-snug text-muted-foreground">{agent.description}</p>

            <div className="flex flex-col gap-2.5 rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
              <Row label="Модель" value={<span className="font-mono text-xs">{agent.model}</span>} />
              <Row label="Инструментов" value={agent.tools.length} />
              <Row label="Запусков" value={`${ok}/${runs.length} ок`} />
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full justify-center" onClick={() => toast.success("Тестовый запуск агента отправлен")}>
                <Play className="size-4" />
                Тестовый запуск
              </Button>
              <Button
                variant={enabled ? "outline" : "default"}
                className="w-full justify-center"
                onClick={() => setEnabled((v) => !v)}
              >
                {enabled ? "Выключить" : "Включить"}
              </Button>
            </div>
          </div>
        </aside>

        {/* RIGHT — контент */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-heading text-[15px] font-semibold">Инструкция</h3>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-foreground/[0.02] p-4 font-mono text-xs leading-relaxed text-muted-foreground dark:bg-white/[0.03]">
              {agent.instructionsMd}
            </pre>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 inline-flex items-center gap-2 font-heading text-[15px] font-semibold">
              <Wrench className="size-4 text-muted-foreground" />
              Инструменты
              <span className="font-normal text-muted-foreground">{agent.tools.length}</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.tools.map((t) => (
                <span key={t} className="rounded-md bg-foreground/[0.05] px-2 py-1 font-mono text-xs text-foreground dark:bg-white/[0.05]">
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-heading text-[15px] font-semibold">
                История запусков <span className="font-normal text-muted-foreground">{runs.length}</span>
              </h3>
            </div>
            {runs.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Запусков пока нет</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {runs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                      <span className="text-xs text-muted-foreground">{fmtDateTime(r.startedAt)}</span>
                      <span className="text-xs tabular-nums text-muted-foreground/70">{(r.durationMs / 1000).toFixed(1)}с</span>
                      <span className="text-xs tabular-nums text-muted-foreground/70">
                        {r.inputTokens}→{r.outputTokens} ток.
                      </span>
                    </span>
                    <StatusBadge tone={RUN_TONE[r.status]}>{RUN_LABEL[r.status]}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  );
}
