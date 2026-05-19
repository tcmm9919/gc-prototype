"use client";

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
  skeleton?: "table" | "list" | "detail";
  children: React.ReactNode;
}

/**
 * Renders the correct state based on ?state= URL param.
 * Default: render children (data state).
 */
export function StateSwitch({
  emptyTitle = "Здесь пока пусто",
  emptyDescription = "Данные появятся по мере работы платформы.",
  emptyAction,
  skeleton = "table",
  children,
}: StateSwitchProps) {
  const state = useStateParam();
  if (state === "loading") {
    return skeleton === "list" ? <ListSkeleton /> : skeleton === "detail" ? <DetailSkeleton /> : <TableSkeleton />;
  }
  if (state === "empty") return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  if (state === "error") return <ErrorState />;
  return <>{children}</>;
}
