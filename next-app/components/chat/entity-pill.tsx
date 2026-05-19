"use client";

import Link from "next/link";
import { ArrowLeftRight, Bell, Folder, User, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const PREFIX_META: Record<string, { href: (id: string) => string; icon: React.ComponentType<{ className?: string }>; tone: string; label: string }> = {
  CL: { href: (id) => `/clients/${id}`, icon: User, tone: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15", label: "клиент" },
  TX: { href: (id) => `/transactions/${id}`, icon: ArrowLeftRight, tone: "bg-muted text-foreground border-border hover:bg-accent", label: "транзакция" },
  AL: { href: (id) => `/alerts/${id}`, icon: Bell, tone: "bg-risk-medium/10 text-risk-medium border-risk-medium/30 hover:bg-risk-medium/15", label: "оповещение" },
  CS: { href: (id) => `/cases/${id}`, icon: Folder, tone: "bg-risk-high/10 text-risk-high border-risk-high/30 hover:bg-risk-high/15", label: "кейс" },
  SC: { href: (id) => `/workflows/${id}`, icon: Workflow, tone: "bg-muted text-foreground border-border hover:bg-accent", label: "сценарий" },
};

const ID_PATTERN = /\[(CL|TX|AL|CS|SC)-[a-zA-Z0-9-]+\]/g;

export function EntityPill({ id, className }: { id: string; className?: string }) {
  const prefix = id.slice(0, 2);
  const meta = PREFIX_META[prefix];
  if (!meta) return <span className={className}>{id}</span>;
  const Icon = meta.icon;
  return (
    <Link
      href={meta.href(id)}
      title={meta.label}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-mono transition",
        meta.tone,
        className,
      )}
    >
      <Icon className="size-3" />
      {id}
    </Link>
  );
}

/**
 * Renders text with [CL-0001] / [TX-0042] etc. converted into clickable pills.
 */
export function renderWithPills(text: string): React.ReactNode {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  ID_PATTERN.lastIndex = 0;
  while ((m = ID_PATTERN.exec(text)) !== null) {
    if (m.index > lastIndex) result.push(text.slice(lastIndex, m.index));
    const id = m[0].slice(1, -1);
    result.push(<EntityPill key={`${m.index}-${id}`} id={id} className="mx-0.5" />);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result;
}
