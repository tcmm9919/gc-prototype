"use client";

import * as React from "react";
import { toast } from "sonner";

import type { RiskFactor } from "@/lib/mock";
import { StateSwitch } from "@/components/ext/state-switch";
import { RiskFactorsList } from "@/components/settings/risk-factors-list";
import { RiskFactorForm } from "@/components/settings/risk-factor-form";

export default function Page() {
  const [editing, setEditing] = React.useState<RiskFactor | "new" | null>(null);
  const close = () => setEditing(null);

  return (
    <>
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
        <RiskFactorsList onEdit={(f) => setEditing(f)} onAdd={() => setEditing("new")} />
      </StateSwitch>
    </>
  );
}
