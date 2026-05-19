"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { AssistantPanel } from "@/components/ext/assistant-panel";

/**
 * Floating bottom-right AI assistant button, mounted globally inside `(app)` layout.
 * Context is auto-derived from the current pathname.
 */
export function GlobalAssistantTrigger() {
  const pathname = usePathname();
  const context = contextFromPath(pathname);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AssistantPanel
        contextLabel={context.label}
        contextSubtitle={context.subtitle}
        triggerLabel=""
        triggerOverride={
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition relative"
            aria-label="Открыть AI-ассистента"
          >
            <Bot className="size-5" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
          </button>
        }
      />
    </div>
  );
}

function contextFromPath(path: string): { label: string; subtitle?: string } {
  if (path.startsWith("/clients/")) return { label: "Карточка клиента", subtitle: "Контекст: текущий клиент" };
  if (path === "/clients") return { label: "Список клиентов" };
  if (path.startsWith("/transactions/")) return { label: "Транзакция", subtitle: "Контекст: текущая операция" };
  if (path === "/transactions") return { label: "Транзакции" };
  if (path.startsWith("/cases/")) return { label: "Кейс", subtitle: "Контекст: текущий кейс" };
  if (path === "/cases") return { label: "Кейсы" };
  if (path.startsWith("/alerts/")) return { label: "Оповещение", subtitle: "Контекст: текущий алерт" };
  if (path === "/alerts") return { label: "Оповещения" };
  if (path.startsWith("/workflows/")) return { label: "Сценарий", subtitle: "Контекст: текущий workflow" };
  if (path === "/workflows") return { label: "Конструктор сценариев" };
  if (path === "/dashboard" || path === "/") return { label: "Дашборд" };
  return { label: "AI-ассистент" };
}
