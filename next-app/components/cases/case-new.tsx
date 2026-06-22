"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Link2, X } from "lucide-react";
import { toast } from "sonner";

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
import { CreatePageShell } from "@/components/ext/create-page-shell";

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
  const router = useRouter();
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
    <CreatePageShell
      breadcrumbs={[
        { label: "Кейсы", href: "/cases" },
        { label: "Новый кейс" },
      ]}
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Кейс создан");
        router.push("/cases");
      }}
      footer={
        <>
          <Button type="button" variant="outline" asChild>
            <Link href="/cases">Отмена</Link>
          </Button>
          <Button type="submit">Создать кейс</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Источник — оповещение */}
        {sourceAlert ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/[0.04] p-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Link2 className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
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
            <Button type="button" asChild variant="ghost" size="icon" aria-label="Отвязать">
              <Link href="/cases/new">
                <X className="size-4" />
              </Link>
            </Button>
          </motion.div>
        ) : null}

        {/* Основное */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="case-type">
              Тип кейса <span className="text-destructive">*</span>
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="case-type" className="w-full">
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
            <p className="text-xs text-muted-foreground">Тип определяет рабочий workflow и обязательные поля.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="case-client">Клиент</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="case-client" className="w-full">
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
            <Label htmlFor="case-priority">Приоритет</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="case-priority" className="w-full">
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
            <p className="text-xs text-muted-foreground">По умолчанию 3 дня для среднего приоритета.</p>
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc">Описание контекста</Label>
            <Textarea
              id="desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите причину открытия кейса и предполагаемый сценарий..."
            />
          </div>
        </div>
      </div>
    </CreatePageShell>
  );
}
