"use client";

import * as React from "react";
import { StateSwitch } from "@/components/ext/state-switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SystemConfigEntry {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

const INITIAL_CONFIG: SystemConfigEntry[] = [
  {
    key: "compliance_agent_config",
    value: JSON.stringify({
      enabled: true,
      manager_email: "tenizbaia@freedombank.kz",
      send_email_on_dispatch: true,
      send_email_on_clear: true,
      send_email_on_fail: true,
      send_email_on_escalate: true,
    }),
    description: "Конфигурация рантайма Compliance Officer AI",
    updatedAt: "05.05.2026 20:27",
  },
  {
    key: "default_timezone",
    value: JSON.stringify({ timezone: "Asia/Almaty", offset: "UTC+5" }),
    description: "Часовой пояс по умолчанию для отчётов",
    updatedAt: "27.04.2026 11:37",
  },
  {
    key: "sla_medium_hours",
    value: JSON.stringify({ hours: 72 }),
    description: "SLA для алертов средней важности",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "sla_low_hours",
    value: JSON.stringify({ hours: 168 }),
    description: "SLA для алертов низкой важности",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "sla_critical_hours",
    value: JSON.stringify({ hours: 4 }),
    description: "SLA для критических алертов",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "default_currency",
    value: JSON.stringify({ currency: "KZT" }),
    description: "Валюта по умолчанию для отчётов",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "risk_thresholds",
    value: JSON.stringify({ low: 25, medium: 50, high: 75 }),
    description: "Пороги категорий риск-скора",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "sla_high_hours",
    value: JSON.stringify({ hours: 24 }),
    description: "SLA для алертов высокой важности",
    updatedAt: "24.04.2026 15:54",
  },
];

function prettifyJson(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json));
  } catch {
    return json;
  }
}

export default function Page() {
  const [config, setConfig] = React.useState<SystemConfigEntry[]>(INITIAL_CONFIG);
  const [newKey, setNewKey] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");

  const canSave = newKey.trim() && newValue.trim();

  const save = () => {
    if (!canSave) return;
    const now = new Date();
    const updatedAt =
      now.toLocaleDateString("ru-RU") + " " + now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const existing = config.findIndex((c) => c.key === newKey.trim());
    if (existing >= 0) {
      setConfig((c) => {
        const next = [...c];
        next[existing] = { ...next[existing], value: newValue, description: newDescription || next[existing].description, updatedAt };
        return next;
      });
    } else {
      setConfig((c) => [...c, { key: newKey.trim(), value: newValue, description: newDescription, updatedAt }]);
    }
    setNewKey("");
    setNewValue("");
    setNewDescription("");
  };

  return (
    <StateSwitch skeleton="table" emptyTitle="Системных настроек нет">
      <div className="space-y-4">
        <Card className="border-border">
          {/* Mobile: список — ключ, описание, дата + JSON-значение блоком с переносом
              (иначе значение режется за горизонтальным скроллом таблицы). */}
          <div className="divide-y divide-border/60 md:hidden">
            {config.map((row) => (
              <div key={row.key} className="flex flex-col gap-1.5 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-foreground">{row.key}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{row.updatedAt}</span>
                </div>
                {row.description ? <div className="text-xs text-muted-foreground">{row.description}</div> : null}
                <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-foreground/[0.04] p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground dark:bg-white/[0.04]">
                  {prettifyJson(row.value)}
                </pre>
              </div>
            ))}
          </div>

          {/* Desktop: таблица. overflow-x-auto + min-w → скроллится, а не ломается. */}
          <div role="table" aria-label="Системные настройки" className="hidden overflow-x-auto md:block">
            <div role="rowgroup">
              <div
                role="row"
                className="grid min-w-[640px] grid-cols-[1fr_1.5fr_1fr_140px] gap-3 border-b border-border px-4 py-3 text-[13px] font-normal text-muted-foreground [&>*]:border-r [&>*]:border-border/60 [&>*]:pr-3 [&>*:last-child]:border-r-0"
              >
                <span role="columnheader">Ключ</span>
                <span role="columnheader">Значение</span>
                <span role="columnheader">Описание</span>
                <span role="columnheader">Обновлено</span>
              </div>
            </div>
            <div role="rowgroup">
              {config.map((row) => (
                <div
                  role="row"
                  key={row.key}
                  className="grid min-w-[640px] grid-cols-[1fr_1.5fr_1fr_140px] gap-3 border-b border-border/50 px-4 py-3 text-sm last:border-b-0 [&>*]:border-r [&>*]:border-border/60 [&>*]:pr-3 [&>*:last-child]:border-r-0"
                >
                  <span role="cell" className="font-mono text-xs text-foreground">{row.key}</span>
                  <span role="cell" className="font-mono text-xs text-muted-foreground break-all">{prettifyJson(row.value)}</span>
                  <span role="cell" className="text-muted-foreground text-xs">{row.description}</span>
                  <span role="cell" className="tabular-nums text-xs text-muted-foreground">{row.updatedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold">Добавить / обновить настройку</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Если ключ уже существует — его значение обновится.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              className="mt-3 space-y-3"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-key">Ключ</Label>
                  <Input
                    id="cfg-key"
                    placeholder="sla_hours"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-value">Значение (JSON)</Label>
                  <Input
                    id="cfg-value"
                    placeholder={'{"hours": 24}'}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cfg-desc">Описание</Label>
                  <Input
                    id="cfg-desc"
                    placeholder="Краткое описание"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={!canSave}>
                Сохранить
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </StateSwitch>
  );
}
