"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Клиентская пагинация по массиву (для карточных списков).
 * В проде заменяется серверной (?page & pageSize) — UX-контракт тот же.
 */
export function usePaged<T>(items: T[], initialSize = 12) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialSize);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const pageItems = items.slice((current - 1) * pageSize, current * pageSize);
  return { page: current, setPage, pageSize, setPageSize, total, pageCount, from, to, pageItems };
}

interface PagerFooterProps {
  page: number;
  pageCount: number;
  total: number;
  from: number;
  to: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
  unit?: string;
  sizes?: number[];
}

export function PagerFooter({
  page,
  pageCount,
  total,
  from,
  to,
  pageSize,
  onPage,
  onPageSize,
  unit = "записей",
  sizes = [12, 24, 48],
}: PagerFooterProps) {
  if (total === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">
      <span className="tabular-nums text-muted-foreground">
        Показано {from}–{to} из {total} {unit}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          aria-label="Размер страницы"
          className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none focus:ring-0"
        >
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s} / стр.
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" className="h-8" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft className="size-4" />
          Назад
        </Button>
        <span className="min-w-14 text-center text-xs tabular-nums text-muted-foreground">
          {page} / {pageCount}
        </span>
        <Button variant="outline" size="sm" className="h-8" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          Вперёд
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
