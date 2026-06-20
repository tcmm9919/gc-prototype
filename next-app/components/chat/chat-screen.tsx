"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowUp,
  Bell,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Globe,
  Menu,
  Mic,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock";
import Strands from "./strands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const QUICK_ACTIONS = [
  { label: "Риск-профиль клиента", icon: User, prompt: "Проанализируй риск-профиль клиента [CL-0001]" },
  { label: "Похожие операции", icon: ArrowLeftRight, prompt: "Покажи похожие операции на транзакцию [TX-0042]" },
  { label: "Разбор оповещения", icon: Bell, prompt: "Объясни почему сработало оповещение [AL-0001]" },
  { label: "Черновик SAR", icon: FileText, prompt: "Составь черновик SAR-отчёта по кейсу [CS-0001]" },
];

const MODELS = ["gpt-mini-1106", "gpt-4o", "YandexGPT Pro"];

type ConvGroup = { key: string; label: string | null; items: Conversation[] };

// Сортировка истории по дням. До маунта (now=null) — один плоский список,
// чтобы SSR и первый клиентский рендер совпадали (без hydration mismatch).
function groupConversations(convs: Conversation[], now: Date | null): ConvGroup[] {
  if (!now) return [{ key: "all", label: null, items: convs }];
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };
  const today0 = startOfDay(now);
  const dayMs = 86_400_000;
  const buckets: Record<string, Conversation[]> = { today: [], yesterday: [], week: [], earlier: [] };
  for (const c of convs) {
    const diff = Math.round((today0 - startOfDay(new Date(c.updatedAt))) / dayMs);
    if (diff <= 0) buckets.today.push(c);
    else if (diff === 1) buckets.yesterday.push(c);
    else if (diff <= 7) buckets.week.push(c);
    else buckets.earlier.push(c);
  }
  const labels: Record<string, string> = {
    today: "Сегодня",
    yesterday: "Вчера",
    week: "Последние 7 дней",
    earlier: "Ранее",
  };
  return (["today", "yesterday", "week", "earlier"] as const)
    .filter((k) => buckets[k].length)
    .map((k) => ({ key: k, label: labels[k], items: buckets[k] }));
}

