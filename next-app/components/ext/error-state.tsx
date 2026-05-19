"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Что-то пошло не так",
  description = "Попробуйте обновить страницу. Если проблема повторится — напишите в поддержку.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 px-6 py-20 text-center", className)}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -m-3 rounded-full bg-risk-critical/8 blur-2xl" aria-hidden />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-risk-critical/30 bg-background text-risk-critical shadow-sm">
          <AlertCircle className="size-7" />
        </div>
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h2 className="font-heading text-lg font-medium text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RotateCw className="size-4" />
          Попробовать снова
        </Button>
      ) : null}
    </div>
  );
}
