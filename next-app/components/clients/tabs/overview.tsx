"use client";

import * as React from "react";
import {
  Bell,
  Folder,
  ArrowLeftRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Play,
  Send,
  Sparkles,
  Upload,
  User as UserIcon,
  AlertTriangle,
  Lock,
  Crown,
} from "lucide-react";
import type { Client, ClientFlags } from "@/lib/mock";
import { useMockData } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Block } from "@/components/ext/block";
import { AvatarCircle } from "@/components/ext/entity-header";
import { StatusBadge } from "@/components/ext/status-badge";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

const FLAG_LABELS: Record<keyof ClientFlags, string> = {
  VIP: "VIP",
  PEP: "PEP",
  PDL: "PDL",
  EDD: "EDD",
  FATCA_group: "FATCA (гр.)",
  FATCA_individual: "FATCA (нал.)",
  OESR_group: "OESR (гр.)",
  OESR_individual: "OESR (нал.)",
  representative: "Представитель",
  antifraud: "Антифрод",
  limited_account: "Огранич. счёта",
  Blacklist: "Blacklist",
  iPDL: "iPDL",
  nPDL: "nPDL",
};

type FlagTone = "info" | "warning" | "danger" | "muted";

const FLAG_META: Record<
  keyof ClientFlags,
  { icon: React.ComponentType<{ className?: string }>; tone: FlagTone }
> = {
  VIP: { icon: Crown, tone: "info" },
  PEP: { icon: AlertTriangle, tone: "warning" },
  Blacklist: { icon: Lock, tone: "danger" },
  antifraud: { icon: AlertTriangle, tone: "warning" },
  EDD: { icon: ShieldAlert, tone: "info" },
  PDL: { icon: AlertTriangle, tone: "warning" },
  iPDL: { icon: AlertTriangle, tone: "warning" },
  nPDL: { icon: AlertTriangle, tone: "warning" },
  representative: { icon: UserIcon, tone: "muted" },
  limited_account: { icon: Lock, tone: "warning" },
  FATCA_group: { icon: ShieldCheck, tone: "muted" },
  FATCA_individual: { icon: ShieldCheck, tone: "muted" },
  OESR_group: { icon: ShieldCheck, tone: "muted" },
  OESR_individual: { icon: ShieldCheck, tone: "muted" },
};

const FAVORITE_SCENARIOS = [
  { id: "block", name: "Блокировка клиента" },
  { id: "doc-report", name: "Отчёт по документации от клиента" },
  { id: "full-check", name: "Полная проверка клиента 6 шагов" },
  { id: "sanction-mail", name: "Санкционная проверка с отправкой на почту" },
];

const DOCUMENTS = [
  { name: "income_anomaly_remediation.pdf", tag: "income_proof" },
  { name: "edd_report_20260430_064829.html", tag: "edd_report" },
  { name: "edd_report_20260429_093630.html", tag: "edd_report" },
  { name: "edd_report_20260428_072744.html", tag: "edd_report" },
  { name: "income_report_bad_bb25f2c1.pdf", tag: "employment_letter" },
];

function getRiskConfig(score: number) {
  if (score < 25)
    return {
      label: "Низкий риск",
      barClass: "bg-risk-low",
      textClass: "text-risk-low",
    };
  if (score < 50)
    return {
      label: "Средний риск",
      barClass: "bg-risk-medium",
      textClass: "text-risk-medium",
    };
  if (score < 75)
    return {
      label: "Высокий риск",
      barClass: "bg-risk-high",
      textClass: "text-risk-high",
    };
  return {
    label: "Критический риск",
    barClass: "bg-risk-critical",
    textClass: "text-risk-critical",
  };
}

function getAIBrief(client: Client): string {
  const riskWord =
    client.internalScore < 25
      ? "Низкорисковый"
      : client.internalScore < 50
      ? "Среднерисковый"
      : client.internalScore < 75
      ? "Высокорисковый"
      : "Критический";
  const typeWord = client.type === "legal" ? "корпоративный" : "розничный";
  const pepNote = client.pep
    ? "PEP-статус активен — повышенное внимание"
    : "PEP/санкции — не обнаружены";
  const recommendation =
    client.internalScore < 50
      ? "Стандартный мониторинг."
      : "Рекомендован усиленный мониторинг и периодический EDD.";
  return `${riskWord} ${typeWord} клиент. ${pepNote}. ${recommendation}`;
}

function computeSparkline(
  transactions: { date: string; clientId: string }[],
  clientId: string
): number[] {
  const now = Date.now();
  const days = Array(30).fill(0);
  transactions
    .filter((t) => t.clientId === clientId)
    .forEach((t) => {
      const txDate = new Date(t.date).getTime();
      const daysAgo = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 30) {
        days[29 - daysAgo] += 1;
      }
    });
  return days;
}

