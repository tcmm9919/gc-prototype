import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Two-column form row: label + helper on the left, control on the right.
 * Stacks on mobile. Children slot accepts any form control (Input, Select,
 * Textarea, Switch, etc.). Wrap multiple inside a Card or a SectionHeader.
 */
export function LabelledField({
  label,
  helper,
  htmlFor,
  children,
  className,
  align = "start",
}: {
  label: React.ReactNode;
  helper?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 border-b border-border py-4 last:border-0 md:grid-cols-[220px_1fr] md:gap-6",
        align === "center" ? "md:items-center" : "md:items-start",
        className,
      )}
    >
      <div className="min-w-0">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {helper ? (
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
