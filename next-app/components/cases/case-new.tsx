"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Link2, X } from "lucide-react";

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
import { useMockData } from "@/lib/mock";
import { StatusBadge } from "@/components/ext/status-badge";
import { RiskBadge } from "@/components/ext/risk-badge";

const CASE_TYPES = [
  "AML — отмывание",
  "KYC — верификация",
  "Санкционный риск",
  "Подозрительная активность",
  "PEP-проверка",
];

const SEVERITY_TONE = {
  low: "info",
  medium: "warning",
  high: "warning",
  critical: "danger",
} as const;

const SEVERITY_LABEL = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
  critical: "Критическая",
} as const;

function suggestTypeFromRule(ruleName?: string): string {
  if (!ruleName) return CASE_TYPES[0];
  const r = ruleName.toLowerCase();
  if (r.includes("санкц") || r.includes("ofac")) return "Санкционный риск";
  if (r.includes("pep")) return "PEP-проверка";
  if (r.includes("kyc") || r.includes("verification")) return "KYC — верификация";
  if (r.includes("severance") || r.includes("velocity") || r.includes("structur")) return "AML — отмывание";
  return "Подозрительная активность";
}

function suggestPriorityFromSeverity(severity?: string): string {
  return severity === "critical" || severity === "high" ? severity : severity === "medium" ? "medium" : "low";
}

export function CaseNew() {
  const data = useMockData();
  const params = useSearchParams();
  const fromAlertId = params?.get("fromAlert");
  const fromClient = params?.get("client");
  const sourceAlert = fromAlertId ? data.alerts.find((a) => a.id === fromAlertId) : undefined;

  const initialClient = fromClient ?? sourceAlert?.clientId ?? "";
  const initialType = suggestTypeFromRule(sourceAlert?.ruleName);
  const initialPriority = suggestPriorityFromSeverity(sourceAlert?.severity);

  const [clientId, setClientId] = React.useState(initialClient);
  const [type, setType] = React.useState(initialType);
  const [priority, setPriority] = React.useState(initialPriority);
  const [description, setDescription] = React.useState(
    sourceAlert
      ? `Кейс создан на основе оповещения ${sourceAlert.id} («${sourceAlert.ruleName}»). Требуется детальный анализ цепочки операций и принятие решения по эскалации.`
      : "",
  );
  const [sla, setSla] = React.useState("3");
  const [linkedAlert, setLinkedAlert] = React.useState(sourceAlert?.id ?? "");

  const linkedClient = data.clients.find((c) => c.id === clientId);

  return (
    <div className="grid gap-4 py-6 lg:grid-cols-3">
      {sourceAlert ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="lg:col-span-3"
        >
          <Card className="border-primary/40 bg-primary/[0.04]">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="size-9 shrink-0 rounded-md bg-primary/15 text-primary flex items-center justify-center">
                <Link2 className="size-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">Кейс создаётся из оповещения</span>
                  <StatusBadge tone={SEVERITY_TONE[sourceAlert.severity]}>
                    {SEVERITY_LABEL[sourceAlert.severity]}
                  </StatusBadge>
                  <Link href={`/alerts/${sourceAlert.id}`} className="font-mono text-xs text-primary hover:underline">
                    {sourceAlert.id}
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Правило <span className="font-medium text-foreground">{sourceAlert.ruleName}</span> · клиент, тип и приоритет предзаполнены — проверьте и при необходимости поправьте.
                </p>
              </div>
              <Button asChild variant="ghost" size="icon" aria-label="Отвязать">
                <Link href="/cases/new">
                  <X className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Параметры кейса</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label>Тип кейса</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CASE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Архитектура поддерживает расширение типов (стикер 3).</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Клиент</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите клиента..." />
              </SelectTrigger>
              <SelectContent>
                {data.clients.slice(0, 50).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {linkedClient ? (
              <div className="flex items-center gap-1.5 pt-0.5">
                <RiskBadge level={linkedClient.riskLevel} />
                <span className="text-xs text-muted-foreground">{linkedClient.segment}</span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Приоритет</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="critical">Критический</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla">SLA, дней</Label>
            <Input id="sla" type="number" value={sla} onChange={(e) => setSla(e.target.value)} min={1} max={30} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linked">Привязанное оповещение</Label>
            <Input
              id="linked"
              value={linkedAlert}
              onChange={(e) => setLinkedAlert(e.target.value)}
              placeholder="AL-…"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="desc">Описание контекста</Label>
            <Textarea
              id="desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите причину открытия кейса и предполагаемый сценарий..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Подсказки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Выберите клиента → к кейсу автоматически привяжется его история оповещений.</p>
          <p>• Тип кейса определяет рабочий workflow и обязательные поля.</p>
          <p>• SLA по умолчанию: 3 дня для среднего приоритета.</p>
          {sourceAlert ? (
            <p className="rounded-md border border-primary/30 bg-primary/[0.05] px-3 py-2 text-foreground">
              <Bell className="mr-1 inline size-3.5 text-primary" />
              Поля предзаполнены данными оповещения {sourceAlert.id}.
            </p>
          ) : null}
          <p className="text-xs">См. context.md §3.3 + стикер 3.</p>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/cases">Отмена</Link>
        </Button>
        <Button size="lg">Создать кейс</Button>
      </div>
    </div>
  );
}
