"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  globalFilterPlaceholder?: string;
  globalFilterFn?: (row: Row<T>, columnId: string, filterValue: string) => boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  rowClassName?: (row: T) => string;
}

/**
 * DataTable — Revolut-inspired card-row table.
 *
 * Структура (вместо классической HTML-таблицы):
 * - Toolbar: search + кастомный slot (filters, кнопки)
 * - Headers row: серый uppercase text, sortable buttons, без заливки
 * - Rows: каждая строка — независимая `bg-white` карточка с rounded-xl,
 *   разделённые gap'ом (а не border'ами).
 * - Pagination: text-only внизу.
 *
 * Контракт с консьюмерами не изменился: тот же ColumnDef[], тот же
 * onRowClick, rowClassName, globalFilterFn. Все existing tables
 * (clients, transactions, alerts, cases, rules, scenarios, workflows,
 * audit, users, risk-factors) получают новый look без правок.
 */
export function DataTable<T>({
  data,
  columns,
  globalFilterPlaceholder = "Поиск...",
  globalFilterFn,
  toolbar,
  emptyMessage = "Ничего не найдено",
  onRowClick,
  pageSize = 25,
  rowClassName,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn as never,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const visibleColumnsCount = headerGroups[0]?.headers.length ?? columns.length;

  // CSS grid template — равные колонки с возможностью truncate.
  // Каждая колонка получает min 0 (чтобы truncate работал) и flex 1fr.
  const gridTemplate = `repeat(${visibleColumnsCount}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col gap-4 py-6">
      {/* Toolbar: search + custom slot */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={globalFilterPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-10 rounded-full bg-white dark:bg-white/[0.04] border-foreground/[0.06] focus-visible:ring-1"
          />
        </div>
        <div className="flex items-center gap-2">{toolbar}</div>
      </div>

      {/* Headers — light gray text, no backing */}
      {rows.length > 0 && (
        <div
          className="grid gap-4 px-5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {headerGroups[0]?.headers.map((h) => {
            const canSort = h.column.getCanSort();
            const sortDir = h.column.getIsSorted();
            return (
              <div key={h.id} className="min-w-0 flex items-center">
                {h.isPlaceholder ? null : canSort ? (
                  <button
                    onClick={h.column.getToggleSortingHandler()}
                    className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground transition-colors uppercase tracking-wider"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <ArrowUpDown
                      className={cn(
                        "size-3 transition-opacity",
                        sortDir ? "opacity-100 text-foreground" : "opacity-40"
                      )}
                    />
                  </button>
                ) : (
                  flexRender(h.column.columnDef.header, h.getContext())
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rows — каждая строка отдельная карточка */}
      <div className="flex flex-col gap-1.5">
        {rows.length > 0 ? (
          rows.map((row) => {
            const isSelected = row.getIsSelected();
            return (
              <div
                key={row.id}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row.original)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(row.original);
                  }
                }}
                data-state={isSelected ? "selected" : undefined}
                className={cn(
                  "grid gap-4 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.04] transition-colors text-[14px]",
                  onRowClick && "cursor-pointer hover:bg-foreground/[0.02] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isSelected && "bg-primary/[0.06] dark:bg-primary/[0.08]",
                  rowClassName?.(row.original)
                )}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="min-w-0 flex items-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl bg-white dark:bg-white/[0.04] px-5 py-12 text-center text-[14px] text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Pagination — text-only, без border'ов */}
      <div className="flex items-center justify-between text-[12px] text-muted-foreground px-1">
        <span>
          {table.getFilteredRowModel().rows.length}{" "}
          {pluralize(table.getFilteredRowModel().rows.length, ["запись", "записи", "записей"])}
        </span>
        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            Стр. {table.getState().pagination.pageIndex + 1} из {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Следующая страница"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function pluralize(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export { ChevronDown };
