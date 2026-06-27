import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ext/status-badge";
import { cn } from "@/lib/utils";

/* ───────────────────────────── types ───────────────────────────── */

export interface DocSection {
  /** Якорь для TOC, напр. "overview" */
  id: string;
  /** Порядковый номер «01», «02»… */
  num: string;
  title: string;
  /** Короткая подпись справа от номера (опц.), напр. «Group Normalization» */
  kicker?: string;
  body: React.ReactNode;
}

interface ModelDocProps {
  /** Надзаголовок, напр. «ДОКУМЕНТАЦИЯ · TSAD» */
  eyebrow: string;
  title: string;
  version: string;
  updated: string;
  /** Короткий слоган под заголовком */
  tagline: string;
  description: string;
  status?: "production" | "experimental" | "deprecated";
  owner?: string;
  stack: string[];
  stats: { value: string; label: string }[];
  sections: DocSection[];
}

const STATUS_LABEL = { production: "В продакшене", experimental: "Экспериментальная", deprecated: "Устарела" } as const;
const STATUS_TONE = { production: "success", experimental: "warning", deprecated: "muted" } as const;

/* ───────────────────────────── shell ───────────────────────────── */

export function ModelDoc({
  eyebrow,
  title,
  version,
  updated,
  tagline,
  description,
  status = "production",
  owner,
  stack,
  stats,
  sections,
}: ModelDocProps) {
  return (
    <div className="pb-10 pt-5">
      <Link
        href="/instructions"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Назад к каталогу
      </Link>

      {/* Hero */}
      <header className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{eyebrow}</span>
            <StatusBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</StatusBadge>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[28px]">{title}</h1>
            <p className="text-sm font-medium text-muted-foreground">{tagline}</p>
          </div>
          <p className="max-w-[72ch] text-sm leading-relaxed text-muted-foreground">{description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span>
              Версия <span className="font-mono text-foreground">{version}</span>
            </span>
            <span>
              Обновлено <span className="text-foreground">{updated}</span>
            </span>
            {owner ? (
              <span>
                Владелец <span className="text-foreground">{owner}</span>
              </span>
            ) : null}
          </div>

          {/* KPI stats */}
          {stats.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-2xl">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-foreground/[0.03] px-4 py-3 dark:bg-white/[0.03]">
                  <div className="font-heading text-2xl font-bold tabular-nums text-foreground">{s.value}</div>
                  <div className="mt-0.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          ) : null}

          <DocChips items={stack} />
        </div>
      </header>

      {/* Body + TOC */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="mb-4 flex items-baseline gap-3">
                <span className="font-mono text-xs font-semibold text-primary">{s.num}</span>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h2 className="font-heading text-[17px] font-semibold tracking-[-0.01em] text-foreground">{s.title}</h2>
                  {s.kicker ? <span className="text-xs text-muted-foreground">· {s.kicker}</span> : null}
                </div>
              </div>
              <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">{s.body}</div>
            </section>
          ))}
        </div>

        {/* TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 flex flex-col gap-1 border-l border-border pl-4">
            <span className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">На этой странице</span>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="truncate py-0.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

/* ─────────────────────────── primitives ────────────────────────── */

/** Параграф */
export function DocP({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

/** Чипы стека/тегов */
export function DocChips({ items, label }: { items: string[]; label?: string }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {label ? <span className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">{label}</span> : null}
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="rounded-md bg-foreground/[0.05] px-2 py-1 font-mono text-xs text-foreground dark:bg-white/[0.05]">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Таблица: заголовки + строки ячеек */
export function DocTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-foreground/[0.02] dark:bg-white/[0.02]">
            {head.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase first:pl-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-border/60 last:border-0">
              {r.map((cell, ci) => (
                <td key={ci} className={cn("px-3 py-2 align-top first:pl-4", ci === 0 ? "text-foreground" : "text-muted-foreground")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Список определений «поле — тип — описание» */
export function DocDefs({ items }: { items: { term: string; type?: string; desc: string }[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li key={it.term} className="rounded-lg bg-foreground/[0.03] px-3 py-2 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-baseline gap-2">
            <code className="font-mono text-xs font-medium text-foreground">{it.term}</code>
            {it.type ? <span className="text-[11px] text-muted-foreground/80">{it.type}</span> : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{it.desc}</p>
        </li>
      ))}
    </ul>
  );
}

/** Нумерованный пайплайн шагов */
export function DocSteps({ steps }: { steps: { n?: string; title: string; desc: string }[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3 rounded-xl bg-foreground/[0.03] px-3 py-2.5 dark:bg-white/[0.03]">
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-medium text-primary">
            {s.n ?? i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <code className="font-mono text-[13px] font-medium text-foreground">{s.title}</code>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Горизонтальный поток стадий: A → B → C */
export function DocPipeline({ stages }: { stages: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.map((st, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-foreground/[0.03] px-2.5 py-1 font-mono text-xs text-foreground dark:bg-white/[0.03]">
            {st}
          </span>
          {i < stages.length - 1 ? <span className="text-muted-foreground/50">→</span> : null}
        </span>
      ))}
    </div>
  );
}

/** Блок кода/диаграммы (моноширинный, со скроллом) */
export function DocCode({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-foreground/[0.03] p-4 font-mono text-xs leading-relaxed text-muted-foreground dark:bg-white/[0.03]">
      {children}
    </pre>
  );
}

/** Выделенный поясняющий блок */
export function DocCallout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4">
      <p className="mb-1 text-xs font-semibold text-foreground">{title}</p>
      <div className="text-xs text-muted-foreground">{children}</div>
    </div>
  );
}

/** Подзаголовок внутри секции */
export function DocLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground/80 uppercase">{children}</p>;
}
