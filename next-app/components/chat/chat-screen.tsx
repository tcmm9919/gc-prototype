"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { renderWithPills } from "./entity-pill";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  tag?: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Анализ: income_report_good_72…",
    preview: "Сопоставлены доходы и транзакции за 90 дней...",
    updatedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    tag: "EDD",
  },
  {
    id: "c2",
    title: "Проверка контрагента ТОО «Caspian Trade»",
    preview: "ОКВЭД совпадает, санкционных рисков нет...",
    updatedAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    tag: "KYC",
  },
  {
    id: "c3",
    title: "Объясни срабатывание Severance Rule",
    preview: "Velocity Spike + Round-Amount Cash в одну сессию...",
    updatedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    tag: "Alert",
  },
  {
    id: "c4",
    title: "Сценарий: ночные переводы",
    preview: "Precision 0.78 на исторических данных. Хочется поднять recall...",
    updatedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    tag: "Scenarios",
  },
  {
    id: "c5",
    title: "Группа клиентов с общим бенефициаром",
    preview: "5 клиентов, связь через одного УПД...",
    updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    tag: "Cases",
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Record<string, Message[]> = {
  c1: [
    { role: "user", content: "Сопоставь декларацию о доходах клиента [CL-0007] с входящими транзакциями за 90 дней." },
    {
      role: "assistant",
      content:
        "Сделал сопоставление по [CL-0007]:\n\n• Декларация: 4 800 000 ₸ за 90 дней\n• Фактические поступления: 4 950 000 ₸\n• Расхождение: +3.1% — в пределах нормы\n\nИсточники в декларации: зарплата (3 200 000 ₸) и аренда (1 600 000 ₸).\n\nФактические источники: 3 регулярных платежа от ТОО «Алматы Логистикс» (работодатель) — крупнейшая операция [TX-0024], 12 переводов от физлиц с пометкой «аренда».\n\nВывод: данные клиента сходятся, дополнительная проверка не требуется.",
    },
  ],
  c3: [
    { role: "user", content: "Объясни срабатывание Severance Rule на оповещении [AL-0003]" },
    {
      role: "assistant",
      content:
        "Оповещение [AL-0003] сработало на правиле Severance:\n\n• Триггер: Velocity Spike (4 операции в течение часа на одну и ту же сумму)\n• Дополнительный фактор: Round-Amount Cash (все суммы кратны 100 000 ₸)\n• Клиент: [CL-0012], риск-уровень high\n\nЭто классический паттерн структурирования (smurfing). Рекомендую открыть кейс [CS-0008] и приостановить операции до выяснения.",
    },
  ],
};

const STARTERS = [
  "Проанализируй риск-профиль клиента [CL-0001]",
  "Покажи похожие операции на транзакцию [TX-0042]",
  "Объясни почему сработало оповещение [AL-0001]",
  "Составь черновик SAR-отчёта по кейсу [CS-0001]",
];

export function ChatScreen() {
  const [activeId, setActiveId] = React.useState<string>("c1");
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES.c1 ?? []);
  const [draft, setDraft] = React.useState("");
  const [streaming, setStreaming] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMessages(INITIAL_MESSAGES[activeId] ?? []);
    setStreaming(null);
  }, [activeId]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || streaming !== null) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setDraft("");
    const reply = generateReply(text);
    setStreaming("");
    for (let i = 1; i <= reply.length; i++) {
      setStreaming(reply.slice(0, i));
      await new Promise((r) => setTimeout(r, 10 + Math.random() * 14));
    }
    setStreaming(null);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
  };

  const active = CONVERSATIONS.find((c) => c.id === activeId);
  const isEmpty = messages.length === 0 && streaming === null;

  return (
    <div className="grid h-[calc(100svh-3.5rem)] grid-cols-[18rem_1fr] overflow-hidden rounded-lg border border-border">
      <aside className="flex min-w-0 flex-col overflow-hidden border-r border-border bg-muted/20">
        <div className="border-b border-border p-3 space-y-2">
          <Button size="lg" className="w-full justify-start" onClick={() => setActiveId("new-" + Date.now())}>
            <Plus className="size-4" />
            Новый диалог
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск..." className="h-8 pl-8 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="space-y-0.5 p-2">
            {CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "block w-full min-w-0 rounded-md px-3 py-2 text-left transition",
                  activeId === c.id ? "bg-background border border-border shadow-sm" : "hover:bg-muted/60",
                )}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.title}</span>
                  {c.tag ? (
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{c.tag}</span>
                  ) : null}
                </div>
                <p className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">{c.preview}</p>
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true, locale: ru })}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 shrink-0 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="size-5" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-medium truncate">{active?.title ?? "Новый диалог"}</span>
              <span className="text-xs text-muted-foreground">Контекст подтянется автоматически из открытых сущностей</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Sparkles className="size-4" />
              gpt-mini-1106
            </Button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
            {isEmpty ? (
              <EmptyConversation onPick={send} />
            ) : null}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <MessageRow key={i} message={m} onRegenerate={i === messages.length - 1 ? () => send(messages[i - 1]?.content ?? "") : undefined} />
              ))}
            </AnimatePresence>

            {streaming !== null ? (
              <div className="flex flex-col items-start gap-1">
                <span className="text-[11px] text-muted-foreground">Ассистент печатает...</span>
                <div className="max-w-[90%] whitespace-pre-wrap rounded-lg bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
                  {renderWithPills(streaming)}
                  <span className="ml-0.5 inline-block size-1.5 translate-y-[-1px] animate-pulse rounded-full bg-foreground/60" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Напишите ассистенту... (⌘+Enter — отправить, упомяните [CL-…], [TX-…] и т.д.)"
              className="min-h-11 max-h-48 resize-none"
              rows={1}
            />
            <Button onClick={() => send(draft)} disabled={!draft.trim() || streaming !== null} aria-label="Отправить">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MessageRow({ message, onRegenerate }: { message: Message; onRegenerate?: () => void }) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("group/msg flex flex-col gap-1", isUser ? "items-end" : "items-start")}
    >
      <span className="text-[11px] text-muted-foreground">{isUser ? "Вы" : "Ассистент"}</span>
      <div
        className={cn(
          "max-w-[90%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {renderWithPills(message.content)}
      </div>
      <div className={cn("flex items-center gap-0.5 opacity-0 transition group-hover/msg:opacity-100", isUser ? "self-end" : "self-start")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6" onClick={copy} aria-label="Копировать">
              {copied ? <Check className="size-3.5 text-risk-low" /> : <Copy className="size-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Скопировано" : "Копировать"}</TooltipContent>
        </Tooltip>
        {!isUser && onRegenerate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6" onClick={onRegenerate} aria-label="Перегенерировать">
                <RefreshCw className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Перегенерировать ответ</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </motion.div>
  );
}

function EmptyConversation({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-primary/8 blur-2xl" aria-hidden />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-border bg-background text-primary shadow-sm">
          <Sparkles className="size-6" />
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-medium">Спросите что-нибудь о вашей платформе</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Можно упоминать клиентов, транзакции, оповещения и кейсы в квадратных скобках — например <span className="font-mono text-foreground">[CL-0001]</span>.
        </p>
      </div>
      <div className="grid w-full gap-2 sm:grid-cols-2 max-w-2xl">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-muted/40"
          >
            {renderWithPills(s)}
          </button>
        ))}
      </div>
    </div>
  );
}

