"use client";

import * as React from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ext/page-header";

const AGENTS = [
  {
    id: "income-verification",
    name: "Агент по верификации источников дохода",
    description: "Верификация источников дохода для KYC/AML",
    instruction:
      "Анализирует справки о доходах, выписки с зарплатных счетов и сопоставляет с заявленным declared_monthly_income. Возвращает структурированный JSON с полем confidence.",
  },
  {
    id: "brief-report",
    name: "Агент кратких отчётов о соответствии",
    description: "Формирует краткий отчёт о соблюдении требований, используя данные скрининга и скоринга",
    instruction:
      "На вход — итог скрининга + риск-скор + EDD-флаги. На выход — компактный отчёт на 1 страницу с разделами: Резюме / Найденное / Рекомендация.",
  },
  {
    id: "risk-description",
    name: "Агент по описанию рисков",
    description: "Формирует подробное описание рисков для регуляторной отчётности",
    instruction:
      "Производит развёрнутый текст по риск-факторам клиента в стиле, пригодном для регулятора. Учитывает контекст: страна, продукт, поведение, новостные источники.",
  },
];

export default function Page() {
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <PageHeader
        title="Агенты"
        actions={
          <Button>
            <Plus className="size-4" />
            Новый агент
          </Button>
        }
      />
      <div className="px-6 pb-12 space-y-3">
        {AGENTS.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-semibold">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="text-muted-foreground hover:text-foreground transition" aria-label="Редактировать">
                    <Edit className="size-4" />
                  </button>
                  <button className="text-muted-foreground hover:text-destructive transition" aria-label="Удалить">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(a.id)}
                className="text-sm text-primary mt-2 hover:underline inline-flex items-center gap-1"
              >
                <span className={`inline-block transition ${openIds.has(a.id) ? "rotate-90" : ""}`}>▶</span>
                Показать инструкцию
              </button>
              {openIds.has(a.id) ? (
                <div className="mt-2 rounded-md bg-muted/40 p-3 text-sm whitespace-pre-wrap">{a.instruction}</div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
