"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    description: "Compliance Officer AI runtime configuration",
    updatedAt: "05.05.2026 20:27",
  },
  {
    key: "default_timezone",
    value: JSON.stringify({ timezone: "Asia/Almaty", offset: "UTC+5" }),
    description: "Default timezone for reports",
    updatedAt: "27.04.2026 11:37",
  },
  {
    key: "sla_medium_hours",
    value: JSON.stringify({ hours: 72 }),
    description: "SLA for medium severity alerts",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "sla_low_hours",
    value: JSON.stringify({ hours: 168 }),
    description: "SLA for low severity alerts",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "sla_critical_hours",
    value: JSON.stringify({ hours: 4 }),
    description: "SLA for critical alerts",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "default_currency",
    value: JSON.stringify({ currency: "KZT" }),
    description: "Default currency for reports",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "risk_thresholds",
    value: JSON.stringify({ low: 25, medium: 50, high: 75 }),
    description: "Risk score category thresholds",
    updatedAt: "24.04.2026 15:54",
  },
  {
    key: "sla_high_hours",
    value: JSON.stringify({ hours: 24 }),
    description: "SLA for high severity alerts",
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
    <>
      <div className="pb-12 space-y-4">
        <Card>
          <div className="grid grid-cols-[1fr_1.5fr_1fr_140px] gap-3 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Ключ</span>
            <span>Значение</span>
            <span>Описание</span>
            <span>Обновлено</span>
          </div>
          {config.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[1fr_1.5fr_1fr_140px] gap-3 border-b border-border/50 px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-mono text-xs text-primary">{row.key}</span>
              <span className="font-mono text-xs text-muted-foreground break-all">{prettifyJson(row.value)}</span>
              <span className="text-muted-foreground text-xs">{row.description}</span>
              <span className="tabular-nums text-xs text-muted-foreground">{row.updatedAt}</span>
            </div>
          ))}
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Добавить / обновить настройку</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <Input
                placeholder="Ключ"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <Input
                placeholder={'Значение (JSON, напр. {"sla_hours": 24})'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <Input
                placeholder="Описание"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <Button onClick={save} disabled={!canSave}>
              Сохранить
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
