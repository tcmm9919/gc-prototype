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
import { WorkflowIdentity } from "./workflow-identity";

export function WorkflowDetail({ id }: { id: string }) {
  const data = useMockData();
  const sc = data.scenarios.find((s) => s.id === id) ?? data.scenarios[0];
  const [selectedClient, setSelectedClient] = React.useState<string>("");
  const [historyOpen, setHistoryOpen] = React.useState(false);

  if (!sc) return null;

  const pipeline = sc.pipeline ?? [];
  const sequentialId = sc.id.replace(/^SC-?/, "").replace(/^0+/, "") || sc.id;

  return (
    <div className="pb-6 pt-5">
      <div className="grid items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
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
                  return (
                    <li
                      key={step.id}
                      className="flex items-start gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2.5 dark:bg-white/[0.03]"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{step.name ?? meta?.name ?? step.type}</span>
                          <StatusBadge tone="muted">Шаг {idx + 1}</StatusBadge>
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{meta?.description}</p>
                      </div>
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
                <div className="mt-3 border-t border-foreground/[0.06] pt-3 text-sm text-muted-foreground dark:border-white/[0.06]">
                  {sc.triggerCount === 0 ? "Нет запусков" : "Список запусков (mock-данные)."}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
