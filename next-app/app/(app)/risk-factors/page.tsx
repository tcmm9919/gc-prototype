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

  // Форма ИЛИ список — не оба сразу, чтобы на экране был ровно один primary CTA.
  if (editing !== null) {
    return (
      <RiskFactorForm
        factor={editing === "new" ? undefined : editing}
        onCancel={close}
        onDone={() => {
          toast.success(editing === "new" ? "Фактор создан" : "Изменения сохранены");
          close();
        }}
      />
    );
  }

  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="Риск-факторов нет"
      emptyDescription="Создайте первый атрибут — нажмите «Добавить атрибут»."
      emptyAction={
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Добавить атрибут
        </Button>
      }
    >
      <RiskFactorsList onEdit={(f) => setEditing(f)} onAdd={() => setEditing("new")} />
    </StateSwitch>
  );
}
