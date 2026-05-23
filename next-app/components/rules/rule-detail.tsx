"use client";

import * as React from "react";
import { Copy, Download, Pencil, X } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { DetailHeader } from "@/components/ext/block";
import { StatusBadge } from "@/components/ext/status-badge";
import { Button } from "@/components/ui/button";
import { RuleBuilder } from "./rule-builder";

export function RuleDetail({ id }: { id: string }) {
  const data = useMockData();
  const rule = data.rules.find((r) => r.id === id) ?? data.rules[0];
  const [editing, setEditing] = React.useState(false);

  if (!rule) return null;

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      <DetailHeader
        title={rule.name}
        subtitle={`${rule.id} · ${rule.description}`}
        actions={
          editing ? (
            <>
              <Button variant="outline" size="lg" onClick={() => setEditing(false)}>
                <X className="size-4" />
                Отмена
              </Button>
              <Button size="lg" onClick={() => setEditing(false)}>
                Сохранить изменения
              </Button>
            </>
          ) : (
            <>
              <StatusBadge tone={rule.enabled ? "success" : "muted"}>
                {rule.enabled ? "Включено" : "Выключено"}
              </StatusBadge>
              <Button variant="outline" size="lg">
                <Copy className="size-4" />
                Клонировать
              </Button>
              <Button variant="outline" size="lg">
                <Download className="size-4" />
                JSON
              </Button>
              <Button size="lg" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Редактировать
              </Button>
            </>
          )
        }
      />
      <RuleBuilder
        key={`${rule.id}-${editing ? "edit" : "view"}`}
        rule={rule}
        readOnly={!editing}
        onCancel={() => setEditing(false)}
        onSave={() => setEditing(false)}
      />
    </div>
  );
}
