"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ext/page-header";
import { Eyebrow, Mono } from "@/components/ext/mono";

interface Direction {
  id: string;
  letter: string;
  name: string;
  short: string;
  tags: string[];
  href: string;
  description: string;
  fonts: string;
  vibe: string;
  isPick?: boolean;
}

const DIRECTIONS: Direction[] = [
  {
    id: "pro-terminal",
    letter: "A",
    name: "Pro Terminal",
    short: "Linear / Vercel / Sentry",
    tags: ["Dark-first", "Mono accents", "High density"],
    href: "/styleguide/pro-terminal",
    description:
      "Tёмный фон с тонкой dot-grid атмосферой. Geist Sans + JetBrains Mono. Зелёный — лазерный акцент только на active/critical состояниях. Status-dots с pulse-анимацией. Tabular mono для всех ID, времени, денег. Hairline-таблицы без row backgrounds.",
    fonts: "Geist Variable · JetBrains Mono",
    vibe: "Pro tool · compliance officer's natural environment",
  },
  {
    id: "editorial",
    letter: "B",
    name: "Editorial Premium",
    short: "The Economist / Stripe / Bloomberg Magazine",
    tags: ["Serif display", "Cream paper", "Magazine"],
    href: "/styleguide/editorial",
    description:
      "Тёплый кремовый фон. Fraunces (variable serif) для headlines с optical sizing — огромные цифры читаются как обложка финансового ревью. Hairline-разделители, римские нумерации секций (I, II, III), generous whitespace. Зелёный приглушённый, лесной.",
    fonts: "Fraunces Variable · Inter Variable",
    vibe: "Premium editorial · читается как The Economist",
  },
  {
    id: "sovereign",
    letter: "C",
    name: "Sovereign Banking",
    short: "Mercury / Stripe Atlas / Apple Intelligence",
    tags: ["Warm neutrals", "Soft motion", "Ambient glow"],
    href: "/styleguide/sovereign",
    description:
      "Тёплый off-white фон с зелёным ambient-haze градиентом в hero. Plus Jakarta Sans — современный sans без характера 90-х. Мягкие тени, generous rounding (12px+), плавные переходы. Refined neutrals: тёплый серый foreground, не чёрный.",
    fonts: "Plus Jakarta Sans Variable · Inter Variable",
    vibe: "Premium fintech · Mercury vibes",
    isPick: true,
  },
];

export default function Page() {
  return (
    <div className="px-6 pb-24 space-y-8 max-w-6xl">
      <PageHeader
        eyebrow="Design lab"
        title="3 направления редизайна"
        description="Каждая карточка ведёт на полный style tile с типографикой, палитрой, KPI и таблицами в выбранной эстетике. Сравни вживую — потом раскатываем по всему продукту."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {DIRECTIONS.map((d) => (
          <Link key={d.id} href={d.href} className="group block">
            <Card className="relative h-full overflow-hidden hover:border-border-strong transition-all">
              {d.isPick && (
                <span className="absolute right-3 top-3 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                    <span className="status-dot status-dot-pulse text-primary" />
                    Текущий выбор
                  </span>
                </span>
              )}
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Eyebrow tone="subtle">Направление {d.letter}</Eyebrow>
                  <h3 className="font-heading text-2xl font-medium tracking-[-0.02em] leading-tight">
                    {d.name}
                  </h3>
                  <Mono size="xs" tone="muted">{d.short}</Mono>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {d.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.1em] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-hairline">
                  <div className="flex items-center justify-between gap-2">
                    <Eyebrow>Fonts</Eyebrow>
                    <Mono size="xs" tone="muted" className="text-right truncate">{d.fonts}</Mono>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Eyebrow>Vibe</Eyebrow>
                    <span className="text-xs text-muted-foreground text-right truncate">{d.vibe}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-xs text-primary font-mono uppercase tracking-[0.1em] group-hover:gap-2 transition-all">
                  Открыть style tile
                  <ArrowUpRight className="size-3" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="rounded-md border border-hairline bg-surface/40 p-4 space-y-2">
        <Eyebrow>Как сравнивать</Eyebrow>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Все три tile показывают ОДИНАКОВЫЙ контент (типографика → палитра → KPI → таблица → кнопки) в разных
          эстетиках. Если B или C зайдут больше — раскатим в продукт за один присест: те же токены, та же
          архитектура компонентов, только переменные `:root` и шрифты меняются.
        </p>
      </div>
    </div>
  );
}
