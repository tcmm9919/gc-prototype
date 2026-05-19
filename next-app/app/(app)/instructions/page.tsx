import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, LineChart } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ext/status-badge";

const MODELS = [
  {
    href: "/instructions/bank-offline-fs",
    icon: Database,
    title: "Bank Offline Feature Store",
    category: "Подготовка данных · PostgreSQL + TimescaleDB",
    description:
      "Централизованный пайплайн ежедневной подготовки признаков. Превращает сырые данные DWH в две ML-готовые таблицы — основа всех остальных моделей.",
    tagline: "Готовая витрина признаков для всех ML-моделей платформы",
    stack: ["PostgreSQL", "TimescaleDB", "Kedro", "Airflow"],
    version: "v1.4",
    updatedAt: "29 апр 2026",
  },
  {
    href: "/instructions/tsad",
    icon: LineChart,
    title: "Time Series Anomaly Detection",
    category: "Детекция аномалий · TSAD",
    description:
      "Анализирует исторические клиентские временные ряды и выдаёт признак аномальности — для проактивных оповещений комплаенс-офицеров.",
    tagline: "Раннее обнаружение нетипичного поведения клиентов",
    stack: ["Python", "Statsmodels", "Prophet"],
    version: "v1.2",
    updatedAt: "24 апр 2026",
  },
  {
    href: "/instructions/ctsm",
    icon: BrainCircuit,
    title: "Compliance Tabular Supervised Model",
    category: "Скоринг фрода · CTSM (Pied Piper)",
    description:
      "Продакшен ML-система выявления подтверждённого мошенничества. CatBoost ежедневно скорит активных клиентов и присваивает балл риска.",
    tagline: "Предсказание сложных мошеннических схем по подтверждённым кейсам",
    stack: ["CatBoost", "Python"],
    version: "v2.0",
    updatedAt: "27 апр 2026",
  },
] as const;

export default function Page() {
  return (
    <>
      <PageHeader
        title="ML Модели и их описание"
        description="Сначала настраивается офлайн-витрина признаков Bank Offline Feature Store — она готовит данные. После этого открывается доступ к моделям TSAD и CTSM."
        eyebrow="СТАРТ РАБОТЫ · КАТАЛОГ МОДУЛЕЙ"
      />
      <div className="grid gap-3 p-6 md:grid-cols-2 lg:grid-cols-3">
        {MODELS.map((m) => (
          <Link key={m.href} href={m.href}>
            <Card className="h-full transition hover:bg-muted/30">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <m.icon className="size-5" />
                  </div>
                  <div className="flex flex-col items-end text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {m.version}
                    </span>
                    <span>{m.updatedAt}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-semibold leading-snug">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">{m.category}</p>
                </div>
                <p className="text-sm text-muted-foreground">{m.description}</p>
                <p className="text-sm text-primary">↗ {m.tagline}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {m.stack.map((s) => (
                    <StatusBadge key={s} tone="muted">{s}</StatusBadge>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium pt-1">
                  Открыть инструкцию
                  <ArrowRight className="size-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
