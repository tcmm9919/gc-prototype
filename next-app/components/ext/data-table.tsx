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
  type RowSelectionState,
  type RowData,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** CSS grid track for this column (e.g. "minmax(0, 2fr)", "90px"). Defaults to minmax(0, 1fr). */
    width?: string;
  }
}

export interface DataTableView<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  predicate?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  globalFilterPlaceholder?: string;
  globalFilterFn?: (row: Row<T>, columnId: string, filterValue: string) => boolean;
  filters?: React.ReactNode;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  views?: DataTableView<T>[];
  renderExpanded?: (item: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Доступное имя кликабельной строки (для скринридеров). Иначе имя собирается из текста ячеек. */
  rowLabel?: (row: T) => string;
  pageSize?: number;
  rowClassName?: (row: T) => string;
  bulkActions?: (selectedRows: T[], clearSelection: () => void) => React.ReactNode;
  /** Светло-серый контур + поджатый нижний паддинг (для использования внутри таба/карточки) */
  bordered?: boolean;
}

/**
 * DataTable — единый block с zebra rows (Revolut-inspired).
 *
 * Структура:
 * - Toolbar: [search + filters] слева, [actions/toolbar] справа — снаружи block сверху
 * - Block (rounded-2xl + overflow-y-auto + max-h):
 *   - Sticky header: остаётся при скролле rows внутри block'а
 *   - Rows: zebra via even:bg, scroll вертикальный внутри block'а
 *   - Hover: чуть темнее зебры; Selected: primary tint
 *   - Empty state: внутри block, по центру
 * - Pagination — снаружи block снизу, text-only ghost
 * - Floating bulk action bar — fixed bottom при ≥1 выбранной строке
 *
 * Контракт props не меняется — все 10 консьюмер-таблиц получают
 * новый look без правок.
 */
