"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { MockState } from "@/lib/mock/types";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { TableSkeleton, ListSkeleton, DetailSkeleton } from "./skeletons";

export function useStateParam(): MockState {
  const params = useSearchParams();
  const raw = params?.get("state");
  if (raw === "empty" || raw === "loading" || raw === "error") return raw;
  return "data";
}

interface StateSwitchProps {
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeleton?: "table" | "list" | "detail" | "dashboard";
  /** Если выбран таб (?tab=...) — состояния рендерит сам таб, page-level пропускает насквозь */
  delegateToTabParam?: boolean;
  children: React.ReactNode;
}

/**
 * Renders the correct state based on ?state= URL param.
 * Default: render children (data state).
 *
 * Wraps the inner component in Suspense — required for useSearchParams
 * to work with static export. Without Suspense, Next.js static export
 * bails on prerender.
 */
export function StateSwitch(props: StateSwitchProps) {
  return (
    <Suspense fallback={<StateSwitchFallback skeleton={props.skeleton} />}>
      <StateSwitchInner {...props} />
    </Suspense>
  );
}

function StateSwitchFallback({ skeleton = "table" }: { skeleton?: "table" | "list" | "detail" | "dashboard" }) {
  if (skeleton === "list") return <ListSkeleton />;
  if (skeleton === "detail" || skeleton === "dashboard") return <DetailSkeleton />;
  return <TableSkeleton />;
}

function StateSwitchInner({
  emptyTitle = "Здесь пока пусто",
  emptyDescription = "Данные появятся по мере работы платформы.",
  emptyAction,
  skeleton = "table",
  delegateToTabParam = false,
  children,
}: StateSwitchProps) {
  const state = useStateParam();
  const params = useSearchParams();
  if (delegateToTabParam && params?.get("tab")) return <>{children}</>;
  if (state === "loading") {
    if (skeleton === "list") return <ListSkeleton />;
    if (skeleton === "detail" || skeleton === "dashboard") return <DetailSkeleton />;
    return <TableSkeleton />;
  }
  if (state === "empty") return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  if (state === "error") return <ErrorState />;
  return <>{children}</>;
}
