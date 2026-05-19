import Link from "next/link";
import { ArrowRight, Bot, MessageSquare, Shield, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { Card, CardContent } from "@/components/ui/card";

const TILES = [
  {
    href: "/chat",
    icon: MessageSquare,
    title: "Чат",
    eyebrow: "AI-ассистент · Анализ документов",
    description:
      "Чат-интерфейс для работы с AI-ассистентом. Задавайте вопросы по клиентам, анализируйте документы PDF и получайте ответы на основе данных платформы.",
    bullets: [
      "Документы PDF — загрузка и анализ файлов прямо в чате",
      "История диалогов — все разговоры сохраняются и доступны в панели",
      "Контекст платформы — ассистент знает о клиентах, транзакциях и делах",
    ],
    cta: "Открыть чат",
    tone: "bg-primary/10 text-primary",
  },
  {
    href: "/ai/agents",
    icon: Bot,
    title: "Агенты",
    eyebrow: "Paper Agents · Кастомные инструкции",
    description:
      "Создавайте и управляйте пользовательскими AI-агентами с кастомными инструкциями. Агенты используются в сценариях для автоматизации комплаенс-задач.",
    bullets: [
      "Кастомные инструкции — полный контроль над поведением агента",
      "Интеграция со сценариями — агенты подключаются к сценариям автоматизации",
      "Yandex AI — все агенты работают через Yandex Foundation Models",
    ],
    cta: "Управление агентами",
    tone: "bg-risk-medium/15 text-risk-medium",
  },
  {
    href: "/ai/compliance-agent",
    icon: Shield,
    title: "Комплаенс-агент",
    eyebrow: "Авто-агент · Обработка оповещений",
    description:
      "Специализированный AI-агент комплаенс-офицера, который автоматически анализирует оповещения, принимает решения по эскалации и запускает сценарии для клиентов.",
    bullets: [
      "Авто-обработка — агент сам решает что делать с оповещением",
      "Эскалация — создаёт кейсы и отправляет письма менеджерам",
      "История решений — полный лог действий агента по каждому клиенту",
    ],
    cta: "Открыть Комплаенс-агент",
    tone: "bg-risk-high/15 text-risk-high",
  },
];

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="AI-Инструменты · Платформа"
        title="Искусственный интеллект"
        description="Все AI-инструменты платформы в одном месте: чат-ассистент, настраиваемые агенты и автоматизированный Комплаенс-агент для обработки оповещений."
      />
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {TILES.map((t) => (
          <Card key={t.href} className="h-full">
            <CardContent className="p-5 space-y-3 flex flex-col h-full">
              <div className={`size-11 rounded-lg flex items-center justify-center ${t.tone}`}>
                <t.icon className="size-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold">{t.title}</h2>
                <p className="text-xs text-muted-foreground">{t.eyebrow}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <ul className="space-y-1.5 flex-1">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="size-3.5 mt-0.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">
                      <strong className="font-mono text-foreground">{b.split(" — ")[0]}</strong>
                      {b.includes(" — ") ? ` — ${b.split(" — ").slice(1).join(" — ")}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.href}
                className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground font-medium hover:bg-primary/90 transition mt-auto"
              >
                {t.cta}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
