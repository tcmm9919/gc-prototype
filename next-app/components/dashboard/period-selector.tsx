"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type DashboardPeriod = "1d" | "7d" | "30d" | "90d";

export const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const OPTIONS: Array<{ key: DashboardPeriod; label: string; short: string }> = [
  { key: "1d", label: "Сегодня", short: "Сегодня" },
  { key: "7d", label: "7 дней", short: "7 дн." },
  { key: "30d", label: "30 дней", short: "30 дн." },
  { key: "90d", label: "90 дней", short: "90 дн." },
];

const DEFAULT_PERIOD: DashboardPeriod = "7d";

export function usePeriod(): DashboardPeriod {
  const params = useSearchParams();
  const raw = (params?.get("period") ?? "") as DashboardPeriod;
  return PERIOD_DAYS[raw] ? raw : DEFAULT_PERIOD;
}

export function PeriodSelector({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = usePeriod();

  const set = (next: DashboardPeriod) => {
    const sp = new URLSearchParams(params?.toString() ?? "");
    if (next === DEFAULT_PERIOD) sp.delete("period");
    else sp.set("period", next);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : (pathname ?? "/"));
  };

  return (
    <div
      role="tablist"
      aria-label="Период"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 text-sm",
        className,
      )}
    >
      {OPTIONS.map((o) => {
        const active = o.key === current;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => set(o.key)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition",
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
