"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { useMockData, type LLMAgentName, type LLMModelName, type LLMUsageRequest } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MODELS: ReadonlyArray<LLMModelName> = [
  "deepseek-v32/latest",
  "gpt-oss-120b/latest",
  "qwen3-235b-a22b-fp8/latest",
  "yandexgpt-5.1/latest",
  "gemma-3-27b-it/latest",
];

const AGENTS: ReadonlyArray<LLMAgentName> = [
  "agent",
  "chat_agent",
  "compliance_agent",
  "converter",
  "edd_full",
  "edd_short",
  "monitoring_agent",
  "search_agent",
];

function formatNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

// Стоимость моделей биллится в USD, но интерфейс банка ведётся в KZT
// (default_currency = KZT) — приводим к тенге по демо-курсу.
const KZT_PER_USD = 470;
function formatKzt(usd: number, fractionDigits = 0): string {
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(usd * KZT_PER_USD) + " ₸"
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function KpiCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <Card className="border-border py-0">
      <CardContent className="space-y-1 px-4 py-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`text-xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function formatCostUsd(usd: number): string {
  return "$" + usd.toFixed(usd < 0.01 ? 4 : 2);
}

function ExpandedRow({ req }: { req: LLMUsageRequest }) {
  const inputCost = req.costUSD * (req.inputTokens / Math.max(1, req.inputTokens + req.outputTokens));
  const outputCost = req.costUSD - inputCost;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Вход ({formatNumber(req.inputTokens)} симв.)</p>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs leading-relaxed">
          {req.promptPreview}
        </pre>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Выход ({formatNumber(req.outputTokens)} симв.)</p>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs leading-relaxed">
          {req.responsePreview}
        </pre>
      </div>
      <div className="lg:col-span-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>Prompt ID: <span className="font-mono">{req.id.slice(0, 16)}</span></span>
          <span>Response ID: <span className="font-mono">{req.id}</span></span>
          <span>Полная модель: <span className="font-mono">{req.model}</span></span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Стоимость входа</p>
            <p className="font-medium tabular-nums">{formatCostUsd(inputCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Стоимость выхода</p>
            <p className="font-medium tabular-nums">{formatCostUsd(outputCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Стоимость инструментов</p>
            <p className="font-medium tabular-nums">$0</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Стоимость кэша</p>
            <p className="font-medium tabular-nums">$0</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Всего</p>
            <p className="font-medium tabular-nums text-primary">{formatCostUsd(req.costUSD)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LLMUsageContent() {
  const data = useMockData();
  const [modelFilter, setModelFilter] = React.useState<Set<LLMModelName>>(new Set());
  const [agentFilter, setAgentFilter] = React.useState<Set<LLMAgentName>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<Set<"Успешно" | "Ошибка">>(new Set());

  const filtered = React.useMemo(
    () =>
      data.llmUsage.filter((r) => {
        if (modelFilter.size && !modelFilter.has(r.model)) return false;
        if (agentFilter.size && !agentFilter.has(r.agentName)) return false;
        if (statusFilter.size && !statusFilter.has(r.status)) return false;
        return true;
      }),
    [data.llmUsage, modelFilter, agentFilter, statusFilter],
  );

  const summary = React.useMemo(() => {
    let calls = 0;
    let input = 0;
    let output = 0;
    let tools = 0;
    let cost = 0;
    for (const r of data.llmUsage) {
      calls++;
      input += r.inputTokens;
      output += r.outputTokens;
      tools += r.toolTokens;
      cost += r.costUSD;
    }
    return {
      calls,
      input,
      output,
      tools,
      total: input + output + tools,
      cost,
    };
  }, [data.llmUsage]);

  const toggle = <T,>(s: Set<T>, v: T): Set<T> => {
    const next = new Set(s);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  const columns: ColumnDef<LLMUsageRequest>[] = [
    {
      accessorKey: "timestamp",
      header: "Время",
      meta: { width: "minmax(0, 1.1fr)" },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm whitespace-nowrap">{formatDateTime(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "agentName",
      header: "Агент",
      meta: { width: "minmax(0, 1.5fr)" },
      cell: ({ getValue }) => <span className="text-sm">{getValue() as string}</span>,
    },
    {
      accessorKey: "model",
      header: "Модель",
      meta: { width: "minmax(0, 1.4fr)" },
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() as string}</span>,
    },
    {
      accessorKey: "inputTokens",
      header: "Вход",
      meta: { width: "minmax(0, 0.7fr)" },
      cell: ({ getValue }) => <span className="tabular-nums text-sm">{formatNumber(getValue() as number)}</span>,
    },
    {
      accessorKey: "outputTokens",
      header: "Выход",
      meta: { width: "minmax(0, 0.7fr)" },
      cell: ({ getValue }) => <span className="tabular-nums text-sm">{formatNumber(getValue() as number)}</span>,
    },
    {
      accessorKey: "toolTokens",
      header: "Инструменты",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm text-muted-foreground">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "reasoningTokens",
      header: "Рассуждение",
      meta: { width: "minmax(0, 0.95fr)" },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm text-muted-foreground">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "cacheTokens",
      header: "Кэш",
      meta: { width: "minmax(0, 0.7fr)" },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm text-muted-foreground">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      id: "total",
      header: "Итого",
      meta: { width: "minmax(0, 0.75fr)" },
      cell: ({ row }) => (
        <span className="tabular-nums text-sm font-medium">
          {formatNumber(
            row.original.inputTokens + row.original.outputTokens + row.original.toolTokens + row.original.reasoningTokens,
          )}
        </span>
      ),
    },
    {
      accessorKey: "costUSD",
      header: "Стоимость",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm whitespace-nowrap">{formatKzt(getValue() as number, 2)}</span>
      ),
    },
    {
      accessorKey: "latencyMs",
      header: "Латентность",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ getValue }) => (
        <span className="tabular-nums text-xs text-muted-foreground">{formatNumber(getValue() as number)} ms</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      meta: { width: "minmax(0, 0.85fr)" },
      cell: ({ getValue }) => (
        <StatusBadge tone={getValue() === "Ошибка" ? "danger" : "success"}>{getValue() as string}</StatusBadge>
      ),
    },
  ];

  return (
    <div className="pb-12 space-y-6">
      <p className="text-sm text-muted-foreground">Сводка за последние 30 дн.</p>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Всего вызовов" value={formatNumber(summary.calls)} />
        <KpiCard label="Входные токены" value={formatNumber(summary.input)} />
        <KpiCard label="Выходные токены" value={formatNumber(summary.output)} />
        <KpiCard label="Поиск / инструменты" value={formatNumber(summary.tools)} />
        <KpiCard label="Всего токенов" value={formatNumber(summary.total)} />
        <KpiCard label="Стоимость, всего" value={formatKzt(summary.cost)} accent />
      </div>

      <DataTable<LLMUsageRequest>
        bordered
        data={filtered}
        columns={columns}
        globalFilterPlaceholder="Поиск по агенту, модели..."
        renderExpanded={(r) => <ExpandedRow req={r} />}
        pageSize={50}
        globalFilterFn={(row, _c, value) => {
          const q = String(value).toLowerCase();
          const r = row.original;
          return r.agentName.toLowerCase().includes(q) || r.model.toLowerCase().includes(q);
        }}
        filters={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xl">
                  <Filter className="size-4" />
                  Все модели
                  {modelFilter.size ? (
                    <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{modelFilter.size}</span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Модель</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MODELS.map((m) => (
                  <DropdownMenuCheckboxItem
                    key={m}
                    checked={modelFilter.has(m)}
                    onCheckedChange={() => setModelFilter((s) => toggle(s, m))}
                  >
                    {m}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xl">
                  <Filter className="size-4" />
                  Все агенты
                  {agentFilter.size ? (
                    <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{agentFilter.size}</span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Агент</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {AGENTS.map((a) => (
                  <DropdownMenuCheckboxItem
                    key={a}
                    checked={agentFilter.has(a)}
                    onCheckedChange={() => setAgentFilter((s) => toggle(s, a))}
                  >
                    {a}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xl">
                  <Filter className="size-4" />
                  Все статусы
                  {statusFilter.size ? (
                    <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">{statusFilter.size}</span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Статус</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["Успешно", "Ошибка"] as const).map((s) => (
                  <DropdownMenuCheckboxItem
                    key={s}
                    checked={statusFilter.has(s)}
                    onCheckedChange={() => setStatusFilter((set) => toggle(set, s))}
                  >
                    {s}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
    </div>
  );
}
