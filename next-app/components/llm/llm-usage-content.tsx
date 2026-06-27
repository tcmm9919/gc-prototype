"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Filter, Coins, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMockData, type LLMAgentName, type LLMModelName, type LLMUsageRequest } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ext/data-table";
import { StatusBadge } from "@/components/ext/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Тарифы за 1M токенов (USD), приводятся к ₸ по демо-курсу. Mock-прайс провайдера.
const MODEL_PRICES: { model: LLMModelName; input: number; output: number }[] = [
  { model: "deepseek-v32/latest", input: 0.27, output: 1.1 },
  { model: "gpt-oss-120b/latest", input: 0.15, output: 0.6 },
  { model: "qwen3-235b-a22b-fp8/latest", input: 0.2, output: 0.85 },
  { model: "yandexgpt-5.1/latest", input: 0.3, output: 1.2 },
  { model: "gemma-3-27b-it/latest", input: 0.08, output: 0.3 },
];

function TokenPricesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="xl">
          <Coins className="size-4" />
          Цены за токен
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Цены за токен</DialogTitle>
          <DialogDescription>Тариф за 1&nbsp;млн токенов, ₸ (по демо-курсу {KZT_PER_USD}&nbsp;₸/$).</DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.02] text-left text-[10px] tracking-[0.08em] text-muted-foreground uppercase dark:bg-white/[0.02]">
                <th className="px-3 py-2 first:pl-4">Модель</th>
                <th className="px-3 py-2 text-right">Вход / 1M</th>
                <th className="px-3 py-2 text-right">Выход / 1M</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_PRICES.map((p) => (
                <tr key={p.model} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 pl-4 font-mono text-xs text-foreground">{p.model}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatKzt(p.input)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatKzt(p.output)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
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
        <div className={`text-base sm:text-xl font-semibold leading-tight tabular-nums ${accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function formatCostUsd(usd: number): string {
  return "$" + usd.toFixed(usd < 0.01 ? 4 : 2);
}

// Сырой объект ответа провайдера (Yandex Foundation Models, формат Responses API).
// Собирается из полей запроса так, чтобы вложенные узлы совпадали с их сайтом:
// usage {6 keys}, output [2 items], prompt {4 keys}.
function buildRawResponse(req: LLMUsageRequest): Record<string, unknown> {
  const folder = "b1g1b12adp0dgc2gos4r";
  const createdAt = Math.floor(new Date(req.timestamp).getTime() / 1000);
  const shortId = req.id.replace(/-/g, "").slice(0, 12);
  return {
    id: req.id,
    model: `gpt://${folder}/${req.model}`,
    top_p: 1,
    usage: {
      input_tokens: req.inputTokens,
      output_tokens: req.outputTokens,
      tool_tokens: req.toolTokens,
      reasoning_tokens: req.reasoningTokens,
      cached_tokens: req.cacheTokens,
      total_tokens: req.inputTokens + req.outputTokens + req.toolTokens + req.reasoningTokens,
    },
    valid: req.status !== "Ошибка",
    object: "response",
    output: [
      { type: "reasoning", id: `rs_${shortId}` },
      { type: "message", role: "assistant", status: "completed" },
    ],
    prompt: {
      id: `pmpt_${shortId}`,
      version: "1",
      cached: req.cacheTokens > 0,
      variables: {},
    },
    status: req.status === "Ошибка" ? "failed" : "completed",
    background: false,
    created_at: createdAt,
    truncation: "disabled",
    temperature: 0.3,
    tool_choice: "auto",
    service_tier: "default",
    max_output_tokens: 6000,
    parallel_tool_calls: false,
  };
}

function jsonSummary(v: object): string {
  return Array.isArray(v) ? `[${v.length} items]` : `{${Object.keys(v).length} keys}`;
}

function fmtPrimitive(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return String(v);
}

/** Рекурсивная строка JSON-дерева: примитивы — инлайн, объекты/массивы — раскрываемые. */
function JsonRow({ name, value, depth = 0 }: { name: string; value: unknown; depth?: number }) {
  const isObj = value !== null && typeof value === "object";
  const [open, setOpen] = React.useState(false);

  if (!isObj) {
    return (
      <div className="grid grid-cols-[minmax(110px,170px)_1fr] gap-3 py-0.5">
        <span className="text-muted-foreground">{name}</span>
        <span className="break-all text-foreground">{fmtPrimitive(value)}</span>
      </div>
    );
  }

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, unknown>);

  return (
    <div className="py-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-[minmax(110px,170px)_1fr] gap-3 text-left"
      >
        <span className="text-muted-foreground">{name}</span>
        <span className="inline-flex items-center gap-1 text-primary">
          <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} />
          {jsonSummary(value as object)}
        </span>
      </button>
      {open ? (
        <div className="mt-1 ml-2 border-l border-border/60 pl-3">
          {entries.map(([k, v]) => (
            <JsonRow key={k} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
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

      <div className="lg:col-span-2">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Ответ Yandex (полный)</p>
        <div className="max-h-80 overflow-auto rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs leading-relaxed">
          {Object.entries(buildRawResponse(req)).map(([k, v]) => (
            <JsonRow key={k} name={k} value={v} />
          ))}
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
        toolbar={<TokenPricesDialog />}
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
