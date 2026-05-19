"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const STEPS = [
  { id: 1, label: "Метаданные" },
  { id: 2, label: "Условия" },
  { id: 3, label: "Триггеры" },
  { id: 4, label: "Действия" },
];

export function ScenarioEditor() {
  const [step, setStep] = React.useState(1);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                step === s.id ? "bg-background shadow-sm" : "hover:bg-muted/60",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  step > s.id ? "bg-primary text-primary-foreground" : step === s.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="size-3.5" /> : s.id}
              </span>
              <span className={cn(step === s.id ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 ? <ChevronRight className="size-4 text-muted-foreground" /> : null}
          </React.Fragment>
        ))}
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Шаг 1. Метаданные</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="s-name">Название</Label>
              <Input id="s-name" placeholder="Напр. Ночные переводы нерезидентам" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Тип</Label>
              <Select defaultValue="client">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Клиентский</SelectItem>
                  <SelectItem value="group">Групповой</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Версия</Label>
              <Input value="v1" disabled />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="s-desc">Описание</Label>
              <Textarea id="s-desc" rows={3} placeholder="Какое поведение детектирует сценарий и почему это важно..." />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Шаг 2. Условия</CardTitle>
            <p className="text-sm text-muted-foreground">Подключите существующие правила или создайте новые.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Конструктор условий с группами AND/OR — открывается на отдельной странице.</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/rules">Перейти к правилам</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Шаг 3. Триггеры запуска</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="По расписанию" desc="Каждый час, по будням с 8:00 до 20:00" />
            <Row label="On-demand" desc="Запуск через UI и API" defaultOn />
            <Row label="По событию" desc="Новая транзакция клиента из watchlist" defaultOn />
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Шаг 4. Действия при срабатывании</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Создать оповещение" desc="Серьёзность определяется правилом" defaultOn />
            <Row label="Повысить риск клиента" desc="На один уровень от текущего" />
            <Row label="Открыть кейс" desc="Тип кейса: «Подозрительная активность»" />
            <Row label="Запустить ML-модель" desc="TSAD на временной ряд клиента" />
            <Row label="Запустить WARM" desc="Длительная комплексная проверка (стикер 2)" />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
          Назад
        </Button>
        {step < STEPS.length ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}>Далее</Button>
        ) : (
          <Button>Сохранить сценарий</Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2 cursor-pointer">
      <div className="flex flex-col min-w-0">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
      <Switch defaultChecked={defaultOn} />
    </label>
  );
}
