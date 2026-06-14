"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Detail (breadcrumb) routes — keep in sync with DETAIL_PARENTS / RESERVED_SUB in app-header.tsx.
// On these pages the header renders breadcrumbs instead of a title, and the canvas
// uses a distinct neutral grey (--background-detail).
const DETAIL_PARENTS = new Set(["clients", "alerts", "cases", "transactions", "rules", "workflows"]);
const RESERVED_SUB = new Set(["new", "builder"]);

function isDetailRoute(pathname: string): boolean {
  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const segments = normalized.split("/").filter(Boolean);
  const parentKey = segments[0];
  const idSeg = segments[1];
  return Boolean(parentKey && DETAIL_PARENTS.has(parentKey) && idSeg && !RESERVED_SUB.has(idSeg));
}

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const detail = isDetailRoute(pathname);

  return (
    <main
      className={cn(
        "flex-1 min-w-0 min-h-0 overflow-y-auto [scrollbar-gutter:stable]",
        detail && "bg-detail-canvas",
      )}
    >
      {children}
    </main>
  );
}
