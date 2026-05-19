"use client";

import { ArrowUpRight, Bell, ChevronRight, Search, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ext/page-header";
import { RiskBadge } from "@/components/ext/risk-badge";
import { StatusBadge } from "@/components/ext/status-badge";
import { DisplayNumber, Eyebrow, Mono } from "@/components/ext/mono";

export default function Page() {
  return (
    <div className="px-6 pb-24 space-y-12 max-w-6xl">
      <PageHeader
        eyebrow="Design lab · v1"
        title="Pro Terminal — style tile"
        description="Эталон типографики, палитры, состояний. Если этот экран читается как премиум — раскатываем эстетику по продукту."
        actions={
          <Button>
            <Sparkles className="size-3.5" />
            Применить ко всему
          </Button>
        }
      />

      {/* ──────── 1. TYPOGRAPHY ──────── */}
      <Section eyebrow="01 · Typography" title="Шрифты и масштаб">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <Eyebrow>Display · Geist</Eyebrow>
              <p className="font-heading text-5xl font-medium tracking-[-0.03em] leading-[1]">
                Freedom AI Compliance
              </p>
              <p className="font-heading text-3xl font-medium tracking-[-0.025em] leading-[1.1]">
                Карточка клиента
              </p>
            </div>
            <Divider />
            <div className="space-y-1">
              <Eyebrow>Sans Body · Geist</Eyebrow>
              <p className="text-base leading-relaxed text-foreground">
                Compliance Officer AI получает каждое новое оповещение сразу после обработки транзакции и
                анализирует контекст: правило, транзакцию и клиента.
              </p>
              <p className="text-sm text-muted-foreground">
                Muted-foreground для второстепенного. Размер sm, leading-relaxed.
              </p>
            </div>
            <Divider />
            <div className="space-y-1">
              <Eyebrow>Mono · JetBrains Mono</Eyebrow>
              <p className="font-mono text-sm tabular-nums">
                CASE-20260506-7F6A3D24 · 1 500 000,00 KZT · 16:49
              </p>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                701b2188-bb67-4ce6-9240-34a10cb37aa8
              </p>
              <DisplayNumber size="3xl" tone="primary">
                $11.80
              </DisplayNumber>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ──────── 2. PALETTE ──────── */}
      <Section eyebrow="02 · Palette" title="Цвета и поверхности">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Swatch name="background" var="--background" />
          <Swatch name="surface" var="--surface" />
          <Swatch name="surface-elevated" var="--surface-elevated" />
          <Swatch name="sidebar" var="--sidebar" />
          <Swatch name="primary" var="--primary" accent />
          <Swatch name="risk-low" var="--risk-low" />
          <Swatch name="risk-medium" var="--risk-medium" />
          <Swatch name="risk-high" var="--risk-high" />
          <Swatch name="risk-critical" var="--risk-critical" />
          <Swatch name="border" var="--border" />
          <Swatch name="muted" var="--muted" />
          <Swatch name="foreground" var="--foreground" />
        </div>
      </Section>

      {/* ──────── 3. STATUS & RISK ──────── */}
      <Section eyebrow="03 · States" title="Бейджи и риск-индикаторы">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Eyebrow>Risk level</Eyebrow>
              <div className="flex flex-wrap gap-2">
                <RiskBadge level="low" />
                <RiskBadge level="medium" />
                <RiskBadge level="high" />
                <RiskBadge level="critical" />
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <Eyebrow>Status tones</Eyebrow>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Завершена</StatusBadge>
                <StatusBadge tone="info">Открыто</StatusBadge>
                <StatusBadge tone="warning">На проверке</StatusBadge>
                <StatusBadge tone="danger">Отклонено</StatusBadge>
                <StatusBadge tone="muted">Закрыто</StatusBadge>
                <StatusBadge tone="neutral">Обзор</StatusBadge>
              </div>
            </div>
            <Divider />
            <div className="space-y-2">
              <Eyebrow>Inline indicators</Eyebrow>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="status-dot status-dot-pulse text-primary" />
                  Compliance Officer AI · активен
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="status-dot text-risk-medium" />
                  Workflow run
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="status-dot text-risk-critical" />
                  Critical alert
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ──────── 4. KPI HERO ──────── */}
      <Section eyebrow="04 · Data display" title="KPI и большие числа">
        <div className="grid gap-3 md:grid-cols-4">
          <KpiCard label="Open alerts" value={39} delta="+12" tone="primary" pulse />
          <KpiCard label="Active cases" value={2} delta="−1" />
          <KpiCard label="Critical" value={15} delta="+3" tone="critical" />
          <KpiCard label="Cost · 30d" value="$11.80" />
        </div>
      </Section>

      {/* ──────── 5. TABLE ROW ──────── */}
      <Section eyebrow="05 · Tables" title="Хейрлайн-таблица">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_120px_100px_80px] gap-3 border-b border-hairline px-4 py-2.5">
            <Eyebrow>Дата</Eyebrow>
            <Eyebrow>ID · Клиент</Eyebrow>
            <Eyebrow>Сумма</Eyebrow>
            <Eyebrow>Риск</Eyebrow>
            <Eyebrow>Статус</Eyebrow>
          </div>
          {ROW_SAMPLES.map((row, i) => (
            <div
              key={i}
              className="term-row grid grid-cols-[120px_1fr_120px_100px_80px] gap-3 border-b border-hairline px-4 py-3 hover:bg-surface-elevated last:border-b-0"
            >
              <Mono size="sm" tone="muted">{row.date}</Mono>
              <div className="flex flex-col leading-tight">
                <Mono size="xs" tone="subtle">{row.id}</Mono>
                <span className="text-sm">{row.client}</span>
              </div>
              <Mono size="sm">{row.amount}</Mono>
              <RiskBadge level={row.risk} />
              <StatusBadge tone={row.statusTone}>{row.status}</StatusBadge>
            </div>
          ))}
        </Card>
      </Section>

      {/* ──────── 6. BUTTONS ──────── */}
      <Section eyebrow="06 · Actions" title="Кнопки и инпуты">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button>
                <Sparkles className="size-3.5" />
                Primary action
              </Button>
              <Button variant="outline">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button size="sm" variant="outline">
                <ChevronRight className="size-3.5" />
                Small
              </Button>
            </div>
            <Divider />
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-subtle-foreground" />
                <Input placeholder="Поиск по клиентам..." className="w-72 pl-8 font-mono text-xs" />
              </div>
              <div className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-1">
                <Mono size="xs" tone="muted">⌘</Mono>
                <Mono size="xs" tone="muted">K</Mono>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-mono uppercase tracking-[0.12em] text-primary hover:bg-primary/15 glow-primary-soft">
                Запустить
                <ArrowUpRight className="size-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ──────── 7. ATMOSPHERE ──────── */}
      <Section eyebrow="07 · Atmosphere" title="Фон и текстуры">
        <div className="grid gap-3 md:grid-cols-3">
          <AtmosphereCard label="bg-dot-grid" className="bg-dot-grid" />
          <AtmosphereCard label="bg-dot-grid-fine" className="bg-dot-grid-fine" />
          <AtmosphereCard label="glow-primary-soft" className="glow-primary-soft border-primary/30" />
        </div>
      </Section>

      {/* ──────── 8. NOTIFICATIONS / ALERTS ──────── */}
      <Section eyebrow="08 · Signals" title="Уведомления и acks">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 flex items-start gap-3">
              <Bell className="size-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  Compliance Officer AI закрыл кейс <Mono size="sm">CASE-20260506-7F6A3D24</Mono>
                </p>
                <p className="text-xs text-muted-foreground">Перепроверка правил · всё чисто · 16:52</p>
              </div>
            </div>
            <div className="rounded-md border border-risk-medium/30 bg-risk-medium/5 p-3 flex items-start gap-3">
              <Bell className="size-4 text-risk-medium mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  Сценарий завершён со статусом <Mono tone="muted">FAILED</Mono>
                </p>
                <p className="text-xs text-muted-foreground">Требуется ручная проверка · CASE-20260506-D88E7899</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}

