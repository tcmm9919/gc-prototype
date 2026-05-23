"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Edit, Play, Trash2 } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { ACTIVITY_BY_TYPE, type WorkflowActivityType } from "@/lib/mock/seeds/workflow-activities";
import { Block, DetailHeader } from "@/components/ext/block";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ext/status-badge";

export function WorkflowDetail({ id }: { id: string }) {
  const data = useMockData();
  const sc = data.scenarios.find((s) => s.id === id) ?? data.scenarios[0];
  const [selectedClient, setSelectedClient] = React.useState<string>("");
  const [historyOpen, setHistoryOpen] = React.useState(false);

  if (!sc) return null;

  const pipeline = sc.pipeline ?? [];
  const sequentialId = sc.id.replace(/^SC-?/, "").replace(/^0+/, "") || sc.id;

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      <DetailHeader
        title={sc.name}
        subtitle={`Тип: Клиентский · ID: #${sequentialId}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/workflows/builder?id=${sc.id}`}>
                <Edit className="size-3.5" />
                Редактировать
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="size-3.5" />
              Удалить
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Block title="План" className="lg:col-span-2">
          <ol className="space-y-2">
            {pipeline.map((step, idx) => {
              const meta = ACTIVITY_BY_TYPE[step.type as WorkflowActivityType];
              return (
                <li
                  key={step.id}
                  className="flex items-start gap-3 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-3 py-2.5"
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">
                        {step.name ?? meta?.name ?? step.type}
                      </span>
                      <StatusBadge tone="muted">Шаг {idx + 1}</StatusBadge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {meta?.description}
                    </p>
                  </div>
                </li>
              );
            })}
            {pipeline.length === 0 ? (
              <li className="rounded-xl border border-dashed border-foreground/[0.12] dark:border-white/[0.12] px-4 py-8 text-center text-sm text-muted-foreground">
                Pipeline пуст — нажмите «Редактировать», чтобы добавить шаги.
              </li>
            ) : null}
          </ol>
        </Block>

        <Block title="Запуск">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                user_id
                <StatusBadge tone="muted">СТРОКА</StatusBadge>
              </label>
              <span className="text-xs text-muted-foreground block">ID пользователя</span>
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
        </Block>
      </div>

      <Block>
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-semibold"
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
          <div className="mt-3 border-t border-foreground/[0.06] dark:border-white/[0.06] pt-3 text-sm text-muted-foreground">
            {sc.triggerCount === 0 ? "Нет запусков" : "Список запусков (mock-данные)."}
          </div>
        ) : null}
      </Block>
    </div>
  );
}
