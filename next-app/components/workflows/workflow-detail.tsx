"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Play, Trash2, ChevronDown } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { ACTIVITY_BY_TYPE, type WorkflowActivityType } from "@/lib/mock/seeds/workflow-activities";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="p-6 space-y-6">
      <Link href="/workflows" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="size-4" />
        Назад к сценариям
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{sc.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Тип: Клиентский | ID: #{sequentialId}
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-base font-semibold">План</h3>
            <ol className="space-y-3">
              {pipeline.map((step, idx) => {
                const meta = ACTIVITY_BY_TYPE[step.type as WorkflowActivityType];
                return (
                  <li key={step.id} className="flex items-start gap-3 rounded-md border border-border/60 px-3 py-2.5">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-sm font-medium">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{step.name ?? meta?.name ?? step.type}</span>
                        <StatusBadge tone="muted">Шаг {idx + 1}</StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{meta?.description}</p>
                    </div>
                  </li>
                );
              })}
              {pipeline.length === 0 ? (
                <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                  Pipeline пуст — нажмите «Редактировать», чтобы добавить шаги.
                </li>
              ) : null}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-base font-semibold">Запуск</h3>
            <div className="space-y-2">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="flex w-full items-center justify-between p-4 text-sm font-semibold hover:bg-muted/30 transition"
        >
          <span className="flex items-center gap-2">
            История запусков
            <span className="text-muted-foreground">{sc.triggerCount}</span>
          </span>
          <ChevronDown className={`size-4 text-muted-foreground transition ${historyOpen ? "rotate-180" : ""}`} />
        </button>
        {historyOpen ? (
          <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
            {sc.triggerCount === 0 ? "Нет запусков" : "Список запусков (mock-данные)."}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
