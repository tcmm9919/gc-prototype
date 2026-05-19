"use client";

import * as React from "react";
import { FileText, Play, Send, Sparkles, Upload } from "lucide-react";
import type { Client, ClientFlags } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ext/status-badge";

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

const FAVORITE_SCENARIOS = [
  { id: "block", name: "Блокировка клиента" },
  { id: "doc-report", name: "Отчет по документации от клиента" },
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

function formatFlagValue(value: boolean | "—" | "Нет" | undefined): string {
  if (value === undefined || value === "—") return "—";
  if (value === "Нет" || value === false) return "Нет";
  return "Да";
}

export function ClientOverview({ client }: { client: Client }) {
  const [aiPrompt, setAiPrompt] = React.useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Notification channel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-5 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Профиль</p>
            <h2 className="text-xl font-semibold">{client.fullName}</h2>
            {client.latinName ? <p className="text-sm text-muted-foreground">{client.latinName}</p> : null}
            <p className="text-sm text-muted-foreground">
              {client.email ?? "—"} · ИИН: {client.iin ?? client.bin ?? "—"} · {client.type === "legal" ? "Юр. лицо" : "Физ. лицо"}
              {client.birthDate ? ` · Дата рождения: ${client.birthDate}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Канал уведомлений</p>
            <p className="text-xs text-muted-foreground">Способ оповещения клиента о запросах и решениях комплаенса</p>
            <div className="space-y-1.5 pt-1">
              <ChannelCheckbox label="Отправка на Email" defaultChecked />
              <ChannelCheckbox label="SMS-сообщение" />
              <ChannelCheckbox label="Push-уведомление на Freedom SuperApp" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details + flags */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Подробности</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Field label="Версия карточки клиента" value={client.cardVersion ?? "—"} />
              <Field label="Колвир-код" value={client.kolvirCode ?? "—"} />
              <Field label="Имя" value={client.firstName ?? client.fullName.split(" ")[1] ?? "—"} />
              <Field label="Фамилия" value={client.lastName ?? client.fullName.split(" ")[0] ?? "—"} />
              <Field label="Отчество" value={client.middleName ?? "—"} />
              <Field label="Дата регистрации" value={client.registrationDate ?? "—"} />
              <Field label="Срок обслуживания (дн.)" value={client.serviceDays ?? "—"} />
              <Field label="Страна резидентства" value={client.countryFullName ?? client.country} />
              <Field label="Место рождения" value={client.birthplace ?? "—"} />
              <Field label="Филиал открытия счёта" value={client.accountBranch ?? "—"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Флаги</h3>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(FLAG_LABELS) as Array<keyof ClientFlags>).map((key) => (
                <StatusBadge key={key} tone="muted" className="text-[10px]">
                  {FLAG_LABELS[key]}: {formatFlagValue(client.flags?.[key])}
                </StatusBadge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI generation */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">AI-генерация сценариев</h3>
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              AI-генерация сценариев
            </p>
            <p className="text-xs text-muted-foreground">Напишите запрос на естественном языке...</p>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Проверить по санкционным спискам, запустить adverse media, создать алерт..."
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Shift+Enter — новая строка</span>
              <Button size="sm" disabled={!aiPrompt.trim()}>
                <Send className="size-3.5" />
                Запустить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorite scenarios + run history */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Операции</h3>
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="text-sm font-semibold inline-flex items-center gap-1.5">
                <Play className="size-3.5 text-primary" />
                Избранные сценарии
              </h4>
              <ul className="space-y-1.5">
                {FAVORITE_SCENARIOS.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 hover:bg-muted/40 transition">
                    <span className="text-sm">{s.name}</span>
                    <button className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition" aria-label="Запустить">
                      <Play className="size-3" fill="currentColor" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <h4 className="text-sm font-semibold inline-flex items-center gap-1.5">
                История запусков <span className="text-muted-foreground">23</span>
              </h4>
              <p className="text-xs text-muted-foreground">Свернуто. Кликните для развёртывания.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documents preview */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Документы</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold inline-flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Документы клиента
              </h4>
              <Button size="sm">
                <Upload className="size-3.5" />
                Загрузить
              </Button>
            </div>
            <div className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-4">
              {DOCUMENTS.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-xs">
                  <span className="font-mono text-primary truncate">{d.name}</span>
                  <StatusBadge tone="muted">{d.tag}</StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function ChannelCheckbox({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = React.useState(defaultChecked ?? false);
  return (
    <label className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm cursor-pointer transition ${checked ? "border-primary bg-primary/5" : "border-border/60"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="size-3.5" />
      {label}
    </label>
  );
}
