"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Wrench, Search, ArrowRight, Sparkles, Plus } from "lucide-react";

import { useMockData, type Agent } from "@/lib/mock";
import { StatusBadge } from "@/components/ext/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "disabled";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные" },
  { id: "disabled", label: "Выключенные" },
];

function rate(a: Agent) {
  const total = a.lastRuns?.length ?? 0;
  return { ok: total ? a.lastRuns.filter((r) => r.status === "success").length : 0, total };
}

const FEATURED_ID = "AG-1";

export function AgentsGrid() {
  const data = useMockData();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.agents.filter((a) => {
      if (filter === "active" && !a.enabled) return false;
      if (filter === "disabled" && a.enabled) return false;
      if (!q) return true;
      return a.name.toLowerCase().includes(q) || a.model.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    });
  }, [data.agents, query, filter]);

  const featured = filtered.find((a) => a.id === FEATURED_ID);
  const rest = featured ? filtered.filter((a) => a.id !== FEATURED_ID) : filtered;

  const counts = {
    all: data.agents.length,
    active: data.agents.filter((a) => a.enabled).length,
    disabled: data.agents.filter((a) => !a.enabled).length,
  };

  return (
    <div className="@container flex flex-col gap-4 pb-6">
      {/* Поиск + фильтр-чипы */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск по имени, модели, описанию..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg bg-foreground/[0.05] p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors",
                filter === f.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="text-xs tabular-nums text-muted-foreground/70">{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <Button asChild size="xl" className="ml-auto">
          <Link href="/ai/agents/new">
            <Plus className="size-4" />
            Новый агент
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-10 text-center text-sm text-muted-foreground">Агентов не найдено</p>
      ) : (
        <>
          {/* Featured */}
          {featured ? <FeaturedAgent agent={featured} /> : null}

          {/* Grid плиток */}
          {rest.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 @[36rem]:grid-cols-2 @[60rem]:grid-cols-3">
              {rest.map((a) => (
                <AgentTile key={a.id} agent={a} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function FeaturedAgent({ agent }: { agent: Agent }) {
  const { ok, total } = rate(agent);
  return (
    <Link
      href={`/ai/agents/${agent.id}`}
      className="group relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-card to-card p-6 transition-colors hover:border-primary/45"
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm">
          <Bot className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="font-heading text-xl font-bold leading-snug">{agent.name}</h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3" />
              Ключевой
            </span>
            <StatusBadge tone={agent.enabled ? "success" : "muted"}>{agent.enabled ? "Активен" : "Выключен"}</StatusBadge>
          </div>
          <p className="mt-1 max-w-[72ch] text-sm text-muted-foreground">{agent.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Stat label="Модель" value={<span className="font-mono text-xs">{agent.model}</span>} />
            <Stat label="Инструменты" value={agent.tools.length} />
            <Stat label="Запуски" value={total ? `${ok}/${total} ок` : "—"} />
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Открыть карточку
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function AgentTile({ agent }: { agent: Agent }) {
  const { ok, total } = rate(agent);
  return (
    <Link
      href={`/ai/agents/${agent.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="size-5" />
        </div>
        <StatusBadge tone={agent.enabled ? "success" : "muted"}>{agent.enabled ? "Активен" : "Выключен"}</StatusBadge>
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-heading text-[15px] font-semibold">{agent.name}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{agent.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="truncate font-mono">{agent.model}</span>
        <span className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <Wrench className="size-3" />
            {agent.tools.length}
          </span>
          {total ? <span className="tabular-nums">{ok}/{total}</span> : null}
        </span>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground/70">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}
