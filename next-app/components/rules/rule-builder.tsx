"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import type { Rule, RuleCondition, RuleOp, AlertSeverity } from "@/lib/mock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const OP_LABEL: Record<RuleOp, string> = {
  eq: "= равно",
  ne: "≠ не равно",
  gt: "> больше",
  lt: "< меньше",
  in: "входит в",
  nin: "не входит в",
  contains: "содержит",
  between: "между",
}

const FIELDS = ["amountKZT", "currency", "counterparty.country", "channel", "type", "client.riskLevel", "client.country", "client.pep"]
const SEVERITY_LABEL: Record<AlertSeverity, string> = { low: "Низкая", medium: "Средняя", high: "Высокая", critical: "Критическая" }

export function RuleBuilder({ rule }: { rule?: Rule }) {
  const [name, setName] = React.useState(rule?.name ?? "")
  const [description, setDescription] = React.useState(rule?.description ?? "")
  const [entity, setEntity] = React.useState(rule?.entity ?? "transaction")
  const [severity, setSeverity] = React.useState<AlertSeverity>(rule?.severity ?? "high")
  const [enabled, setEnabled] = React.useState(rule?.enabled ?? true)
  const [conditions, setConditions] = React.useState<RuleCondition[]>(
    rule?.conditions ?? [{ id: "new-1", field: "amountKZT", op: "gt", value: 1_000_000 }],
  )

  const addCondition = () => setConditions((c) => [...c, { id: `new-${c.length + 1}`, field: "amountKZT", op: "gt", value: "" }])
  const removeCondition = (id: string) => setConditions((c) => c.filter((x) => x.id !== id))
  const update = (id: string, patch: Partial<RuleCondition>) => setConditions((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  return (
    <div className="flex flex-col gap-4">
      {/* Метаданные */}
      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-4 font-heading text-[15px] font-semibold">Метаданные</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-name">Название</Label>
            <Input id="rule-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Крупный перевод нерезиденту" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Категория</Label>
            <Select value={entity} onValueChange={(v) => setEntity(v as Rule["entity"])}>
              <SelectTrigger className="shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Клиенты</SelectItem>
                <SelectItem value="transaction">Транзакции</SelectItem>
                <SelectItem value="group">Группы</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="rule-desc">Описание</Label>
            <Textarea id="rule-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverity)}>
              <SelectTrigger className="shadow-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(SEVERITY_LABEL) as AlertSeverity[]).map((s) => (
                  <SelectItem key={s} value={s}>{SEVERITY_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 self-end pb-2">
            <Switch id="rule-enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="rule-enabled" className="cursor-pointer">Правило включено</Label>
          </div>
        </div>
      </div>

      {/* Условия */}
      <div className="rounded-xl border border-border p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h4 className="font-heading text-[15px] font-semibold">Условия</h4>
            <p className="text-xs text-muted-foreground">Срабатывает, когда выполнены все условия (AND).</p>
          </div>
          <Button size="sm" variant="outline" onClick={addCondition}><Plus className="size-4" />Добавить</Button>
        </div>
        <div className="space-y-2">
          {conditions.map((c) => (
            <div key={c.id} className="grid gap-2 rounded-lg border border-border/60 bg-foreground/[0.02] p-2 md:grid-cols-[1fr_1fr_1fr_auto] dark:bg-white/[0.02]">
              <Select value={c.field} onValueChange={(v) => update(c.id, { field: v })}>
                <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                <SelectContent>{FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={c.op} onValueChange={(v) => update(c.id, { op: v as RuleOp })}>
                <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(OP_LABEL) as RuleOp[]).map((op) => <SelectItem key={op} value={op}>{OP_LABEL[op]}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={String(c.value ?? "")} onChange={(e) => update(c.id, { value: e.target.value })} className="h-8" placeholder="Значение" />
              <Button variant="ghost" size="icon" onClick={() => removeCondition(c.id)} aria-label="Удалить условие"><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Действия при срабатывании */}
      <div className="rounded-xl border border-border p-4">
        <h4 className="mb-4 font-heading text-[15px] font-semibold">Действия при срабатывании</h4>
        <div className="space-y-2 text-sm">
          {["Создать оповещение", "Повысить риск клиента", "Отправить в кейс", "Заблокировать операцию"].map((a) => (
            <label key={a} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
              <input type="checkbox" className="size-4 rounded border-border accent-primary" defaultChecked={a === "Создать оповещение"} />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
