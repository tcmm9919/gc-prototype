"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Rule, RuleCondition, RuleOp } from "@/lib/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OP_LABEL: Record<RuleOp, string> = {
  eq: "= равно",
  ne: "≠ не равно",
  gt: "> больше",
  lt: "< меньше",
  in: "входит в",
  nin: "не входит в",
  contains: "содержит",
  between: "между",
};

const FIELDS = [
  "amountKZT",
  "currency",
  "counterparty.country",
  "channel",
  "type",
  "client.riskLevel",
  "client.country",
  "client.pep",
];

interface RuleBuilderProps {
  rule?: Rule;
  /** Read-only режим — все инпуты заблокированы, мутирующие кнопки скрыты. */
  readOnly?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
}

export function RuleBuilder({ rule, readOnly = false, onCancel, onSave }: RuleBuilderProps) {
  const [name, setName] = React.useState(rule?.name ?? "");
  const [description, setDescription] = React.useState(rule?.description ?? "");
  const [entity, setEntity] = React.useState(rule?.entity ?? "transaction");
  const [enabled, setEnabled] = React.useState(rule?.enabled ?? true);
  const [conditions, setConditions] = React.useState<RuleCondition[]>(
    rule?.conditions ?? [{ id: "new-1", field: "amountKZT", op: "gt", value: 1_000_000 }],
  );

  React.useEffect(() => {
    setName(rule?.name ?? "");
    setDescription(rule?.description ?? "");
    setEntity(rule?.entity ?? "transaction");
    setEnabled(rule?.enabled ?? true);
    setConditions(rule?.conditions ?? [{ id: "new-1", field: "amountKZT", op: "gt", value: 1_000_000 }]);
  }, [rule?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addCondition = () =>
    setConditions((c) => [...c, { id: `new-${Date.now()}`, field: "amountKZT", op: "gt", value: "" }]);
  const removeCondition = (id: string) => setConditions((c) => c.filter((x) => x.id !== id));
  const update = (id: string, patch: Partial<RuleCondition>) =>
    setConditions((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <div className="space-y-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Метаданные</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rule-name">Название</Label>
            <Input
              id="rule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр. Крупный перевод нерезиденту"
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Тип сущности</Label>
            <Select value={entity} onValueChange={(v) => setEntity(v as Rule["entity"])} disabled={readOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Клиент</SelectItem>
                <SelectItem value="transaction">Транзакция</SelectItem>
                <SelectItem value="group">Группа</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="rule-desc">Описание</Label>
            <Textarea
              id="rule-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={readOnly}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="rule-enabled" checked={enabled} onCheckedChange={setEnabled} disabled={readOnly} />
            <Label htmlFor="rule-enabled" className={readOnly ? "" : "cursor-pointer"}>
              Правило включено
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Условия</CardTitle>
            <p className="text-xs text-muted-foreground">
              Срабатывает, когда все условия выполнены (AND). Группы AND/OR — в следующей версии.
            </p>
          </div>
          {!readOnly ? (
            <Button size="sm" variant="outline" onClick={addCondition}>
              <Plus className="size-4" />
              Добавить
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-2">
          {conditions.map((c) => (
            <div
              key={c.id}
              className={`grid gap-2 rounded-md border border-border/60 p-2 ${readOnly ? "md:grid-cols-3" : "md:grid-cols-[1fr_1fr_1fr_auto]"}`}
            >
              <Select value={c.field} onValueChange={(v) => update(c.id, { field: v })} disabled={readOnly}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELDS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={c.op} onValueChange={(v) => update(c.id, { op: v as RuleOp })} disabled={readOnly}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(OP_LABEL) as RuleOp[]).map((op) => (
                    <SelectItem key={op} value={op}>
                      {OP_LABEL[op]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={String(c.value ?? "")}
                onChange={(e) => update(c.id, { value: e.target.value })}
                className="h-8"
                placeholder="Значение"
                disabled={readOnly}
              />
              {!readOnly ? (
                <Button variant="ghost" size="icon" onClick={() => removeCondition(c.id)} aria-label="Удалить условие">
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Действия при срабатывании</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {["Создать оповещение", "Повысить риск клиента", "Отправить в кейс", "Заблокировать операцию"].map((a) => (
            <label key={a} className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                defaultChecked={a === "Создать оповещение"}
                disabled={readOnly}
              />
              <span>{a}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {!readOnly ? (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button size="lg" onClick={onSave}>
            Сохранить правило
          </Button>
        </div>
      ) : null}
    </div>
  );
}
