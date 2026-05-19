import { cn } from "@/lib/utils";
import { formatCurrency, formatKZT } from "@/lib/format";

interface MoneyKZTProps {
  amount: number;
  compact?: boolean;
  className?: string;
}

export function MoneyKZT({ amount, compact, className }: MoneyKZTProps) {
  return <span className={cn("tabular-nums", className)}>{formatKZT(amount, { compact })}</span>;
}

interface MoneyProps {
  amount: number;
  currency: string;
  amountKZT?: number;
  className?: string;
}

export function Money({ amount, currency, amountKZT, className }: MoneyProps) {
  const isKZT = currency === "KZT";
  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}>
      <span className="font-medium">{formatCurrency(amount, currency)}</span>
      {!isKZT && amountKZT !== undefined ? (
        <span className="text-xs text-muted-foreground">≈ {formatKZT(amountKZT)}</span>
      ) : null}
    </span>
  );
}
