"use client";

import { ExternalLink, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Block } from "@/components/ext/block";
import { cn } from "@/lib/utils";

interface NewsItem {
  title: string;
  tonality: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  source: string;
  date: string;
  summary: string;
  url?: string;
}

const KEY_FINDINGS = [
  "Признанный эксперт в области цифровой трансформации в Казахстане, советник банка.",
  "Под её руководством разработаны инновационные продукты: цифровая ипотека, цифровой автокредит, AI Compliance.",
  "Основала IT-холдинг и благотворительный фонд, который внедрил цифровую систему адресной помощи.",
  "Участвовала в международных технологических конференциях, включая TechCrunch Disrupt.",
  "Не выявлено упоминаний о правовых, регуляторных или этических нарушениях в официальных источниках.",
];

const NEWS: NewsItem[] = [
  { title: "Как рождаются новые пути в финтехе", tonality: "POSITIVE", source: "Bluescreen.kz", date: "2025-06-26", summary: "Статья освещает вклад в цифровую трансформацию банковской сферы Казахстана, включая запуск цифровой ипотеки и AI Compliance." },
  { title: "Три дня с основательницей стартапа — Кремниевая долина", tonality: "POSITIVE", source: "Tatler Asia", date: "2025-11-27", summary: "Рассказ о поездке на конференцию TechCrunch в Кремниевую долину, где представлен благотворительный стартап на базе ИИ." },
  { title: "Благотворительный стартап из Казахстана вызвал интерес у инвесторов США", tonality: "POSITIVE", source: "Forbes.kz", date: "2025-11-08", summary: "Проект привлёк внимание инвесторов на международной площадке за счёт прозрачной и автоматизированной системы помощи детям." },
  { title: "Между цифрой и сердцем: путь в IT и благотворительности", tonality: "POSITIVE", source: "Manshuq.com", date: "2025-08-20", summary: "Интервью о карьерном пути от IT-специалиста до основателя холдинга и фонда, сочетающего технологии и социальную миссию." },
];

const TONE_STYLES: Record<NewsItem["tonality"], string> = {
  POSITIVE: "bg-risk-low/15 text-risk-low",
  NEGATIVE: "bg-risk-critical/15 text-risk-critical",
  NEUTRAL: "bg-foreground/[0.06] text-foreground",
};

export function ClientNews() {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <Block
        title={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Новостные источники
          </span>
        }
        actions={
          <Button variant="outline" size="sm">
            <RefreshCcw className="size-3.5" />
            Обновить
          </Button>
        }
      >
        <p className="text-xs text-muted-foreground -mt-2 mb-3">
          Анализ открытых источников от monitoring_agent · обновлено 05.05.2026 18:45
        </p>
        <p className="text-sm">
          По результатам анализа открытых источников не выявлено критической негативной информации.
          Клиент представлен как успешный профессионал в сфере финтеха.
        </p>
      </Block>

      <Block title="Ключевые выводы">
        <ul className="space-y-2 text-sm">
          {KEY_FINDINGS.map((finding, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title={`Новости (${NEWS.length})`}>
        <div className="space-y-2">
          {NEWS.map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-4 py-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <h4 className="font-medium leading-snug">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold", TONE_STYLES[item.tonality])}>
                      {item.tonality}
                    </span>
                    <span>{item.source}</span>
                    <span>·</span>
                    <span className="tabular-nums">{item.date}</span>
                  </div>
                </div>
                {item.url ? (
                  <a href={item.url} className="text-muted-foreground hover:text-foreground transition" aria-label="Открыть">
                    <ExternalLink className="size-4" />
                  </a>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{item.summary}</p>
            </div>
          ))}
        </div>
      </Block>
    </div>
  );
}