function generateReply(prompt: string): string {
  if (/риск|risk|профиль/i.test(prompt)) {
    return "Риск-профиль сложился из нескольких факторов:\n\n1. География операций — присутствуют контрагенты из стран среднего риска ([TX-0042]).\n2. Поведенческие аномалии за последние 14 дней — +18% к среднему обороту.\n3. Совпадений с санкционными списками не найдено.\n\nРекомендую открыть EDD-шаг «Источник средств» и зафиксировать комментарий офицера. Связанные оповещения: [AL-0001], [AL-0003].";
  }
  if (/контрагент|тоо|company/i.test(prompt)) {
    return "Проверил контрагента по доступным источникам:\n• ОКВЭД совпадает с историей деятельности\n• В санкционных списках OFAC / EU / UK Sanctions — отсутствует\n• Бенефициар: 1 физлицо, гражданство KZ\n• Публикаций в негативных СМИ за 12 месяцев не найдено\n\nКонтрагент выглядит благонадёжно. Историю операций см. на [CL-0012].";
  }
  if (/похожих|похожие|similar/i.test(prompt)) {
    return "Нашёл 4 похожие операции за последние 30 дней: [TX-0042], [TX-0048], [TX-0091], [TX-0123]. Все — одинаковая связка стран KZ → AE, контрагенты разные, суммы ±15%. Это укладывается в паттерн структурирования. Стоит создать кейс.";
  }
  if (/sar|отчёт|report|заключение/i.test(prompt)) {
    return "Подготовил черновик SAR-отчёта:\n\n1. Выявленный паттерн — структурирование транзакций ([TX-0042], [TX-0048]).\n2. Основание — нарушение правила «Velocity Spike» ([AL-0003]).\n3. Рекомендация — эскалация к старшему офицеру и заморозка операций до выяснения.\n\nКейс: [CS-0008]. Полный текст в разделе «Документы» карточки кейса.";
  }
  return "Понял ваш запрос. Анализирую контекст и подбираю наиболее точный ответ на основе доступных данных платформы.";
}
