"use client";

import { ExternalLink, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";

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
  {
    title: "Как рождаются новые пути в финтехе",
    tonality: "POSITIVE",
    source: "Bluescreen.kz",
    date: "2025-06-26",
    summary: "Статья освещает вклад в цифровую трансформацию банковской сферы Казахстана, включая запуск цифровой ипотеки и AI Compliance.",
  },
  {
    title: "Три дня с основательницей стартапа — Кремниевая долина",
    tonality: "POSITIVE",
    source: "Tatler Asia",
    date: "2025-11-27",
    summary: "Рассказ о поездке на конференцию TechCrunch в Кремниевую долину, где представлен благотворительный стартап на базе ИИ.",
  },
  {
    title: "Благотворительный стартап из Казахстана вызвал интерес у инвесторов США",
    tonality: "POSITIVE",
    source: "Forbes.kz",
    date: "2025-11-08",
    summary: "Проект привлёк внимание инвесторов на международной площадке за счёт прозрачной и автоматизированной системы помощи детям.",
  },
  {
    title: "Между цифрой и сердцем: путь в IT и благотворительности",
    tonality: "POSITIVE",
    source: "Manshuq.com",
    date: "2025-08-20",
    summary: "Интервью о карьерном пути от IT-специалиста до основателя холдинга и фонда, сочетающего технологии и социальную миссию.",
  },
];

const TONE_STYLES: Record<NewsItem["tonality"], string> = {
  POSITIVE: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  NEGATIVE: "bg-risk-critical/15 text-risk-critical border-risk-critical/30",
  NEUTRAL: "bg-muted text-muted-foreground border-border",
};

export function ClientNews() {
  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Новостные источники</h3>
              <p className="text-xs text-muted-foreground">
                Анализ открытых источников от monitoring_agent · обновлено 05.05.2026 18:45
              </p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCcw className="size-3.5" />
              Обновить
            </Button>
          </div>
          <p className="text-sm">
            По результатам анализа открытых источников не выявлено критической негативной информации.
            Клиент представлен как успешный профессионал в сфере финтеха.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ключевые выводы</h3>
          <ul className="space-y-1.5 text-sm">
            {KEY_FINDINGS.map((finding, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">·</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Новости ({NEWS.length})</h3>
        <div className="space-y-2">
          {NEWS.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-medium leading-snug">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <StatusBadge tone="muted" className={TONE_STYLES[item.tonality]}>
                        {item.tonality}
                      </StatusBadge>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