export function ChatScreen() {
  const [activeId, setActiveId] = React.useState<string>("c1");
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES.c1 ?? []);
  const [draft, setDraft] = React.useState("");
  const [streaming, setStreaming] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [navOpen, setNavOpen] = React.useState(false);
  const [model, setModel] = React.useState(MODELS[0]);
  const [attachment, setAttachment] = React.useState<string | null>(null);
  const [now, setNow] = React.useState<Date | null>(null);
  const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<string>>(new Set());
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Время резолвим только на клиенте → приветствие до маунта нейтральное (без hydration mismatch).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setNow(new Date()), []);

  // Сброс состояния при смене диалога — корректировка во время рендера (рекомендованный
  // React-паттерн вместо useEffect: без лишнего ререндера и мерцания).
  const [prevId, setPrevId] = React.useState(activeId);
  if (prevId !== activeId) {
    setPrevId(activeId);
    setMessages(INITIAL_MESSAGES[activeId] ?? []);
    setStreaming(null);
    setError(null);
  }

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming, error]);

  const send = async (text: string) => {
    if (!text.trim() || streaming !== null) return;
    setError(null);
    const note = attachment ? ` (вложение: ${attachment})` : "";
    setMessages((m) => [...m, { role: "user", content: text + note }]);
    setDraft("");
    setAttachment(null);
    try {
      const reply = generateReply(text);
      setStreaming("");
      for (let i = 1; i <= reply.length; i++) {
        setStreaming(reply.slice(0, i));
        await new Promise((r) => setTimeout(r, 10 + Math.random() * 14));
      }
      setStreaming(null);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      // Защитный error-state: сеть/таймаут API — даём пользователю понятный фидбэк + повтор.
      setStreaming(null);
      setError(text);
    }
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAttachment(f.name);
      toast.success(`Файл прикреплён: ${f.name}`);
    }
    e.target.value = "";
  };

  const active = CONVERSATIONS.find((c) => c.id === activeId);
  const isEmpty = messages.length === 0 && streaming === null && error === null;
  const hour = now?.getHours() ?? -1;
  const greeting =
    hour < 0 ? "Здравствуйте" : hour < 6 ? "Доброй ночи" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  const firstName = currentUser.fullName.split(" ")[0];
  const groups = groupConversations(CONVERSATIONS, now);
  const toggleGroup = (key: string) =>
    setCollapsedGroups((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  return (
    <div className="relative mt-7 grid h-[calc(100svh-7.5rem)] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_6px_24px_-8px_rgba(0,0,0,0.12)] md:grid-cols-[18rem_1fr]">
      {/* Затемнение под выезжающим списком (только мобайл) */}
      {navOpen ? (
        <div className="absolute inset-0 z-20 bg-foreground/40 md:hidden" aria-hidden onClick={() => setNavOpen(false)} />
      ) : null}

      <aside
        className={cn(
          "flex min-w-0 flex-col overflow-hidden border-r border-border bg-card",
          "md:relative md:z-auto md:flex md:w-auto md:shadow-none",
          navOpen ? "absolute inset-y-0 left-0 z-30 w-72 shadow-xl" : "hidden md:flex",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border p-3">
          <Button
            size="lg"
            className="flex-1 justify-start"
            onClick={() => {
              setActiveId("new-" + Date.now());
              setNavOpen(false);
            }}
          >
            <Plus className="size-4" />
            Новый диалог
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setNavOpen(false)} aria-label="Закрыть список диалогов">
            <X className="size-4" />
          </Button>
        </div>
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск..." className="h-8 pl-8 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1.5">
          {groups.map((g) => {
            const isCollapsed = g.label ? collapsedGroups.has(g.key) : false;
            return (
              <div key={g.key} className="mb-1">
                {g.label ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(g.key)}
                    className="flex w-full items-center justify-between rounded-md px-3 pb-1 pt-4 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    aria-expanded={!isCollapsed}
                  >
                    <span>{g.label}</span>
                    <ChevronDown className={cn("size-3.5 shrink-0 opacity-60 transition-transform", isCollapsed && "-rotate-90")} />
                  </button>
                ) : null}
                {!isCollapsed
                  ? g.items.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveId(c.id);
                          setNavOpen(false);
                        }}
                        title={c.title}
                        aria-label={`Открыть диалог: ${c.title}`}
                        className={cn(
                          "block w-full truncate rounded-md px-3 py-2 text-left text-sm transition",
                          activeId === c.id ? "bg-muted font-medium text-foreground" : "text-foreground/80 hover:bg-muted/60",
                        )}
                      >
                        {c.title}
                      </button>
                    ))
                  : null}
              </div>
            );
          })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-col bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-2.5 md:px-5">
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setNavOpen(true)} aria-label="Открыть список диалогов">
            <Menu className="size-5" />
          </Button>
          <span className="truncate text-[13px] font-medium text-foreground">{active?.title ?? "Новый диалог"}</span>
        </header>

        {isEmpty ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
              <div className="relative mb-6 size-52 sm:size-60" aria-hidden>
                <Strands
                  colors={["#F97316", "#7C3AED", "#06B6D4"]}
                  count={3}
                  speed={0.5}
                  glow={2.6}
                  taper={3}
                  intensity={0.6}
                  saturation={1.5}
                  scale={1.5}
                />
              </div>
              <h2 className="text-center font-heading text-[26px] font-semibold tracking-tight text-foreground sm:text-[32px]">
                {greeting}, {firstName}
              </h2>
              <h2 className="text-center font-heading text-[26px] font-semibold tracking-tight text-muted-foreground sm:text-[32px]">
                Чем я могу <span className="text-primary">помочь сегодня?</span>
              </h2>

              <div className="mt-8 w-full max-w-2xl">
                <Composer
                  draft={draft}
                  setDraft={setDraft}
                  onSend={() => send(draft)}
                  attachment={attachment}
                  setAttachment={setAttachment}
                  fileRef={fileRef}
                  onPickFile={pickFile}
                  streaming={streaming}
                  model={model}
                  setModel={setModel}
                  placeholder="Задайте вопрос ассистенту…"
                />
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.prompt)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] text-foreground transition hover:bg-muted/60"
                  >
                    <q.icon className="size-3.5 text-muted-foreground" />
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end gap-6 px-4 py-6 md:px-6">
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <MessageRow
                      key={i}
                      message={m}
                      onRegenerate={i === messages.length - 1 && m.role === "assistant" ? () => send(messages[i - 1]?.content ?? "") : undefined}
                    />
                  ))}
                </AnimatePresence>

                {streaming !== null ? (
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <TypingIndicator />
                      <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {renderWithPills(streaming)}
                        <span className="ml-0.5 inline-block size-1.5 translate-y-[-1px] animate-pulse rounded-full bg-foreground/60" />
                      </div>
                    </div>
                  </div>
                ) : null}

                {error !== null ? (
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-risk-critical/10 text-risk-critical">
                      <AlertCircle className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-[11px] font-medium text-risk-critical">Ошибка</div>
                      <p className="text-sm text-muted-foreground">Не удалось получить ответ. Проверьте соединение и попробуйте ещё раз.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const t = error;
                          setError(null);
                          send(t);
                        }}
                      >
                        <RefreshCw className="size-3.5" />
                        Повторить
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-border p-3 md:p-4">
              <div className="mx-auto max-w-3xl">
                <Composer
                  draft={draft}
                  setDraft={setDraft}
                  onSend={() => send(draft)}
                  attachment={attachment}
                  setAttachment={setAttachment}
                  fileRef={fileRef}
                  onPickFile={pickFile}
                  streaming={streaming}
                  model={model}
                  setModel={setModel}
                  placeholder="Задайте вопрос или упомяните [CL-…], [TX-…]…"
                />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

