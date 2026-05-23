"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ExpandedPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-[13px]">
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-2 min-w-0", className)}>
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="font-medium min-w-0 truncate">{children}</span>
    </div>
  );
}

export function ExpandedActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-foreground/[0.06] dark:border-white/[0.06]">
      {children}
    </div>
  );
}
