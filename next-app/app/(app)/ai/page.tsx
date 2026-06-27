import Link from "next/link";
import { ArrowRight, Bot, Check, Shield, MessageSquare, Sparkles, Search, ArrowUpRight } from "lucide-react";
import { StateSwitch } from "@/components/ext/state-switch";

const CHAT_CHIPS = ["Риск-профиль клиента", "Похожие операции", "Разбор оповещения", "Черновик SAR"];

const CHAT_BULLETS = [
  "Документы PDF — загрузка и анализ файлов прямо в чате",
  "История диалогов — все разговоры сохраняются и доступны в панели",
  "Контекст платформы — ассистент знает о клиентах, транзакциях и делах",
];

const TILES = [
  {
    href: "/ai/agents",
    icon: Bot,
    title: "Агенты",
    eyebrow: "Paper Agents · кастомные инструкции",
    description: "Настраиваемые AI-агенты с собственными инструкциями и инструментами для автоматизации задач.",
    cta: "Управление агентами",
    bullets: [
      "Кастомные инструкции — полный контроль над поведением агента",
      "Интеграция со сценариями — агенты подключаются к автоматизации",
    ],
  },
  {
    href: "/ai/compliance-agent",
    icon: Shield,
    title: "Комплаенс-агент",
    eyebrow: "Авто-агент · обработка оповещений",
    description: "Автоматически анализирует оповещения, эскалирует или запускает сценарии для клиентов.",
    cta: "Открыть агента",
    bullets: [
      "Авто-разбор оповещений — решение по каждому срабатыванию",
      "Письма менеджеру — итоги и эскалации по настроенным правилам",
    ],
  },
];

export default function Page() {
  return (
    <StateSwitch skeleton="list" emptyTitle="AI-инструменты недоступны">
      <div className="flex flex-col gap-4 pb-6 pt-5">
        {/* HERO — Чат (единственный primary) */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card p-6 md:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm">
                <MessageSquare className="size-5" />
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                <Sparkles className="size-3" />
                AI-ассистент
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[28px]">
                Чем помочь сегодня?
              </h2>
              <p className="max-w-[60ch] text-sm text-muted-foreground">
                Контекстный ассистент комплаенс-офицера: задайте вопрос по клиенту, операции или кейсу — упоминайте сущности через «/».
              </p>
            </div>

            {/* Псевдо-инпут → /chat */}
            <Link
              href="/chat"
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm text-muted-foreground">Спросите про клиента, операцию или кейс…</span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground">
                <ArrowRight className="size-4" />
              </span>
            </Link>

            {/* Возможности чата */}
            <ul className="flex flex-col gap-1.5">
              {CHAT_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Быстрые промпты */}
            <div className="flex flex-wrap gap-1.5">
              {CHAT_CHIPS.map((c) => (
                <Link
                  key={c}
                  href="/chat"
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Вторичные инструменты */}
        <div className="grid gap-3 md:grid-cols-2">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <t.icon className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-lg font-semibold">{t.title}</h3>
                <p className="text-xs text-muted-foreground">{t.eyebrow}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <ul className="flex flex-1 flex-col gap-1">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t.cta}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </StateSwitch>
  );
}
