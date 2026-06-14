"use client";

import { Pencil, Trash2 } from "lucide-react";

import { useMockData, type RiskFactor } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<RiskFactor["type"], string> = {
  scoring_history: "Скоринг",
  client_field: "Поле клиента",
  transaction: "Транзакция",
  media: "Медиа",
  custom: "Кастом",
};

const COLS =
  "grid grid-cols-[minmax(200px,1.6fr)_130px_minmax(150px,1fr)_120px_140px_110px_80px] items-center gap-4";

export function RiskFactorsList({ onEdit }: { onEdit?: (f: RiskFactor) => void }) {
  const data = useMockData();
  const factors = data.riskFactors;
  const totalWeight = factors.reduce((s, f) => s + (f.active ? f.weight : 0), 0) || 1;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[0_6px_24px_-8px_rgba(0,0,0,0.12)]">
      <div className="min-w-[940px]">
        {/* header */}
        <div className={cn(COLS, "border-b border-border px-5 py-3 text-[12px] font-medium text-muted-foreground")}>
          <span>Название</span>
          <span>Тип</span>
          <span>Источник</span>
          <span>Корзины</span>
          <span>Вес · доля</span>
          <span>Активен</span>
          <span className="text-right">Действия</span>
        </div>

        {factors.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">Атрибутов пока нет — нажмите «Добавить атрибут».</div>
        ) : (
          factors.map((f) => {
            const share = f.active ? Math.round((f.weight / totalWeight) * 100) : 0;
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={0}
                onClick={() => onEdit?.(f)}
                onKeyDown={(e) => { if (e.key === "Enter") onEdit?.(f); }}
                className={cn(
                  COLS,
                  "cursor-pointer border-b border-border/60 px-5 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-muted/30 focus:outline-none focus-visible:bg-muted/40",
                  !f.active && "opacity-60",
                )}
              >
                {/* Название */}
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{f.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{f.description}</div>
                </div>
                {/* Тип */}
                <span><StatusBadge tone="muted">{TYPE_LABEL[f.type]}</StatusBadge></span>
                {/* Источник */}
                <span className="truncate font-mono text-xs text-muted-foreground">{f.source}</span>
                {/* Корзины — мини-эквалайзер */}
                <div className="flex items-end gap-0.5" title={`${f.buckets.length} корзин`}>
                  {f.buckets.slice(0, 6).map((b, i) => (
                    <span key={i} className="w-1.5 rounded-sm bg-primary/70" style={{ height: `${4 + (b.score / 100) * 16}px` }} />
                  ))}
                  <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{f.buckets.length}</span>
                </div>
                {/* Вес · доля */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-foreground/[0.08]">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
                  </div>
                  <span className="font-mono text-xs tabular-nums text-foreground">{f.weight}</span>
                </div>
                {/* Активен */}
                <span><StatusBadge tone={f.active ? "success" : "muted"}>{f.active ? "Активен" : "Выкл."}</StatusBadge></span>
                {/* Действия */}
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Редактировать" onClick={() => onEdit?.(f)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-risk-critical" aria-label="Удалить">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
