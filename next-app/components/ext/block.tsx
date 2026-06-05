"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BlockProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
}

/**
 * Block — основная контентная карточка детальных страниц.
 * rounded-2xl + bg-white, без border'ов, единый aesthetic с таблицами.
 */
export function Block({ title, actions, children, className, dense }: BlockProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card",
        dense ? "p-4" : "p-6",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title && (
            <h3 className="font-heading text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface DetailHeaderProps {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * DetailHeader — header-блок детальной страницы (avatar + title + badges + actions).
 * Замена EntityHeader для страниц в новом стиле.
 */
export function DetailHeader({
  avatar,
  title,
  subtitle,
  badges,
  actions,
  className,
}: DetailHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        {avatar ? <div className="shrink-0">{avatar}</div> : null}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground truncate">
              {title}
            </h1>
            {badges}
          </div>
          {subtitle ? (
            <p className="text-[13px] text-muted-foreground truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
