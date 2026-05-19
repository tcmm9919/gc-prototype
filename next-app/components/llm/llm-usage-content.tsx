"use client";

import * as React from "react";
import Link from "next/link";
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

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function KpiCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`text-xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
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
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm whitespace-nowrap">{formatDateTime(getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "agentName",
      header: "Агент",
      cell: ({ getValue }) => <span className="text-sm">{getValue() as string}</span>,
    },
    {
      accessorKey: "model",
      header: "Модель",
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() as string}</span>,
    },
    {
      accessorKey: "inputTokens",
      header: "Вход",
      cell: ({ getValue }) => <span className="tabular-nums text-sm">{formatNumber(getValue() as number)}</span>,
    },
    {
      accessorKey: "outputTokens",
      header: "Выход",
      cell: ({ getValue }) => <span className="tabular-nums text-sm">{formatNumber(getValue() as number)}</span>,
    },
    {
      accessorKey: "toolTokens",
      header: "Инструменты",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm text-muted-foreground">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "reasoningTokens",
      header: "Рассуждение",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm text-muted-foreground">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "cacheTokens",
      header: "Кэш",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm text-muted-foreground">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      id: "total",
      header: "Итого",
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
      cell: ({ getValue }) => (
        <span className="tabular-nums text-sm">${(getValue() as number).toFixed(4)}</span>
      ),
    },
    {
      accessorKey: "latencyMs",
      header: "Латентность",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-xs text-muted-foreground">{formatNumber(getValue() as number)} ms</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ getValue }) => (
        <StatusBadge tone={getValue() === "Ошибка" ? "danger" : "success"}>{getValue() as string}</StatusBadge>
      ),
    },
  ];

  return (
    <div className="px-6 pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Сводка за последние 30 дн.</p>
        <Link href="#" className="text-sm text-primary hover:underline">
          Цены за токен
        </Link>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Всего вызовов" value={formatNumber(summary.calls)} />
        <KpiCard label="Входные токены" value={formatNumber(summary.input)} />
        <KpiCard label="Выходные токены" value={formatNumber(summary.output)} />
        <KpiCard label="Поиск / инструменты" value={formatNumber(summary.tools)} />
        <KpiCard label="Всего токенов" value={formatNumber(summary.total)} />
        <KpiCard label="Стоимость, всего" value={`$${summary.cost.toFixed(2)}`} accent />
      </div>

      <DataTable<LLMUsageRequest>
        data={filtered}
        columns={columns}
        globalFilterPlaceholder="Поиск по агенту, модели..."
        pageSize={50}
        globalFilterFn={(row, _c, value) => {
          const q = String(value).toLowerCase();
          const r = row.original;
          return r.agentName.toLowerCase().includes(q) || r.model.toLowerCase().includes(q);
        }}
        toolbar={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
                <Button variant="outline" size="sm">
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
                <Button variant="outline" size="sm">
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
