"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import type {
  RiskFactor,
  RiskBucket,
  BucketOp,
  RiskFactorType,
  RiskFactorAggregation,
} from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: RiskFactorType; label: string }[] = [
  { value: "scoring_history", label: "Скоринг (история)" },
  { value: "client_field", label: "Поле клиента" },
  { value: "transaction", label: "Транзакция" },
  { value: "media", label: "Медиа" },
  { value: "custom", label: "Кастомное" },
];

const SOURCES: { source: string; label: string }[] = [
  { source: "scoring_history.total", label: "Scoring total" },
  { source: "customers.pdl", label: "PDL flag" },
  { source: "customers.pep", label: "PEP flag" },
  { source: "customers.country", label: "Страна резидентства" },
  { source: "transactions.amount_kzt", label: "Сумма операции (KZT)" },
  { source: "transactions.count_30d", label: "Транзакций за 30 дн" },
  { source: "media.adverse_count", label: "Adverse-media hits" },
];

const AGG_OPTIONS: { value: RiskFactorAggregation; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "max", label: "Max" },
  { value: "count", label: "Count" },
];

const OP_OPTIONS: { value: BucketOp; label: string }[] = [
  { value: "gte", label: "≥" },
  { value: "lte", label: "≤" },
  { value: "eq", label: "=" },
  { value: "between", label: "между" },
];

function opLabel(b: RiskBucket): string {
  const sym = OP_OPTIONS.find((o) => o.value === b.op)?.label ?? b.op;
  return b.op === "between" ? `${sym} ${b.value}…${b.value2 ?? b.value}` : `${sym} ${b.value}`;
}

function matchBucket(buckets: RiskBucket[], v: number): RiskBucket | null {
  for (const b of buckets) {
    if (b.op === "gte" && v >= b.value) return b;
    if (b.op === "lte" && v <= b.value) return b;
    if (b.op === "eq" && v === b.value) return b;
    if (b.op === "between" && v >= b.value && v <= (b.value2 ?? b.value)) return b;
  }
  return null;
}

interface Props {
  factor?: RiskFactor;
  onCancel?: () => void;
  onDone?: () => void;
}

export function RiskFactorForm({ factor, onCancel, onDone }: Props) {
  const router = useRouter();
  const isNew = !factor;

  const [name, setName] = React.useState(factor?.name ?? "");
  const [description, setDescription] = React.useState(factor?.description ?? "");
  const [type, setType] = React.useState<RiskFactorType>(factor?.type ?? "scoring_history");
  const [source, setSource] = React.useState(factor?.source ?? SOURCES[0].source);
  const [aggregation, setAggregation] = React.useState<RiskFactorAggregation>(factor?.aggregation ?? "latest");
  const [buckets, setBuckets] = React.useState<RiskBucket[]>(
    factor?.buckets ?? [{ op: "gte", value: 0, score: 0 }],
  );
  const [weight, setWeight] = React.useState<number>(factor?.weight ?? 0.1);
  const [active, setActive] = React.useState<boolean>(factor?.active ?? true);
  const [testValue, setTestValue] = React.useState<number>(0);

  const dismiss = () => (onCancel ? onCancel() : router.push("/risk-factors"));
  const save = () => (onDone ? onDone() : router.push("/risk-factors"));

  const matched = matchBucket(buckets, testValue);
  const updateBucket = (i: number, patch: Partial<RiskBucket>) =>
    setBuckets((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      {/* ── ФОРМА ── */}
      <div className="space-y-4">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
          {/* Основное */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="rf-name">Название</Label>
              <Input id="rf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="напр. Скоринговый балл" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Тип</Label>
              <Select value={type} onValueChange={(v) => setType(v as RiskFactorType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2.5 pb-1.5">
              <Switch id="rf-active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="rf-active" className="cursor-pointer">Активен</Label>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="rf-desc">Описание</Label>
              <Textarea id="rf-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Что считает этот атрибут" />
            </div>
          </div>

          {/* Источник */}
          <div className="grid gap-4 border-t border-border pt-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Источник</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.source} value={s.source}>
                      <span className="font-mono text-xs">{s.source}</span>
                      <span className="text-muted-foreground"> — {s.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Агрегация</Label>
              <Select value={aggregation} onValueChange={(v) => setAggregation(v as RiskFactorAggregation)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGG_OPTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Корзины */}
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-[15px] font-semibold">Корзины</h3>
                <p className="text-xs text-muted-foreground">Первое совпадение даёт балл</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setBuckets((bs) => [...bs, { op: "gte", value: 0, score: 0 }])}>
                <Plus className="size-4" />
                Добавить
              </Button>
            </div>
            <div className="space-y-2">
              {buckets.map((b, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                  <Select value={b.op} onValueChange={(v) => updateBucket(i, { op: v as BucketOp })}>
                    <SelectTrigger className="w-24 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OP_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" value={b.value} onChange={(e) => updateBucket(i, { value: Number(e.target.value) })} className="w-28 min-w-0 flex-1" placeholder="значение" />
                  {b.op === "between" && (
                    <Input type="number" value={b.value2 ?? 0} onChange={(e) => updateBucket(i, { value2: Number(e.target.value) })} className="w-28 min-w-0 flex-1" placeholder="до" />
                  )}
                  <span className="shrink-0 text-muted-foreground">→</span>
                  <Input type="number" value={b.score} onChange={(e) => updateBucket(i, { score: Number(e.target.value) })} className="w-20 shrink-0" placeholder="балл" />
                  <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-risk-critical" onClick={() => setBuckets((bs) => bs.filter((_, j) => j !== i))} aria-label="Удалить корзину">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Вес */}
          <div className="border-t border-border pt-5">
            <div className="flex max-w-xs flex-col gap-1.5">
              <Label htmlFor="rf-weight">Вес (0–1)</Label>
              <Input id="rf-weight" type="number" min={0} max={1} step={0.05} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Итоговый балл нормализуется по сумме весов всех факторов.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={dismiss}>Отмена</Button>
          <Button onClick={save}>{isNew ? "Создать фактор" : "Сохранить"}</Button>
        </div>
      </div>

      {/* ── ПРЕВЬЮ (sticky) ── */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[15px] font-semibold">Превью</h3>
            {!active ? <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">выключен</span> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-test" className="text-xs">Тестовое значение</Label>
            <Input id="rf-test" type="number" value={testValue} onChange={(e) => setTestValue(Number(e.target.value))} />
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Балл фактора</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={cn("font-mono text-[32px] font-bold leading-none tabular-nums", matched ? "text-foreground" : "text-muted-foreground")}>
                {matched ? matched.score : "—"}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/[0.08]">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${matched ? matched.score : 0}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {matched ? `Сработала корзина ${opLabel(matched)}` : "Нет совпавшей корзины"}
            </p>
          </div>

          <div className="space-y-1">
            {buckets.map((b, i) => (
              <div key={i} className={cn("flex items-center justify-between rounded-md px-2 py-1.5 text-xs", matched === b ? "bg-primary/10 text-foreground" : "text-muted-foreground")}>
                <span className="font-mono">{opLabel(b)}</span>
                <span className="tabular-nums">→ {b.score}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 text-xs text-muted-foreground">
            Вес <span className="font-mono font-medium text-foreground">{weight}</span> · вклад в итог нормализуется по сумме весов.
          </div>
        </div>
      </aside>
    </div>
  );
}
