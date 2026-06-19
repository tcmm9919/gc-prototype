"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { RiskFactor } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { StateSwitch } from "@/components/ext/state-switch";
import { RiskFactorsList } from "@/components/settings/risk-factors-list";
import { RiskFactorForm } from "@/components/settings/risk-factor-form";

export default function Page() {
  const [editing, setEditing] = React.useState<RiskFactor | "new" | null>(null);
  const close = () => setEditing(null);

  return (
    <div className="pb-12">
      {/* Описание + действие — в серой зоне над таблицей (без белого блока), кнопка напротив текста */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Динамические факторы риска поверх статических источников. Итоговый балл — взвешенное
          среднее, нормализованное по сумме весов.
        </p>
        {editing === null ? (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Добавить атрибут
          </Button>
        ) : null}
      </div>

      {editing !== null ? (
        <div className="mb-6">
          <RiskFactorForm
            factor={editing === "new" ? undefined : editing}
            onCancel={close}
            onDone={() => {
              toast.success(editing === "new" ? "Фактор создан" : "Изменения сохранены");
              close();
            }}
          />
        </div>
      ) : null}

      <StateSwitch
        skeleton="table"
        emptyTitle="Риск-факторов нет"
        emptyDescription="Создайте первый атрибут — нажмите «Добавить атрибут»."
      >
        <RiskFactorsList onEdit={(f) => setEditing(f)} />
      </StateSwitch>
    </div>
  );
}
