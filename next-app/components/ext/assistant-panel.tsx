"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface AssistantPanelProps {
  contextLabel: string;
  contextSubtitle?: string;
  quickPrompts?: string[];
  triggerLabel?: string;
  /** Если задан — используется вместо стандартной кнопки (для floating-trigger'а) */
  triggerOverride?: React.ReactNode;
}

export function AssistantPanel({
  contextLabel,
  contextSubtitle,
  quickPrompts = [
    "Объясни текущий риск-уровень и факторы",
    "Покажи похожие случаи за последние 30 дней",
    "Составь черновик отчёта о подозрительной активности",
  ],
  triggerLabel = "AI Ассистент",
  triggerOverride,
}: AssistantPanelProps) {
  const [messages, setMessages] = React.useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [draft, setDraft] = React.useState("");
  const [streaming, setStreaming] = React.useState<string | null>(null);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setDraft("");
    streamMockResponse(text);
  };

  const streamMockResponse = async (prompt: string) => {
    const full = mockResponse(prompt);
    setStreaming("");
    for (let i = 1; i <= full.length; i++) {
      setStreaming(full.slice(0, i));
      await new Promise((r) => setTimeout(r, 12 + Math.random() * 18));
    }
    setStreaming(null);
    setMessages((m) => [...m, { role: "assistant", content: full }]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {triggerOverride ?? (
          <Button variant="outline" size="sm">
            <Sparkles className="size-4" />
            {triggerLabel}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-medium">
            <Sparkles className="size-4 text-primary" />
            Ассистент
          </SheetTitle>
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <span className="truncate">Контекст: {contextLabel}</span>
            {contextSubtitle ? <span className="truncate">{contextSubtitle}</span> : null}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 p-5">
            {messages.length === 0 && !streaming ? (
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>Спросите что-нибудь о текущем контексте, или начните с подсказки ниже.</span>
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "self-end max-w-[85%] bg-primary text-primary-foreground"
                      : "self-start max-w-[90%] bg-muted",
                  )}
                >
                  {m.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {streaming !== null ? (
              <div className="self-start max-w-[90%] rounded-lg bg-muted px-3 py-2 text-sm leading-relaxed">
                {streaming}
                <span className="ml-0.5 inline-block size-1.5 translate-y-[-1px] animate-pulse rounded-full bg-foreground/60" />
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-3 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground/80 transition hover:bg-muted"
                >
                  {p}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              placeholder="Ваш вопрос... (⌘+Enter — отправить)"
              className="min-h-10 max-h-40 resize-none text-sm"
              rows={1}
            />
            <Button
              size="icon"
              onClick={() => send(draft)}
              disabled={!draft.trim() || streaming !== null}
              aria-label="Отправить"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function mockResponse(prompt: string): string {
  if (/риск|risk/i.test(prompt)) {
    return "Текущий риск-уровень определяется комбинацией факторов: страна высокого риска (вес +15), несоответствие профилю (вес +20), регулярные транзакции с нерезидентами (вес +10). Рекомендую открыть EDD-шаг 'Подтверждение источника средств' и запросить актуальные документы.";
  }
  if (/похожих|similar/i.test(prompt)) {
    return "За последние 30 дней найдено 4 клиента с похожим паттерном: одинаковые контрагенты, средняя сумма ±15%, та же связка стран KZ→AE. Открыть в новой вкладке?";
  }
  if (/отчёт|report/i.test(prompt)) {
    return "Подготовил черновик SAR (Suspicious Activity Report): 1) выявленный паттерн — структурирование транзакций; 2) основание — нарушение Rule «Velocity Spike»; 3) рекомендация — эскалация к старшему офицеру и заморозка операций до выяснения. Полный текст в разделе «Документы».";
  }
  return "Понял ваш запрос. Анализирую контекст и подготавливаю ответ на основе доступных данных платформы...";
}

export { X };
