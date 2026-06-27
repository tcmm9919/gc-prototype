"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import type { Rule, RuleCondition, RuleOp, RuleCategory, AlertSeverity } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Поля условий (PRD, 17 шт.)
const FIELDS: { v: string; l: string }[] = [
  { v: "amount", l: "Сумма транзакции" },
  { v: "amountKZT", l: "Сумма в тенге" },
  { v: "currency", l: "Валюта" },
  { v: "direction", l: "Направление" },
  { v: "txType", l: "Тип транзакции" },
  { v: "txTime", l: "Время операции" },
  { v: "counterparty.country", l: "Страна контрагента" },
  { v: "riskScore", l: "Риск-скор" },
  { v: "kycStatus", l: "KYC статус" },
  { v: "pep", l: "PEP" },
  { v: "blocked", l: "Заблокирован" },
  { v: "clientType", l: "Тип клиента" },
  { v: "citizenship", l: "Гражданство" },
  { v: "txCount", l: "Количество транзакций" },
  { v: "avgAmount", l: "Средняя сумма транзакций" },
  { v: "declaredIncome", l: "Задекларированный доход" },
  { v: "expectedBaseline", l: "Ожидаемый базовый уровень" },
]
const FIELD_LABEL: Record<string, string> = Object.fromEntries(FIELDS.map((f) => [f.v, f.l]))

// Операторы (PRD, 8 шт.)
const OPS: { v: RuleOp; l: string }[] = [
  { v: "gt", l: "больше (>)" },
  { v: "gte", l: "не меньше (>=)" },
  { v: "lt", l: "меньше (<)" },
  { v: "lte", l: "не больше (<=)" },
  { v: "eq", l: "равно (==)" },
  { v: "ne", l: "не равно (!=)" },
  { v: "in", l: "входит в список" },
  { v: "nin", l: "не входит в список" },
]

const CATEGORY_LABEL: Record<RuleCategory, string> = {
  transaction: "Транзакции",
  client: "Клиенты",
  screening: "Скрининг",
  behavior: "Поведение",
}
const SEVERITY_LABEL: Record<AlertSeverity, string> = { critical: "Критический", high: "Высокий", medium: "Средний", low: "Низкий" }

function SectionTitle({ children, description }: { children: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h4 className="font-heading text-[15px] font-semibold text-foreground">{children}</h4>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function RuleBuilder({ rule }: { rule?: Rule }) {
  const [name, setName] = React.useState(rule?.name ?? "")
  const [description, setDescription] = React.useState(rule?.description ?? "")
  const [category, setCategory] = React.useState<RuleCategory>(rule?.category ?? "transaction")
  const [severity, setSeverity] = React.useState<AlertSeverity>(rule?.severity ?? "high")
  const [enabled, setEnabled] = React.useState(rule?.enabled ?? true)
  const [conditions, setConditions] = React.useState<RuleCondition[]>(
    rule?.conditions ?? [{ id: "new-1", field: "amount", op: "gt", value: 1_000_000 }],
  )

  const addCondition = () => setConditions((c) => [...c, { id: `new-${c.length}-${c.length + 1}`, field: "amount", op: "gt", value: "" }])
  const removeCondition = (id: string) => setConditions((c) => c.filter((x) => x.id !== id))
  const update = (id: string, patch: Partial<RuleCondition>) => setConditions((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const setMode = (id: string, mode: "value" | "field") =>
    setConditions((c) => c.map((x) => (x.id === id ? { ...x, compareField: mode === "field" ? (x.compareField ?? "amountKZT") : undefined } : x)))

  return (
    <div className="flex flex-col gap-5">
      {/* Метаданные */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rule-name">Название <span className="text-destructive">*</span></Label>
          <Input id="rule-name" autoFocus={!rule} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Крупный перевод нерезиденту" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rule-desc">Описание</Label>
          <Textarea id="rule-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Когда и зачем срабатывает правило" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-category">Категория</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as RuleCategory)}>
              <SelectTrigger id="rule-category" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABEL) as RuleCategory[]).map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-severity">Важность</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverity)}>
              <SelectTrigger id="rule-severity" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["critical", "high", "medium", "low"] as AlertSeverity[]).map((s) => (
                  <SelectItem key={s} value={s}>{SEVERITY_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="rule-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <Label htmlFor="rule-enabled" className="cursor-pointer">Правило включено</Label>
        </div>
      </div>

      {/* Условия */}
      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <SectionTitle description="Срабатывает, когда выполнены все условия (AND).">Условия (все должны выполняться)</SectionTitle>
        <div className="flex flex-col gap-2">
          {conditions.map((c, idx) => {
            const fieldMode = c.compareField !== undefined
            return (
              <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-foreground/[0.03] p-3 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">{idx === 0 ? "Если" : "И"}</span>
                  <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => removeCondition(c.id)} aria-label="Удалить условие">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Select value={c.field} onValueChange={(v) => update(c.id, { field: v })}>
                    <SelectTrigger size="sm" className="w-full"><SelectValue placeholder="Поле…" /></SelectTrigger>
                    <SelectContent>{FIELDS.map((f) => <SelectItem key={f.v} value={f.v}>{f.l}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={c.op} onValueChange={(v) => update(c.id, { op: v as RuleOp })}>
                    <SelectTrigger size="sm" className="w-full"><SelectValue placeholder="Оператор…" /></SelectTrigger>
                    <SelectContent>{OPS.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-0.5 rounded-lg bg-foreground/[0.05] p-0.5 dark:bg-white/[0.06]">
                    {(["value", "field"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(c.id, m)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                          (m === "field") === fieldMode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {m === "value" ? "Значение" : "Поле"}
                      </button>
                    ))}
                  </div>
                  {fieldMode ? (
                    <Select value={c.compareField} onValueChange={(v) => update(c.id, { compareField: v })}>
                      <SelectTrigger size="sm" className="min-w-48 flex-1"><SelectValue placeholder="Поле…" /></SelectTrigger>
                      <SelectContent>{FIELDS.map((f) => <SelectItem key={f.v} value={f.v}>{f.l}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={String(c.value ?? "")}
                      onChange={(e) => update(c.id, { value: e.target.value })}
                      className="h-8 min-w-48 flex-1"
                      placeholder="Значение"
                      aria-label="Значение условия"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <Button type="button" size="sm" variant="outline" className="w-fit" onClick={addCondition}>
          <Plus className="size-4" />
          Добавить условие
        </Button>
      </div>

      {/* Действия при срабатывании */}
      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <SectionTitle>Действия при срабатывании</SectionTitle>
        <div className="flex flex-col gap-2 text-sm">
          {["Создать оповещение", "Повысить риск клиента", "Отправить в кейс", "Заблокировать операцию"].map((a) => (
            <label key={a} className="flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.03] px-3 py-2 dark:bg-white/[0.03]">
              <input type="checkbox" className="size-4 rounded border-border accent-primary" defaultChecked={a === "Создать оповещение"} />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export { FIELD_LABEL, CATEGORY_LABEL }