export function DataTable<T>({
  data,
  columns,
  globalFilterPlaceholder = "Поиск...",
  globalFilterFn,
  filters,
  toolbar,
  emptyMessage = "Ничего не найдено",
  emptyAction,
  views,
  renderExpanded,
  onRowClick,
  rowLabel,
  pageSize = 25,
  rowClassName,
  bulkActions,
  bordered = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  const toggleExpanded = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const [activeViewId, setActiveViewId] = React.useState<string | undefined>(views?.[0]?.id);

  const activeView = views?.find((v) => v.id === activeViewId);
  const viewFilteredData = React.useMemo(() => {
    if (!activeView?.predicate) return data;
    return data.filter(activeView.predicate);
  }, [data, activeView]);

  const viewCounts = React.useMemo(() => {
    if (!views) return {} as Record<string, number>;
    return Object.fromEntries(
      views.map((v) => [v.id, v.predicate ? data.filter(v.predicate).length : data.length]),
    );
  }, [data, views]);

  const table = useReactTable({
    data: viewFilteredData,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: Boolean(bulkActions),
    globalFilterFn: globalFilterFn as never,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const headerCols = headerGroups[0]?.headers ?? [];
  // Каждая колонка получает пол ширины COL_MIN, чтобы не схлопывалась в 0 и не
  // налезала на соседнюю. Дробные пропорции (Xfr) из meta.width сохраняются —
  // меняем только нижнюю границу minmax(0, …) → minmax(COL_MINpx, …).
  const COL_MIN = 150;
  const resolveTrack = (w?: string) =>
    (w ?? "minmax(0, 1fr)").replace(/minmax\(\s*0\s*,/, `minmax(${COL_MIN}px,`);
  const resolveMinPx = (w?: string) => {
    const v = w ?? "minmax(0, 1fr)";
    const fixed = v.match(/^\s*(\d+(?:\.\d+)?)px\s*$/);
    if (fixed) return parseFloat(fixed[1]);
    const mm = v.match(/minmax\(\s*(\d+(?:\.\d+)?)px/);
    if (mm) return parseFloat(mm[1]);
    return COL_MIN;
  };
  let gridTemplate = headerCols.length
    ? headerCols.map((h) => resolveTrack(h.column.columnDef.meta?.width)).join(" ")
    : `repeat(${columns.length}, minmax(${COL_MIN}px, 1fr))`;
  if (bulkActions) gridTemplate = `44px ${gridTemplate}`;
  if (renderExpanded) gridTemplate = `${gridTemplate} 36px`;
  // Мин-ширина таблицы = сумма полов колонок + спецколонки + гэпы (gap-4=16) + паддинг (px-6=48).
  // Когда не влезает — контейнер скроллится по горизонтали; узкие таблицы скролл не получают.
  const trackCount =
    (headerCols.length || columns.length) + (bulkActions ? 1 : 0) + (renderExpanded ? 1 : 0);
  const tableMinWidth =
    (headerCols.length
      ? headerCols.reduce((sum, h) => sum + resolveMinPx(h.column.columnDef.meta?.width), 0)
      : columns.length * COL_MIN) +
    (bulkActions ? 44 : 0) +
    (renderExpanded ? 36 : 0) +
    Math.max(0, trackCount - 1) * 16 +
    48;
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);

  return (
    <>
      <div className={cn("flex flex-col gap-3", !bordered && "pb-6")}>
        {/* Панель управления — отдельная область (белая карточка на верхнеуровневых списках) */}
        <div className={cn("flex flex-col gap-3", !bordered && "-mx-8 -mt-1 border-b border-border bg-card px-8 py-3")}>
        {/* Saved views */}
        {views && views.length > 0 && (
          <div className="inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-foreground/[0.06] p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {views.map((v) => {
              const isActive = v.id === activeViewId;
              const count = viewCounts[v.id] ?? 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveViewId(v.id)}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] font-medium outline-none transition-colors focus:outline-none focus-visible:ring-0 [&_svg]:size-3.5",
                    isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v.icon ? <span className="inline-flex">{v.icon}</span> : null}
                  <span>{v.label}</span>
                  <span className={cn("text-[12px] tabular-nums", isActive ? "text-muted-foreground" : "text-muted-foreground/70")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Toolbar: [search + filters] слева, [actions] справа.
            flex-wrap + ml-auto → на узких экранах action-кнопки уходят на свою
            строку, а не наезжают на фильтры (без flex-1, который раздувал строку). */}
        <div className="flex min-h-10 items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="relative w-72 max-w-full shrink-0">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label={globalFilterPlaceholder}
                placeholder={globalFilterPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-full rounded-lg border-border bg-card pl-8 text-[13px] focus-visible:ring-1"
              />
            </div>
            {filters && (
              <div className="flex flex-wrap items-center gap-1.5 [&_button]:h-8 [&_button]:gap-1.5 [&_button]:rounded-lg [&_button]:!border-transparent [&_button]:!bg-foreground/[0.06] [&_button]:px-2.5 [&_button]:text-[13px] [&_button]:font-normal [&_button]:shadow-none [&_button>svg]:size-3.5 [&_button:hover]:!bg-foreground/10">
                {filters}
              </div>
            )}
          </div>
          {toolbar && <div className="flex items-center gap-2 shrink-0 ml-auto">{toolbar}</div>}
        </div>
        </div>

        {/* Таблица — белая карточка на сером канвасе (контраст белый/серый отделяет её; контур только в dark) */}
        <div className={cn("rounded-2xl border bg-card overflow-x-auto overflow-y-auto max-h-[calc(100vh-15rem)]", bordered ? "border-border" : "border-transparent dark:border-border mt-2")}>
          {/* Header row */}
          {rows.length > 0 && (
            <div
              className="sticky top-0 z-10 grid gap-4 px-6 py-4 text-[13px] font-normal text-muted-foreground bg-card"
              style={{ gridTemplateColumns: gridTemplate, minWidth: tableMinWidth }}
            >
              {bulkActions && (
                <div className="min-w-0 flex items-center" style={{ width: 44 }}>
                  <Checkbox
                    checked={
                      table.getIsAllRowsSelected()
                        ? true
                        : table.getIsSomeRowsSelected()
                        ? "indeterminate"
                        : false
                    }
                    onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                    aria-label="Выбрать все"
                  />
                </div>
              )}
              {headerGroups[0]?.headers.map((h) => {
                const canSort = h.column.getCanSort();
                const sortDir = h.column.getIsSorted();
                return (
                  <div key={h.id} className="min-w-0 flex items-center overflow-hidden">
                    {h.isPlaceholder ? null : canSort ? (
                      <button
                        onClick={h.column.getToggleSortingHandler()}
                        className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-foreground transition-colors"
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
              {renderExpanded && <div style={{ width: 36 }} aria-hidden />}
            </div>
          )}

          {/* Data rows (zebra) */}
          {rows.length > 0 ? (
            rows.map((row) => {
              const isSelected = row.getIsSelected();
              const rowId = String((row.original as { id?: unknown }).id ?? row.id);
              const isExpanded = expandedIds.has(rowId);

              return (
                <div
                  key={row.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "transition-colors",
                    "even:bg-foreground/[0.025] dark:even:bg-white/[0.025]",
                    isSelected && "!bg-primary/[0.06] dark:!bg-primary/[0.08]",
                    rowClassName?.(row.original),
                  )}
                >
                  {/* Main row */}
                  <div
                    role={onRowClick ? "button" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-label={onRowClick && rowLabel ? rowLabel(row.original) : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onRowClick(row.original);
                      }
                    }}
                    className={cn(
                      "grid gap-4 px-6 py-4 transition-colors text-[14px]",
                      onRowClick &&
                        "cursor-pointer hover:bg-foreground/[0.03] dark:hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                    )}
                    style={{ gridTemplateColumns: gridTemplate, minWidth: tableMinWidth }}
                  >
                    {bulkActions && (
                      <div
                        className="min-w-0 flex items-center"
                        style={{ width: 44 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) => row.toggleSelected(!!value)}
                          aria-label="Выбрать строку"
                        />
                      </div>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="min-w-0 flex items-center overflow-hidden">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                    {renderExpanded && (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={isExpanded ? "Свернуть" : "Раскрыть"}
                        aria-expanded={isExpanded}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(rowId);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpanded(rowId);
                          }
                        }}
                        className="flex items-center justify-center min-w-0 cursor-pointer hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06] rounded-md transition-colors"
                        style={{ width: 36 }}
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expanded panel */}
                  <AnimatePresence initial={false}>
                    {renderExpanded && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-6 py-4 border-t border-foreground/[0.06] dark:border-white/[0.06]">
                          {renderExpanded(row.original)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-20 text-center flex flex-col items-center gap-4">
              <p className="text-[14px] text-muted-foreground">{emptyMessage}</p>
              {emptyAction}
            </div>
          )}
        </div>

        {/* Pagination */}
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

      {bulkActions && selectedRows.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-foreground text-background px-4 py-2 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-[13px] tabular-nums">
            {selectedRows.length}{" "}
            {pluralize(selectedRows.length, ["выбран", "выбраны", "выбрано"])}
          </span>
          <div className="h-4 w-px bg-background/30" />
          <div className="flex items-center gap-1">
            {bulkActions(selectedRows, () => table.toggleAllRowsSelected(false))}
          </div>
          <div className="h-4 w-px bg-background/30" />
          <button
            type="button"
            onClick={() => table.toggleAllRowsSelected(false)}
            className="rounded-full p-0.5 hover:bg-background/10 transition-colors"
            aria-label="Снять выделение"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </>
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