const ROW_SAMPLES = [
  {
    date: "06.05.26",
    id: "701b2188",
    client: "Дягилев Михаил Владимирович",
    amount: "1 500 000,00 KZT",
    risk: "medium",
    status: "Завершена",
    statusTone: "success",
  },
  {
    date: "06.05.26",
    id: "aa9e679f",
    client: "Дягилев Михаил Владимирович",
    amount: "200 000,00 KZT",
    risk: "low",
    status: "Завершена",
    statusTone: "success",
  },
  {
    date: "11.04.26",
    id: "7694a2d1",
    client: "Третьякова Алена Алексеевна",
    amount: "121 849,00 KZT",
    risk: "low",
    status: "Открыто",
    statusTone: "info",
  },
  {
    date: "10.04.26",
    id: "bc92b017",
    client: "Третьякова Алена Алексеевна",
    amount: "3 832,00 $",
    risk: "high",
    status: "На проверке",
    statusTone: "warning",
  },
] as const;

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-heading text-xl font-medium tracking-[-0.02em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, var: cssVar, accent }: { name: string; var: string; accent?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div
        className={`h-20 rounded-md border border-border ${accent ? "glow-primary-soft" : ""}`}
        style={{ background: `var(${cssVar})` }}
      />
      <div className="space-y-0.5">
        <Mono size="xs">{name}</Mono>
        <Mono size="xs" tone="subtle">{cssVar}</Mono>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-hairline" aria-hidden />;
}

function KpiCard({
  label,
  value,
  delta,
  tone = "default",
  pulse,
}: {
  label: string;
  value: string | number;
  delta?: string;
  tone?: "default" | "primary" | "critical";
  pulse?: boolean;
}) {
  const dotClass = tone === "primary" ? "text-primary" : tone === "critical" ? "text-risk-critical" : "text-muted-foreground";
  return (
    <div className="relative rounded-md border border-border bg-surface p-4 space-y-3 group overflow-hidden">
      {tone === "primary" ? (
        <span className="absolute left-0 top-0 bottom-0 w-px bg-primary" />
      ) : null}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-subtle-foreground">
          <span className={`status-dot ${pulse ? "status-dot-pulse" : ""} ${dotClass}`} />
          {label}
        </span>
        {delta ? <Mono size="xs" tone={delta.startsWith("+") ? "primary" : "muted"}>{delta}</Mono> : null}
      </div>
      <DisplayNumber size="xl" tone={tone === "primary" ? "primary" : "default"}>
        {value}
      </DisplayNumber>
    </div>
  );
}

function AtmosphereCard({ label, className }: { label: string; className?: string }) {
  return (
    <div className={`h-32 rounded-md border border-border bg-surface flex items-end p-3 ${className ?? ""}`}>
      <Mono size="xs" tone="muted">{label}</Mono>
    </div>
  );
}
