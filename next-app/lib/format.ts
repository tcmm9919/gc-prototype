import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const KZT_FORMATTER = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

const KZT_COMPACT = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  notation: "compact",
  maximumFractionDigits: 1,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("ru-KZ", { maximumFractionDigits: 2 });

export function formatKZT(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) return KZT_COMPACT.format(amount).replace("KZT", "₸").replace(/\s+/g, " ");
  return KZT_FORMATTER.format(amount).replace("KZT", "₸").replace(/\s+/g, " ");
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("ru-KZ", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${NUMBER_FORMATTER.format(amount)} ${currency}`;
  }
}

export function formatNumber(n: number): string {
  return NUMBER_FORMATTER.format(n);
}

export function formatDate(iso: string, fmt = "dd.MM.yyyy"): string {
  return format(new Date(iso), fmt, { locale: ru });
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "dd.MM.yyyy HH:mm", { locale: ru });
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ru });
}

export function maskIIN(iin?: string): string {
  if (!iin) return "—";
  return `${iin.slice(0, 6)} ${iin.slice(6, 9)} ${iin.slice(9)}`;
}

export function initialsFromName(name: string): string {
  const parts = name.replace(/«|»/g, "").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase();
}

/** «через 3 ч 20 м» / «через 2 дн» / «просрочено на 1 ч». Для SLA-дедлайнов. */
export function formatRelativeFuture(iso?: string): string {
  if (!iso) return "—";
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  const abs = Math.abs(mins);
  const fmt = (m: number) => {
    if (m < 60) return `${m} м`;
    if (m < 48 * 60) {
      const h = Math.floor(m / 60);
      const r = m % 60;
      return r === 0 ? `${h} ч` : `${h} ч ${r} м`;
    }
    return `${Math.round(m / (24 * 60))} дн`;
  };
  return mins >= 0 ? `через ${fmt(abs)}` : `просрочено на ${fmt(abs)}`;
}

/** Красная зона SLA: меньше часа до дедлайна или уже просрочен. */
export function isDeadlineUrgent(iso?: string): boolean {
  if (!iso) return false;
  return (new Date(iso).getTime() - Date.now()) / 60000 < 60;
}
