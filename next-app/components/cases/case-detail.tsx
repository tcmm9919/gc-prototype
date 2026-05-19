"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ext/status-badge";

const STATUS_LABEL = {
  open: "Открыто",
  in_progress: "В работе",
  in_review: "На проверке",
  escalated: "Эскалировано",
  resolved: "Решено",
  closed: "Закрыто",
} as const;

const STATUS_TONE = {
  open: "info",
  in_progress: "warning",
  in_review: "info",
  escalated: "danger",
  resolved: "success",
  closed: "muted",
} as const;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function CaseDetail({ id }: { id: string }) {
  const data = useMockData();
  const cs = data.cases.find((c) => c.id === id) ?? data.cases[0];
  if (!cs) return null;

  const client = data.clients.find((c) => c.id === cs.clientId);
  const linkedAlerts = data.alerts.filter((a) => cs.linkedAlertIds.includes(a.id));
  const responsibleDisplay =
    cs.responsibleId === "USR-AI"
      ? "Compliance Officer AI"
      : data.users.find((u) => u.id === cs.responsibleId)?.fullName ?? "—";

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/cases"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="size-4" />
        Кейсы
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tabular-nums">{cs.id}</h1>
            <StatusBadge tone={STATUS_TONE[cs.status]}>{STATUS_LABEL[cs.status]}</StatusBadge>
            <span className="text-sm text-muted-foreground">{cs.type}</span>
          </div>
          {cs.description ? (
            <p className="text-sm text-muted-foreground max-w-4xl">{cs.description}</p>
          ) : null}
        </CardContent>
      </Card>

      {/* Details + Management */}
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Информация о кейсе</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Детали</h3>
              <Field
                label="Клиент"
                value={
                  client ? (
                    <Link href={`/clients/${client.id}`} className="text-primary hover:underline">
                      {client.fullName}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
              <Field label="Номер кейса" value={cs.id} mono />
              <Field label="Создано" value={formatDateTime(cs.openedAt)} />
              <Field label="Обновлено" value={formatDateTime(cs.openedAt)} />
              <Field label="Комментариев" value={cs.commentCount} />
              <Field label="Доказательств" value={cs.evidenceCount} />
              <Field label="Подзадач" value={cs.subtaskCount} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Управление</h3>
              <Field label="Исполнитель" value={responsibleDisplay} />
              <Field label="Статус" value={STATUS_LABEL[cs.status]} />
              <Field label="SLA" value="—" />
              <div className="pt-2 flex flex-wrap gap-2">
                <Button variant="outline" size="sm">Эскалировать</Button>
                <Button variant="outline" size="sm">Передать офицеру</Button>
                <Button size="sm">Закрыть</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related alerts */}
      {linkedAlerts.length > 0 ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Связанные оповещения <span className="ml-1 text-muted-foreground">{linkedAlerts.length}</span>
              </h3>
              <Button variant="outline" size="sm">
                <RefreshCcw className="size-3.5" />
                Перепроверить правила
              </Button>
            </div>
            <ul className="space-y-2">
              {linkedAlerts.map((a) => (
                <li key={a.id} className="flex items-start justify-between rounded-md border border-border/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge tone="muted">Rule Match</StatusBadge>
                    <StatusBadge tone={a.severity === "high" || a.severity === "critical" ? "danger" : "warning"}>
                      {a.severity}
                    </StatusBadge>
                  </div>
                  <Link href={`/alerts/${a.id}`} className="text-sm text-primary hover:underline">
                    Открыть
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Activity tabs */}
      <div>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Активность</h2>
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="comments">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3">
                  Комментарии
                </TabsTrigger>
                <TabsTrigger value="evidence" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3">
                  Доказательства
                </TabsTrigger>
                <TabsTrigger value="subtasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3">
                  Подзадачи
                </TabsTrigger>
                <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3">
                  Хронология
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="p-4 space-y-3">
                <Textarea placeholder="Написать комментарий..." rows={2} />
                <ul className="space-y-3">
                  {cs.autoCase ? (
                    <>
                      <CommentRow author="—" time="08.05.2026 12:47" text="Income proof «Screenshot 2026-05-06 at 11.30.01.png» получено через удалённый процесс верификации." />
                      <CommentRow author="Compliance Officer AI" time="06.05.2026 16:52" text="Правила перепроверены против оригинальных данных — все 1 оповещений больше не срабатывают. Кейс закрыт автоматически." aiAuthor />
                      <CommentRow author="—" time="06.05.2026 16:52" text="Заявленный месячный доход извлечён из документа: 6 240 000 KZT, confidence ~0.99." />
                      <CommentRow author="—" time="06.05.2026 16:52" text="Income proof «income_anomaly_remediation.pdf» получено через удалённый процесс верификации." />
                      <CommentRow author="Compliance Officer AI" time="06.05.2026 16:49" text="Compliance Officer AI: кейс открыт автоматически по алерту." aiAuthor />
                    </>
                  ) : (
                    <CommentRow author="—" time="—" text="Комментариев пока нет." />
                  )}
                </ul>
              </TabsContent>

              <TabsContent value="evidence" className="p-4 space-y-3">
                {cs.evidenceCount > 0 ? (
                  <ul className="space-y-2">
                    <EvidenceRow name="income_anomaly_remediation.pdf" tag="income_proof" />
                    {cs.evidenceCount > 1 ? <EvidenceRow name="Screenshot 2026-05-06 at 11.30.01.png" tag="screenshot" /> : null}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Доказательств нет.</p>
                )}
              </TabsContent>

              <TabsContent value="subtasks" className="p-4 space-y-3">
                {cs.subtaskCount > 0 ? (
                  <ul className="space-y-2">
                    {Array.from({ length: cs.subtaskCount }).map((_, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                        <input type="checkbox" className="size-4" />
                        <span>Подзадача {i + 1}: запросить дополнительные документы</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Подзадач нет.</p>
                )}
              </TabsContent>

              <TabsContent value="timeline" className="p-4 space-y-3">
                <ol className="relative space-y-3 pl-5 border-l border-border ml-2">
                  <TimelineRow time="06.05.2026 16:52" event="Кейс закрыт автоматически" by="Compliance Officer AI" />
                  <TimelineRow time="06.05.2026 16:52" event="Повторная проверка правил — всё чисто" by="Compliance Officer AI" />
                  <TimelineRow time="06.05.2026 16:50" event="Документ получен" by="клиент" />
                  <TimelineRow time="06.05.2026 16:49" event="Запущен сценарий Income Proof Remediation" by="Compliance Officer AI" />
                  <TimelineRow time="06.05.2026 16:49" event="Кейс открыт автоматически" by="Compliance Officer AI" />
                </ol>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="text-xs text-muted-foreground pt-0.5">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}

function CommentRow({ author, time, text, aiAuthor }: { author: string; time: string; text: string; aiAuthor?: boolean }) {
  return (
    <li className="rounded-md border border-border/60 px-3 py-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={aiAuthor ? "font-medium text-primary" : "font-medium text-foreground"}>{author}</span>
        <span className="text-muted-foreground tabular-nums">{time}</span>
      </div>
      <p className="text-sm">{text}</p>
    </li>
  );
}

function EvidenceRow({ name, tag }: { name: string; tag: string }) {
  return (
    <li className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
      <span className="text-sm font-mono">{name}</span>
      <StatusBadge tone="muted">{tag}</StatusBadge>
    </li>
  );
}

function TimelineRow({ time, event, by }: { time: string; event: string; by: string }) {
  return (
    <li className="relative">
      <span className="absolute -left-[19px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
      <div className="text-sm">{event}</div>
      <div className="text-xs text-muted-foreground tabular-nums">{time} · {by}</div>
    </li>
  );
}
