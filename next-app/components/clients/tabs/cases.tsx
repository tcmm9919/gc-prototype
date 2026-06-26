"use client";

import Link from "next/link";
import { Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useMockData, type Case } from "@/lib/mock";
import { StatusBadge } from "@/components/ext/status-badge";
import { EmptyState } from "@/components/ext/empty-state";
import { RelativeTime } from "@/components/ext/relative-time";
import { usePaged, PagerFooter } from "@/components/ext/pager";

const STATUS_LABEL: Record<Case["status"], string> = {
  open: "Открыто", in_progress: "В работе", in_review: "На проверке", escalated: "Эскалировано", resolved: "Решено", closed: "Закрыто",
};
const STATUS_TONE: Record<Case["status"], "info" | "warning" | "success" | "danger" | "muted"> = {
  open: "info", in_progress: "warning", in_review: "info", escalated: "danger", resolved: "success", closed: "muted",
};
const PRIORITY_LABEL: Record<Case["priority"], string> = {
  low: "Низкий", medium: "Средний", high: "Высокий", critical: "Критический",
};

export function ClientCases({ clientId }: { clientId: string }) {
  const data = useMockData();
  const cases = data.cases.filter((c) => c.clientId === clientId);
  const paged = usePaged(cases, 12);

  if (cases.length === 0) {
    return (
      <EmptyState icon={<Folder className="size-6" />} title="Связанных кейсов нет" description="Расследования будут привязаны сюда." />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
        {paged.pageItems.map((c, idx) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03, duration: 0.2 }}
        >
          <Link
            href={`/cases/${c.id}`}
            className="block rounded-xl border border-border bg-card hover:bg-foreground/[0.02] dark:hover:bg-white/[0.06] px-4 py-3 transition-colors"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{c.type}</span>
                <StatusBadge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</StatusBadge>
                <StatusBadge tone="muted">Приоритет: {PRIORITY_LABEL[c.priority]}</StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              <span className="text-xs text-muted-foreground font-mono">
                {c.id} · открыт <RelativeTime iso={c.openedAt} /> · SLA до <RelativeTime iso={c.slaDueAt} />
              </span>
            </div>
          </Link>
        </motion.div>
        ))}
      </div>
      <div className="shrink-0 border-t border-border/60 pt-2">
        <PagerFooter
          page={paged.page}
          pageCount={paged.pageCount}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          pageSize={paged.pageSize}
          onPage={paged.setPage}
          onPageSize={paged.setPageSize}
          unit="кейсов"
        />
      </div>
    </div>
  );
}