interface ComposerProps {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  attachment: string | null;
  setAttachment: (v: string | null) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  streaming: string | null;
  model: string;
  setModel: (m: string) => void;
  placeholder: string;
}

function Composer({
  draft,
  setDraft,
  onSend,
  attachment,
  setAttachment,
  fileRef,
  onPickFile,
  streaming,
  model,
  setModel,
  placeholder,
}: ComposerProps) {
  return (
    <div>
      {attachment ? (
        <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs">
          <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{attachment}</span>
          <button type="button" onClick={() => setAttachment(null)} aria-label="Убрать вложение" className="shrink-0 text-muted-foreground transition hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
      <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onPickFile} />
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          className="max-h-40 min-h-12 resize-none border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
          rows={2}
        />
        <div className="flex items-center gap-1 px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} aria-label="Прикрепить файл">
                <Paperclip className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Прикрепить PDF / изображение</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full px-2.5 text-xs font-normal" aria-label={`Модель: ${model}`}>
                <Globe className="size-3.5 text-muted-foreground" />
                {model}
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {MODELS.map((m) => (
                <DropdownMenuItem key={m} onClick={() => setModel(m)}>
                  {m}
                  {m === model ? <Check className="ml-auto size-4 text-primary" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" aria-label="Голосовой ввод" onClick={() => toast("Голосовой ввод — в разработке")}>
            <Mic className="size-4" />
          </Button>
          <div className="ml-auto" />
          <Button
            size="icon"
            className="rounded-full"
            onClick={onSend}
            disabled={!draft.trim() || streaming !== null}
            aria-label="Отправить (⌘+Enter)"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      Ассистент печатает
      <span className="flex items-center gap-0.5">
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="size-1 animate-bounce rounded-full bg-muted-foreground" />
      </span>
    </span>
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
      className="group/msg flex gap-3"
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
        )}
        aria-hidden
      >
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-medium text-muted-foreground">{isUser ? "Вы" : "Ассистент"}</div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {renderWithPills(message.content)}
        </div>
        <div className="mt-1.5 flex items-center gap-0.5 opacity-0 transition group-hover/msg:opacity-100">
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
      </div>
    </motion.div>
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
