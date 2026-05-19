"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RiskAttribute {
  id: string;
  name: string;
  type: "txn" | "media" | "custom";
  source: string;
  buckets: string;
  weight: number;
  active: boolean;
}

export default function Page() {
  const [attributes] = React.useState<RiskAttribute[]>([]);

  return (
    <>
      <PageHeader
        title="Настройки"
        description="Риск-факторы · Динамические факторы риска"
      />
      <div className="px-6 pb-12 space-y-4">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground max-w-3xl">
              Динамические факторы риска. Добавляются к статическим (<code className="font-mono text-xs">txn</code>,{" "}
              <code className="font-mono text-xs">media</code>); итоговый балл — взвешенное среднее, нормализованное по
              сумме весов. Системные атрибуты можно редактировать и отключать, но не удалять.
            </p>
            <Button size="sm">
              <Plus className="size-4" />
              Добавить атрибут
            </Button>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_80px_100px_100px] gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Название</span>
            <span>Тип</span>
            <span>Источник</span>
            <span>Корзины</span>
            <span>Вес</span>
            <span>Активен</span>
            <span>Действия</span>
          </div>

          {attributes.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Атрибутов пока нет — нажмите «Добавить атрибут».
            </div>
          ) : (
            attributes.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[1.5fr_1fr_1.5fr_1fr_80px_100px_100px] gap-3 border-b border-border/50 px-4 py-3 text-sm last:border-b-0"
              >
                <span className="font-medium">{a.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{a.type}</span>
                <span className="text-xs text-muted-foreground">{a.source}</span>
                <span className="text-xs text-muted-foreground">{a.buckets}</span>
                <span className="tabular-nums text-xs">{a.weight}</span>
                <span className="text-xs">{a.active ? "Да" : "Нет"}</span>
                <span />
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}
