import Link from "next/link";
import { ArrowRight, Bot, MessageSquare, Shield, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <StateSwitch
        skeleton="list"
        emptyTitle="AI-инструменты недоступны"
        emptyDescription="Загляните позже — инструменты появятся по мере подключения."
      >
        <div className="grid gap-4 pb-6 md:grid-cols-3">
          {TILES.map((t) => (
            <Card key={t.href} className="h-full">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className={`flex size-11 items-center justify-center rounded-lg ${t.tone}`}>
                  <t.icon className="size-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-heading text-lg font-semibold">{t.title}</h2>
                  <p className="text-xs text-muted-foreground">{t.eyebrow}</p>
                </div>
                <p className="text-sm text-muted-foreground">{t.description}</p>
                <ul className="flex-1 space-y-1.5">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">
                        <strong className="font-mono text-foreground">{b.split(" — ")[0]}</strong>
                        {b.includes(" — ") ? ` — ${b.split(" — ").slice(1).join(" — ")}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-auto w-full">
                  <Link href={t.href}>
                    {t.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </StateSwitch>
    </>
  );
}
