"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Edit, Trash2 } from "lucide-react";

import type { ComplianceScenario } from "@/lib/mock";
import { useMockData } from "@/lib/mock";
import { Block } from "@/components/ext/block";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { formatDateTime } from "@/lib/format";

const TYPE_LABEL = { client: "Клиентский", group: "Групповой", embedded: "Встроенный" } as const;
const STATUS_LABEL = { active: "Активен", paused: "На паузе", draft: "Черновик" } as const;
const STATUS_TONE = { active: "success", paused: "warning", draft: "muted" } as const;

export function WorkflowIdentity({ sc, sequentialId }: { sc: ComplianceScenario; sequentialId: string }) {
  const data = useMockData();
  const author = data.users.find((u) => u.id === sc.authorId)?.fullName ?? sc.authorId;
  const steps = sc.pipeline?.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <Block>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[10px] font-semibold tracking-[0.4px] text-muted-foreground uppercase">Сценарий</span>
            <h2 className="font-heading text-[16px] font-bold leading-tight tracking-[-0.02em]">{sc.name}</h2>
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge tone="muted">{TYPE_LABEL[sc.type]}</StatusBadge>
              <StatusBadge tone={STATUS_TONE[sc.status]}>{STATUS_LABEL[sc.status]}</StatusBadge>
            </div>
            <span className="font-mono text-xs text-muted-foreground">#{sequentialId}</span>
          </div>

          <div className="flex flex-col gap-2.5 rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
            <Row label="Автор" value={author} />
            <Row label="Шагов" value={steps} />
            <Row label="Запусков" value={sc.triggerCount} />
            {sc.lastRunAt ? <Row label="Последний запуск" value={formatDateTime(sc.lastRunAt)} /> : null}
          </div>

          <div className="flex flex-col gap-2.5">
            <Button asChild size="lg" className="w-full justify-center">
              <Link href={`/workflows/builder?id=${sc.id}`}>
                <Edit className="size-4" />
                Редактировать
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full justify-center" onClick={() => toast.success("Сценарий клонирован")}>
              <Copy className="size-4" />
              Клонировать
            </Button>
            <Button variant="ghost" size="lg" className="w-full justify-center bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/15 hover:text-risk-critical">
              <Trash2 className="size-4" />
              Удалить
            </Button>
          </div>
        </div>
      </Block>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  );
}