export function ClientOverview({ client }: { client: Client }) {
  const data = useMockData();
  const [aiPrompt, setAiPrompt] = React.useState("");

  // Counters
  const openAlerts = data.alerts.filter(
    (a) => a.clientId === client.id && a.status !== "closed"
  ).length;
  const openCases = data.cases.filter(
    (c) => c.clientId === client.id && c.status !== "closed"
  ).length;
  const totalTx = data.transactions.filter((t) => t.clientId === client.id).length;
  const isEdd = client.status === "edd";

  // Sparkline
  const sparkline = React.useMemo(
    () => computeSparkline(data.transactions, client.id),
    [data.transactions, client.id]
  );
  const hasActivity = sparkline.some((v) => v > 0);

  // Filled detail fields only
  const allDetailFields: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Версия карточки", value: client.cardVersion },
    { label: "Колвир-код", value: client.kolvirCode },
    { label: "Имя", value: client.firstName },
    { label: "Фамилия", value: client.lastName },
    { label: "Отчество", value: client.middleName },
    { label: "Дата регистрации", value: client.registrationDate },
    { label: "Срок обслуживания (дн.)", value: client.serviceDays },
    {
      label: "Страна резидентства",
      value: client.countryFullName ?? client.country,
    },
    { label: "Место рождения", value: client.birthplace },
    { label: "Филиал открытия счёта", value: client.accountBranch },
  ];
  const filledFields = allDetailFields.filter(
    (f) => f.value !== undefined && f.value !== null && f.value !== ""
  );

  // Only active flags
  const flags = client.flags ?? {};
  const activeFlags = (Object.keys(FLAG_LABELS) as Array<keyof ClientFlags>).filter(
    (key) => flags[key] === true
  );

  const riskCfg = getRiskConfig(client.internalScore);
  const hue = (client.id.charCodeAt(3) * 47) % 360;

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      {/* HERO */}
      <Block>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          {/* Left: identity + counters + sparkline */}
          <div className="flex flex-col gap-5 min-w-0">
            <div className="flex items-center gap-4 min-w-0">
              <AvatarCircle
                initials={initialsFromName(client.fullName)}
                size="lg"
                hue={hue}
              />
              <div className="flex flex-col gap-1 min-w-0">
                <h2 className="font-heading text-[24px] font-bold tracking-[-0.02em] truncate">
                  {client.fullName}
                </h2>
                {client.latinName ? (
                  <span className="text-sm text-muted-foreground truncate">
                    {client.latinName}
                  </span>
                ) : null}
                <span className="text-xs text-muted-foreground truncate">
                  <span className="font-mono">{client.id}</span> ·{" "}
                  {client.type === "legal" ? "Юр. лицо" : "Физ. лицо"}
                  {client.iin || client.bin
                    ? ` · ИИН ${client.iin ?? client.bin}`
                    : ""}
                  {client.email ? ` · ${client.email}` : ""}
                  {client.birthDate ? ` · ${client.birthDate}` : ""}
                </span>
              </div>
            </div>

            {/* Counter chips */}
            <div className="flex flex-wrap gap-2">
              <CounterChip
                icon={Bell}
                value={openAlerts}
                label={openAlerts === 1 ? "открытый алерт" : "открытых алертов"}
                tone={openAlerts > 0 ? "warning" : "muted"}
              />
              <CounterChip
                icon={Folder}
                value={openCases}
                label={openCases === 1 ? "активный кейс" : "активных кейсов"}
                tone={openCases > 0 ? "info" : "muted"}
              />
              <CounterChip
                icon={ArrowLeftRight}
                value={totalTx}
                label={
                  totalTx === 1
                    ? "транзакция"
                    : totalTx < 5
                    ? "транзакции"
                    : "транзакций"
                }
                tone="muted"
              />
              {isEdd ? (
                <CounterChip
                  icon={ShieldAlert}
                  value="EDD"
                  label="процесс"
                  tone="info"
                />
              ) : null}
            </div>

            {/* Sparkline */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Активность за 30 дней
              </span>
              {hasActivity ? (
                <Sparkline data={sparkline} />
              ) : (
                <div className="text-xs text-muted-foreground py-1">
                  Нет транзакционной активности
                </div>
              )}
            </div>
          </div>

          {/* Right: Risk Score */}
          <div className="rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.05] p-5 space-y-3 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Risk Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-[36px] font-bold tabular-nums leading-none">
                {client.internalScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="h-2 rounded-full bg-foreground/[0.08] dark:bg-white/[0.06] overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  riskCfg.barClass
                )}
                style={{ width: `${client.internalScore}%` }}
              />
            </div>
            <span className={cn("text-sm font-semibold", riskCfg.textClass)}>
              {riskCfg.label}
            </span>
          </div>
        </div>
      </Block>

      {/* AI BRIEF */}
      <div className="rounded-2xl bg-primary/[0.05] dark:bg-primary/[0.08] border border-primary/15 px-5 py-4 flex items-start gap-3">
        <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="size-4 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] uppercase tracking-wider text-primary font-semibold">
            Compliance Officer AI
          </span>
          <p className="text-sm text-foreground">{getAIBrief(client)}</p>
        </div>
      </div>

      {/* ACTIVE FLAGS STRIP — only if any */}
      {activeFlags.length > 0 ? (
        <Block dense>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              Активные флаги
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeFlags.map((key) => (
                <FlagBadge key={key} flagKey={key} />
              ))}
            </div>
          </div>
        </Block>
      ) : null}

      {/* MAIN GRID */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-4 min-w-0">
          {filledFields.length > 0 ? (
            <Block title="Подробности">
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                {filledFields.map((f) => (
                  <Field key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
              {filledFields.length < allDetailFields.length ? (
                <p className="text-xs text-muted-foreground pt-3 mt-3 border-t border-foreground/[0.06] dark:border-white/[0.06]">
                  {allDetailFields.length - filledFields.length}{" "}
                  {allDetailFields.length - filledFields.length === 1
                    ? "поле"
                    : "полей"}{" "}
                  не заполнено
                </p>
              ) : null}
            </Block>
          ) : null}

          <Block
            title={
              <span className="inline-flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                Документы клиента
              </span>
            }
            actions={
              <Button size="sm" variant="outline">
                <Upload className="size-3.5" />
                Загрузить
              </Button>
            }
          >
            <div className="grid gap-1.5 md:grid-cols-2">
              {DOCUMENTS.slice(0, 4).map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-3 py-2 text-xs"
                >
                  <span className="font-mono text-primary truncate">{d.name}</span>
                  <StatusBadge tone="muted">{d.tag}</StatusBadge>
                </div>
              ))}
            </div>
            {DOCUMENTS.length > 4 ? (
              <button
                type="button"
                className="text-xs text-primary hover:underline pt-3"
              >
                Все {DOCUMENTS.length} документов →
              </button>
            ) : null}
          </Block>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Block title="Канал уведомлений">
            <p className="text-xs text-muted-foreground -mt-2 mb-3">
              Как клиент получает запросы и решения комплаенса
            </p>
            <div className="space-y-1.5">
              <ChannelCheckbox label="Email" defaultChecked />
              <ChannelCheckbox label="SMS" />
              <ChannelCheckbox label="Push на Freedom SuperApp" />
            </div>
          </Block>

          <Block
            title={
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Быстрые действия
              </span>
            }
          >
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Проверить по санкционным спискам, запустить adverse media..."
              rows={2}
              className="resize-none bg-foreground/[0.03] dark:bg-white/[0.04] border-foreground/[0.06] text-xs"
            />
            <div className="flex items-center justify-between mt-2 mb-3">
              <span className="text-[11px] text-muted-foreground">
                Shift+Enter — новая строка
              </span>
              <Button size="sm" disabled={!aiPrompt.trim()}>
                <Send className="size-3.5" />
                Запустить
              </Button>
            </div>
            <div className="pt-3 border-t border-foreground/[0.06] dark:border-white/[0.06]">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Готовые сценарии
              </p>
              <ul className="space-y-1.5">
                {FAVORITE_SCENARIOS.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-3 py-2 hover:bg-foreground/[0.05] dark:hover:bg-white/[0.05] transition"
                  >
                    <span className="text-xs">{s.name}</span>
                    <button
                      type="button"
                      className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shrink-0"
                      aria-label="Запустить"
                    >
                      <Play className="size-2.5" fill="currentColor" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function CounterChip({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: React.ReactNode;
  label: string;
  tone: "info" | "warning" | "danger" | "muted";
}) {
  const toneClass = {
    info: "bg-primary/15 text-primary",
    warning: "bg-risk-medium/15 text-risk-medium",
    danger: "bg-risk-critical/15 text-risk-critical",
    muted: "bg-foreground/[0.05] dark:bg-white/[0.06] text-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs",
        toneClass
      )}
    >
      <Icon className="size-3.5" />
      <span className="font-semibold tabular-nums">{value}</span>
      {label ? <span className="opacity-80">{label}</span> : null}
    </span>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-sm transition-colors",
            v > 0
              ? "bg-primary/60 hover:bg-primary/80"
              : "bg-foreground/[0.06] dark:bg-white/[0.06]"
          )}
          style={{
            height: v > 0 ? `${(v / max) * 100}%` : "10%",
            minHeight: "3px",
          }}
          title={
            v > 0
              ? `${v} ${v === 1 ? "транзакция" : v < 5 ? "транзакции" : "транзакций"}`
              : "нет операций"
          }
        />
      ))}
    </div>
  );
}

function FlagBadge({ flagKey }: { flagKey: keyof ClientFlags }) {
  const meta = FLAG_META[flagKey];
  const Icon = meta.icon;
  const toneClass = {
    info: "bg-primary/15 text-primary",
    warning: "bg-risk-medium/15 text-risk-medium",
    danger: "bg-risk-critical/15 text-risk-critical",
    muted: "bg-foreground/[0.06] dark:bg-white/[0.06] text-foreground",
  }[meta.tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
        toneClass
      )}
    >
      <Icon className="size-3" />
      {FLAG_LABELS[flagKey]}
    </span>
  );
}

function ChannelCheckbox({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = React.useState(defaultChecked ?? false);
  return (
    <label
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm cursor-pointer transition",
        checked
          ? "bg-primary/10 text-foreground"
          : "bg-foreground/[0.03] dark:bg-white/[0.03] text-muted-foreground hover:bg-foreground/[0.05]"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="size-3.5 accent-primary"
      />
      {label}
    </label>
  );
}
