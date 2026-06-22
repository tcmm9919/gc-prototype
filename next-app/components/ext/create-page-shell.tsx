import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Единый шелл для страниц создания сущностей.
 *
 * Узкая центрированная колонка с хлебными крошками над карточкой формы —
 * вместо «большого тайтла» PageHeader. Горизонтальные отступы берутся из
 * layout (`px-8`), поэтому здесь только центрирование + вертикальный ритм.
 *
 * - `breadcrumbs` — последний элемент рендерится как текущая страница (без ссылки).
 * - `wide` — расширяет колонку (для конструкторов, напр. правил).
 * - `footer` — экшен-бар под карточкой (правый край).
 * - `onSubmit` — если задан, карточка+футер оборачиваются в `<form>` (Enter сабмитит).
 */
export function CreatePageShell({
  breadcrumbs,
  children,
  footer,
  onSubmit,
  wide = false,
  className,
}: {
  breadcrumbs: Crumb[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  wide?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        {children}
      </div>
      {footer ? (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {footer}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full pt-6 pb-12",
        wide ? "max-w-3xl" : "max-w-xl",
        className,
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${crumb.label}-${i}`}>
                <BreadcrumbItem>
                  {isLast || !crumb.href ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast ? <BreadcrumbSeparator /> : null}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
    </div>
  );
}
