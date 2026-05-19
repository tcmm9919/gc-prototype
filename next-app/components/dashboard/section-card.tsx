import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SectionTone = "primary" | "danger" | "warning" | "muted" | "info" | "success";

interface SectionCardProps {
  icon?: LucideIcon;
  iconTone?: SectionTone;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Тонкая акцентная рамка карточки целиком (для критичных блоков). */
  accentBorder?: SectionTone;
  contentClassName?: string;
}

const TONE_BG: Record<SectionTone, string> = {
  primary: "bg-primary/15 text-primary",
  danger: "bg-risk-critical/15 text-risk-critical",
  warning: "bg-risk-medium/15 text-risk-medium",
  success: "bg-risk-low/15 text-risk-low",
  info: "bg-primary/15 text-primary",
  muted: "bg-muted text-muted-foreground",
};

const ACCENT_BORDER: Record<SectionTone, string> = {
  primary: "border-primary/25",
  danger: "border-risk-critical/25",
  warning: "border-risk-medium/25",
  success: "border-risk-low/25",
  info: "border-primary/25",
  muted: "",
};

/**
 * Унифицированная секционная карточка для dashboard и других модулей.
 * Стандартизирует: иконка-тайл + заголовок + подзаголовок + правый action.
 * Заменяет ручные CardHeader-шаблоны по проекту.
 */
export function SectionCard({
  icon: Icon,
  iconTone = "muted",
  title,
  subtitle,
  action,
  children,
  className,
  accentBorder,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn(accentBorder ? ACCENT_BORDER[accentBorder] : null, className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md",
                TONE_BG[iconTone],
              )}
            >
              <Icon className="size-4" />
            </div>
          ) : null}
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="flex shrink-0 items-center gap-1">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("space-y-1.5", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
