"use client";

import * as React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ext/status-badge";

const PRINCIPLE_STEPS = [
  "Получает каждое новое оповещение сразу после обработки транзакции.",
  "Анализирует контекст: правило, транзакцию и клиента — и определяет подходящий сценарий действий.",
  "При решении запустить сценарий — создаёт кейс, привязывает оповещение и отправляет клиенту письмо со ссылкой.",
  "Ожидает завершения сценария клиентом (до 7 дней) и повторно проверяет правила по обновлённым данным.",
  "Если правило больше не срабатывает — кейс закрывается автоматически. Иначе менеджер получает письмо с подробностями.",
  "При решении «эскалация» или «пропустить» — отправляет менеджеру письмо или фиксирует решение в журнале.",
];

interface ActivityRow {
  time: string;
  action: string;
  status: "ok" | "error";
  details: string;
  link?: { href: string; label: string };
}

const ACTIVITY: ActivityRow[] = [
  {
    time: "13.05.2026 16:32",
    action: "Отправлено письмо менеджеру",
    status: "ok",
    details: "[Compliance AI] CASE-20260506-D88E7899 — требуется ручная проверка",
    link: { href: "/cases", label: "кейс" },
  },
  { time: "13.05.2026 16:32", action: "Сценарий завершён", status: "error", details: "FAILED", link: { href: "/cases", label: "кейс" } },
  {
    time: "13.05.2026 16:12",
    action: "Отправлено письмо менеджеру",
    status: "ok",
    details: "[Compliance AI] CASE-20260506-A26F030E — требуется ручная проверка",
    link: { href: "/cases", label: "кейс" },
  },
  { time: "13.05.2026 16:12", action: "Сценарий завершён", status: "error", details: "FAILED", link: { href: "/cases", label: "кейс" } },
  {
    time: "06.05.2026 16:52",
    action: "Отправлено письмо менеджеру",
    status: "ok",
    details: "[Compliance AI] CASE-20260506-7F6A3D24 — закрыто автоматически",
    link: { href: "/cases", label: "кейс" },
  },
  { time: "06.05.2026 16:52", action: "Повторная проверка правил", status: "ok", details: "всё чисто", link: { href: "/cases", label: "кейс" } },
  { time: "06.05.2026 16:52", action: "Сценарий завершён", status: "ok", details: "COMPLETED", link: { href: "/cases", label: "кейс" } },
  { time: "06.05.2026 16:49", action: "Запущен сценарий для клиента", status: "ok", details: "Income Proof Remediation", link: { href: "/cases", label: "кейс" } },
  { time: "06.05.2026 16:49", action: "Создан кейс", status: "ok", details: "CASE-20260506-7F6A3D24", link: { href: "/cases", label: "кейс" } },
  {
    time: "06.05.2026 16:49",
    action: "Решение LLM",
    status: "ok",
    details: "dispatch_workflow — Сработало правило аномальной транзакции (1 500 000 KZT превышает baseline в 3 раза). Воркфлоу 'Income Proof Remediation'.",
    link: { href: "/alerts", label: "алерт" },
  },
];

export default function Page() {
  const [enabled, setEnabled] = React.useState(true);
  const [email, setEmail] = React.useState("tenizbaia@freedombank.kz");
  const [dispatch, setDispatch] = React.useState(true);
  const [clearAuto, setClearAuto] = React.useState(true);
  const [stillTriggers, setStillTriggers] = React.useState(true);
  const [escalate, setEscalate] = React.useState(true);

  return (
    <div className="p-6 pb-12 space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">⚙</span>
          Комплаенс-агент
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Автоматический LLM-агент: реагирует на новые оповещения, выбирает подходящий сценарий для клиента и присылает менеджеру итог.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <StatusBadge tone={enabled ? "success" : "muted"}>{enabled ? "Активен" : "Выключен"}</StatusBadge>
          <Button size="sm" variant={enabled ? "destructive" : "default"} onClick={() => setEnabled((v) => !v)}>
            {enabled ? "Выключить" : "Включить"}
          </Button>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <AlertTriangle className="size-4 text-primary" />
            Принцип работы
          </h3>
          <ol className="space-y-1 text-sm list-decimal pl-5">
            {PRINCIPLE_STEPS.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground pt-2">
            Инструкция модели управляется в Yandex AI console; источник в репозитории —{" "}
            <code className="font-mono">api/agent_instructions/compliance_officer_instruction.txt</code>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">Настройки</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email менеджера для отчётов</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            <p className="text-xs text-muted-foreground">
              Куда отправлять письма с решениями и итогами. Если пусто — агент работает молча, только пишет в журнал.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Когда отправлять письма</p>
            <div className="grid gap-2 md:grid-cols-2">
              <Checkbox label="При запуске сценария клиенту" checked={dispatch} onChange={setDispatch} />
              <Checkbox label="Когда кейс закрыт автоматически" checked={clearAuto} onChange={setClearAuto} />
              <Checkbox
                label="Когда правило всё ещё срабатывает / клиент не ответил"
                checked={stillTriggers}
                onChange={setStillTriggers}
              />
              <Checkbox label="Когда агент эскалирует" checked={escalate} onChange={setEscalate} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold">Активность агента</h3>
          <Button variant="outline" size="sm">
            <RefreshCcw className="size-3.5" />
            Обновить
          </Button>
        </div>
        <div className="grid grid-cols-[140px_180px_60px_1fr_80px] gap-3 border-b border-border bg-muted/30 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Время</span>
          <span>Действие</span>
          <span>Статус</span>
          <span>Детали</span>
          <span>Связь</span>
        </div>
        {ACTIVITY.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[140px_180px_60px_1fr_80px] gap-3 border-b border-border/50 px-4 py-2.5 text-sm last:border-b-0"
          >
            <span className="tabular-nums text-xs text-muted-foreground">{row.time}</span>
            <span>{row.action}</span>
            <span>
              <span
                className={`inline-flex rounded px-1.5 py-0.5 text-xs font-mono ${
                  row.status === "ok"
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : "bg-destructive/15 text-destructive border border-destructive/30"
                }`}
              >
                {row.status}
              </span>
            </span>
            <span className="text-xs text-muted-foreground line-clamp-2">{row.details}</span>
            {row.link ? (
              <a href={row.link.href} className="text-xs text-primary hover:underline">
                {row.link.label} ↗
              </a>
            ) : (
              <span />
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded"
      />
      {label}
    </label>
  );
}
