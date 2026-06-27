import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, LineChart, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ext/status-badge";
import { StateSwitch } from "@/components/ext/state-switch";

const BASE = {
  href: "/instructions/bank-offline-fs",
  icon: Database,
  title: "Bank Offline Feature Store",
  category: "Подготовка данных · PostgreSQL + TimescaleDB",
  description:
    "Централизованный пайплайн ежедневной подготовки признаков. Превращает сырые данные DWH в две ML-готовые таблицы — фундамент, на котором работают все остальные модели.",
  stack: ["PostgreSQL", "TimescaleDB", "Airflow", "Jinja2"],
  version: "v1.4",
  updatedAt: "29 апр 2026",
  stats: [
    { value: "2", label: "таблицы" },
    { value: "463", label: "колонки" },
    { value: "8", label: "окон" },
  ],
};

const DERIVED = [
  {
    href: "/instructions/tsad",
    icon: LineChart,
    title: "Time Series Anomaly Detection",
    category: "Детекция аномалий · TSAD",
    description: "Анализирует клиентские временные ряды и выдаёт признак аномальности для проактивных оповещений.",
    stack: ["Kedro", "PELT", "Optuna"],
    version: "v1.2",
    updatedAt: "24 апр 2026",
  },
  {
    href: "/instructions/ctsm",
    icon: BrainCircuit,
    title: "Compliance Tabular Supervised Model",
    category: "Скоринг фрода · CTSM (Pied Piper)",
    description: "CatBoost ежедневно скорит активных клиентов и присваивает балл вероятности мошенничества.",
    stack: ["CatBoost", "Kedro", "Optuna"],
    version: "v2.0",
    updatedAt: "27 апр 2026",
  },
] as const;

export default function Page() {
  return (
    <StateSwitch skeleton="list" emptyTitle="Моделей пока нет">
      <div className="flex flex-col gap-6 pb-12 pt-1">
        {/* Основа — крупная карточка-баннер */}
        <Link
          href={BASE.href}
          className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-card to-card p-6 transition-colors hover:border-primary/45"
        >
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm">
              <BASE.icon className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="font-heading text-xl font-bold leading-snug">{BASE.title}</h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Sparkles className="size-3" />
                  Основа
                </span>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{BASE.version} · {BASE.updatedAt}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{BASE.category}</p>
              <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">{BASE.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                {BASE.stats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="font-heading text-lg font-bold tabular-nums text-foreground">{s.value}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {BASE.stack.map((s) => (
                    <StatusBadge key={s} tone="muted">{s}</StatusBadge>
                  ))}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                  Открыть инструкцию
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Производные */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            На её данных работают
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {DERIVED.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <m.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-heading text-base font-semibold leading-snug">{m.title}</h3>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{m.version}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.category}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1">
                    {m.stack.map((s) => (
                      <StatusBadge key={s} tone="muted">{s}</StatusBadge>
                    ))}
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                    Открыть
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </StateSwitch>
  );
}
