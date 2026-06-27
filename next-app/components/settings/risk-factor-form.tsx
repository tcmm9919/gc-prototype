"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import type {
  RiskFactor,
  RiskBucket,
  BucketOp,
  RiskFactorType,
  RiskFactorAggregation,
} from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreatePageShell } from "@/components/ext/create-page-shell"
import { toast } from "sonner"

const TYPE_OPTIONS: { value: RiskFactorType; label: string }[] = [
  { value: "scoring_history", label: "Скоринг (история)" },
  { value: "client_field", label: "Поле клиента" },
  { value: "transaction", label: "Транзакция" },
  { value: "media", label: "Медиа" },
  { value: "custom", label: "Кастомное" },
]

const SOURCES: { source: string; label: string }[] = [
  { source: "scoring_history.total", label: "Scoring total" },
  { source: "scoring_history.risk_level", label: "Scoring risk level" },
  { source: "customers.pdl", label: "PDL flag" },
  { source: "customers.pep", label: "PEP flag" },
  { source: "customers.country", label: "Страна резидентства" },
  { source: "transactions.amount_kzt", label: "Сумма операции (KZT)" },
  { source: "transactions.count_30d", label: "Транзакций за 30 дн" },
  { source: "media.adverse_count", label: "Adverse-media hits" },
]

const AGG_OPTIONS: { value: RiskFactorAggregation; label: string }[] = [
  { value: "latest", label: "Последнее" },
  { value: "sum", label: "Сумма" },
  { value: "avg", label: "Среднее" },
  { value: "max", label: "Максимум" },
  { value: "count", label: "Количество" },
]

const OP_OPTIONS: { value: BucketOp; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "ne", label: "≠" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "between", label: "между" },
]

interface Props {
  factor?: RiskFactor
  onCancel?: () => void
  onDone?: () => void
}

/** Подзаголовок секции внутри карточки формы. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-[15px] font-semibold text-foreground">
      {children}
    </h3>
  )
}

export function RiskFactorForm({ factor, onCancel, onDone }: Props) {
  const router = useRouter()
  const isNew = !factor

  const [name, setName] = React.useState(factor?.name ?? "")
  const [description, setDescription] = React.useState(
    factor?.description ?? ""
  )
  const [type, setType] = React.useState<RiskFactorType>(
    factor?.type ?? "scoring_history"
  )
  const [source, setSource] = React.useState(
    factor?.source ?? SOURCES[0].source
  )
  const [aggregation, setAggregation] = React.useState<RiskFactorAggregation>(
    factor?.aggregation ?? "latest"
  )
  const [buckets, setBuckets] = React.useState<RiskBucket[]>(
    factor?.buckets ?? [{ op: "gte", value: 0, score: 0 }]
  )
  const [weight, setWeight] = React.useState<number>(factor?.weight ?? 0.1)
  const [active, setActive] = React.useState<boolean>(factor?.active ?? true)

  const dismiss = () => (onCancel ? onCancel() : router.push("/risk-factors"))
  const save = () => {
    toast.success(isNew ? "Риск-атрибут создан" : "Изменения сохранены")
    if (onDone) onDone()
    else router.push("/risk-factors")
  }

  const updateBucket = (i: number, patch: Partial<RiskBucket>) =>
    setBuckets((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)))

  return (
    <CreatePageShell
      breadcrumbs={[
        { label: "Риск-факторы", href: "/risk-factors" },
        { label: isNew ? "Новый атрибут" : factor?.name || "Атрибут" },
      ]}
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      footer={
        <>
          <Button type="button" variant="outline" onClick={dismiss}>
            Отмена
          </Button>
          <Button type="submit">
            {isNew ? "Создать атрибут" : "Сохранить"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Основное */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-name">
              Название <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rf-name"
              autoFocus={isNew}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Скоринговый балл"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-type">Тип</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as RiskFactorType)}
            >
              <SelectTrigger id="rf-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-desc">Описание</Label>
            <Textarea
              id="rf-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Что считает этот атрибут"
            />
          </div>
        </div>

        {/* Источник */}
        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <SectionTitle>Источник данных</SectionTitle>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-source">Источник</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger id="rf-source" className="w-full">
                <SelectValue />
              </SelectTrigger>
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
            <Label htmlFor="rf-agg">Агрегация</Label>
            <Select
              value={aggregation}
              onValueChange={(v) => setAggregation(v as RiskFactorAggregation)}
            >
              <SelectTrigger id="rf-agg" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGG_OPTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Корзины */}
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <SectionTitle>Корзины</SectionTitle>
              <p className="text-xs text-muted-foreground">
                Первое совпадение даёт балл
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setBuckets((bs) => [...bs, { op: "gte", value: 0, score: 0 }])
              }
            >
              <Plus className="size-4" />
              Добавить
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {buckets.map((b, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
              >
                <Select
                  value={b.op}
                  onValueChange={(v) => updateBucket(i, { op: v as BucketOp })}
                >
                  <SelectTrigger className="min-w-0 flex-[1.2]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OP_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={b.value}
                  onChange={(e) =>
                    updateBucket(i, { value: Number(e.target.value) })
                  }
                  className="min-w-0 flex-[1.6]"
                  placeholder="значение"
                  aria-label="Значение"
                />
                {b.op === "between" && (
                  <Input
                    type="number"
                    value={b.value2 ?? 0}
                    onChange={(e) =>
                      updateBucket(i, { value2: Number(e.target.value) })
                    }
                    className="min-w-0 flex-[1.6]"
                    placeholder="до"
                    aria-label="Значение до"
                  />
                )}
                <span className="shrink-0 text-muted-foreground">→</span>
                <Input
                  type="number"
                  value={b.score}
                  onChange={(e) =>
                    updateBucket(i, { score: Number(e.target.value) })
                  }
                  className="min-w-0 flex-1"
                  placeholder="балл"
                  aria-label="Балл"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-risk-critical"
                  onClick={() =>
                    setBuckets((bs) => bs.filter((_, j) => j !== i))
                  }
                  aria-label="Удалить корзину"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Параметры */}
        <div className="flex flex-col gap-4 border-t border-border pt-5">
          <SectionTitle>Параметры</SectionTitle>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rf-weight">Вес (0–1)</Label>
            <Input
              id="rf-weight"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Итоговый балл нормализуется по сумме весов всех факторов.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch id="rf-active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="rf-active" className="cursor-pointer">
              Активен
            </Label>
          </div>
        </div>
      </div>
    </CreatePageShell>
  )
}
