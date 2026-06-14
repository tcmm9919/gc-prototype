import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, LineChart } from "lucide-react";
import { StatusBadge } from "@/components/ext/status-badge";
import { ShineBorder } from "@/components/ui/shine-border";

const MODELS = [
  {
    href: "/settings/instructions/bank-offline-fs",
    icon: Database,
    title: "Bank Offline Feature Store",
    category: "Подготовка данных · PostgreSQL + TimescaleDB",
    description:
      "Централизованный пайплайн ежедневной подготовки признаков. Превращает сырые данные DWH в две ML-готовые таблицы — основа всех остальных моделей.",
    stack: ["PostgreSQL", "TimescaleDB", "Kedro", "Airflow"],
    version: "v1.4",
    updatedAt: "29 апр 2026",
  },
  {
    href: "/settings/instructions/tsad",
    icon: LineChart,
    title: "Time Series Anomaly Detection",
    category: "Детекция аномалий · TSAD",
    description:
      "Анализирует исторические клиентские временные ряды и выдаёт признак аномальности — для проактивных оповещений комплаенс-офицеров.",
    stack: ["Python", "Statsmodels", "Prophet"],
    version: "v1.2",
    updatedAt: "24 апр 2026",
  },
  {
    href: "/settings/instructions/ctsm",
    icon: BrainCircuit,
    title: "Compliance Tabular Supervised Model",
    category: "Скоринг фрода · CTSM (Pied Piper)",
    description:
      "Продакшен ML-система выявления подтверждённого мошенничества. CatBoost ежедневно скорит активных клиентов и присваивает балл риска.",
    stack: ["CatBoost", "Python"],
    version: "v2.0",
    updatedAt: "27 апр 2026",
  },
] as const;

export default function Page() {
  return (
    <div className="flex flex-col gap-3 pb-12">
      {MODELS.map((m) => {
        const isBase = m.href === "/settings/instructions/bank-offline-fs";
        return (
        <Link
          key={m.href}
          href={m.href}
          className="group block rounded-2xl border border-transparent dark:border-border bg-card p-5 transition-colors hover:border-primary/40"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <m.icon className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="font-heading text-lg font-semibold leading-snug">{m.title}</h3>
                {isBase && (
                  <span className="relative inline-flex items-center overflow-hidden rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    <ShineBorder borderWidth={1} duration={10} shineColor="var(--color-primary)" />
                    Основа
                  </span>
                )}
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  {m.version} · {m.updatedAt}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.category}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {m.stack.map((s) => (
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
        );
      })}
    </div>
  );
}
