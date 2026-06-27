"use client";

import * as React from "react";
import { ChevronDown, Play } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { ACTIVITY_BY_TYPE, type WorkflowActivityType } from "@/lib/mock/seeds/workflow-activities";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ext/status-badge";
import { cn } from "@/lib/utils";
import { WorkflowIdentity } from "./workflow-identity";

// Тег типа входа в блоке «План → Входы» (как на их сайте).
const INPUT_TYPE_TAG: Record<string, string> = { text: "СТРОКА", select: "СПИСОК", boolean: "ДА/НЕТ" };

export function WorkflowDetail({ id }: { id: string }) {
  const data = useMockData();
  const sc = data.scenarios.find((s) => s.id === id) ?? data.scenarios[0];
  const [selectedClient, setSelectedClient] = React.useState<string>("");
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [openSteps, setOpenSteps] = React.useState<ReadonlySet<string>>(new Set());
  const toggleStep = (id: string) =>
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!sc) return null;

  const pipeline = sc.pipeline ?? [];
  const sequentialId = sc.id.replace(/^SC-?/, "").replace(/^0+/, "") || sc.id;

  // Детерминированная mock-история запусков (стабильна для одного сценария).
  const runs = React.useMemo(() => {
    const seed = Array.from(sc.id).reduce((a, c) => a + c.charCodeAt(0), 0);
    const n = Math.min(sc.triggerCount ?? 0, 8);
    const STATUSES = [
      { key: "success", label: "Успешно", tone: "success" as const },
      { key: "success", label: "Успешно", tone: "success" as const },
      { key: "error", label: "Ошибка", tone: "danger" as const },
      { key: "success", label: "Успешно", tone: "success" as const },
      { key: "running", label: "В процессе", tone: "info" as const },
    ];
    const hex = (x: number) => (x * 2654435761 >>> 0).toString(16).padStart(8, "0").slice(0, 10);
    return Array.from({ length: n }, (_, i) => {
      const at = new Date(Date.now() - (i * 41 + 6) * 3_600_000);
      return {
        runId: hex(seed + i * 97),
        at,
        ...STATUSES[(seed + i) % STATUSES.length],
        durationSec: 4 + ((seed + i * 13) % 56),
      };
    });
  }, [sc.id, sc.triggerCount]);

  return (
    <div className="pb-6 pt-5">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <WorkflowIdentity sc={sc} sequentialId={sequentialId} />
        </aside>

        <div className="min-w-0 rounded-2xl border border-transparent dark:border-border bg-card p-4 md:p-5">
          <div className="flex flex-col gap-4">
            {/* План */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h4 className="mb-4 font-heading text-[15px] font-semibold">
                План
                <span className="ml-1 font-normal text-muted-foreground">{pipeline.length}</span>
              </h4>
              <ol className="space-y-2">
                {pipeline.map((step, idx) => {
                  const meta = ACTIVITY_BY_TYPE[step.type as WorkflowActivityType];
                  const fields = meta?.configFields ?? [];
                  const open = openSteps.has(step.id);
                  return (
                    <li
                      key={step.id}
                      className="overflow-hidden rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03]"
                    >
                      <button
                        type="button"
                        onClick={() => fields.length && toggleStep(step.id)}
                        aria-expanded={open}
                        className={cn(
                          "flex w-full items-start gap-3 px-3 py-2.5 text-left",
                          fields.length && "transition-colors hover:bg-foreground/[0.02] dark:hover:bg-white/[0.02]",
                        )}
                      >
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{step.name ?? meta?.name ?? step.type}</span>
                            <span className="flex shrink-0 items-center gap-2">
                              <StatusBadge tone="muted">Шаг {idx + 1}</StatusBadge>
                              {fields.length ? (
                                <ChevronDown
                                  className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
                                />
                              ) : null}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{meta?.description}</p>
                        </div>
                      </button>

                      {open && fields.length ? (
                        <div className="border-t border-foreground/[0.06] px-3 py-3 sm:pl-[52px] dark:border-white/[0.06]">
                          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Входы
                          </p>
                          <div className="flex flex-col gap-2.5">
                            {fields.map((f) => {
                              const raw = step.config?.[f.key];
                              const def = "default" in f ? f.default : undefined;
                              const val =
                                raw !== undefined && raw !== ""
                                  ? String(raw)
                                  : def !== undefined && def !== ""
                                    ? String(def)
                                    : "—";
                              const isRef = /\{\{.*\}\}/.test(val);
                              return (
                                <div
                                  key={f.key}
                                  className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(120px,180px)_1fr]"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs text-foreground">{f.key}</span>
                                    <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                                      {INPUT_TYPE_TAG[f.type]}
                                    </span>
                                  </span>
                                  <div className="min-w-0">
                                    <span
                                      className={cn(
                                        "break-words text-sm",
                                        val === "—"
                                          ? "text-muted-foreground"
                                          : isRef
                                            ? "rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary"
                                            : "text-foreground",
                                      )}
                                    >
                                      {val}
                                    </span>
                                    {f.hint ? (
                                      <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{f.hint}</p>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
                {pipeline.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-foreground/[0.12] px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/[0.12]">
                    Pipeline пуст — нажмите «Редактировать», чтобы добавить шаги.
                  </li>
                ) : null}
              </ol>
            </div>

            {/* Запуск */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h4 className="mb-4 font-heading text-[15px] font-semibold">Запуск</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    user_id
                    <StatusBadge tone="muted">СТРОКА</StatusBadge>
                  </label>
                  <span className="block text-xs text-muted-foreground">ID пользователя</span>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="— выберите клиента —" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.clients.slice(0, 25).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.fullName} {c.iin ? `· ${c.iin}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={!selectedClient}>
                  <Play className="size-4" />
                  Запустить
                </Button>
              </div>
            </div>

            {/* История запусков */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className="flex w-full items-center justify-between font-heading text-[15px] font-semibold"
              >
                <span className="flex items-center gap-2">
                  История запусков
                  <span className="font-normal text-muted-foreground">{sc.triggerCount}</span>
                </span>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform ${historyOpen ? "rotate-180" : ""}`}
                />
              </button>
              {historyOpen ? (
                <div className="mt-3 border-t border-foreground/[0.06] pt-3 dark:border-white/[0.06]">
                  {runs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет запусков</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {runs.map((r) => (
                        <li
                          key={r.runId}
                          className="flex items-center justify-between gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2 dark:bg-white/[0.03]"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="font-mono text-xs text-muted-foreground">{r.runId}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {r.at.toLocaleDateString("ru-RU")} {r.at.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {r.key !== "running" ? (
                              <span className="text-xs text-muted-foreground/70 tabular-nums">{r.durationSec}с</span>
                            ) : null}
                          </span>
                          <StatusBadge tone={r.tone}>{r.label}</StatusBadge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
