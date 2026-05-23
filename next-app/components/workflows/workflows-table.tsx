"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockData, type ComplianceScenario } from "@/lib/mock";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ext/status-badge";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU");
}

function workflowsByType(all: ComplianceScenario[], type: "client" | "group"): ComplianceScenario[] {
  return all.filter((s) => s.type === type);
}

function WorkflowsTab({
  data,
  emptyText,
  description,
}: {
  data: ComplianceScenario[];
  emptyText: string;
  description: string;
}) {
  return (
    <Card className="overflow-hidden">
      <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">{description}</p>
      <div className="grid grid-cols-[80px_1fr_140px_140px_60px] gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>ID</span>
        <span>Название</span>
        <span>Тип</span>
        <span>Создано</span>
        <span></span>
      </div>
      {data.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        data.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[80px_1fr_140px_140px_60px] gap-3 border-b border-border/50 px-4 py-3 text-sm last:border-b-0 hover:bg-muted/40 transition"
          >
            <Link href={`/workflows/${s.id}`} className="font-mono text-xs text-muted-foreground hover:text-primary">
              #{s.id.replace(/^SC-?/, "")}
            </Link>
            <Link href={`/workflows/${s.id}`} className="font-medium hover:underline">
              {s.name}
            </Link>
            <span>
              <StatusBadge tone="info">Клиентский</StatusBadge>
            </span>
            <span className="tabular-nums text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
            <button type="button" className="text-muted-foreground hover:text-destructive transition" aria-label="Удалить">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))
      )}
    </Card>
  );
}

export function WorkflowsTable() {
  const data = useMockData();
  const clientWorkflows = workflowsByType(data.scenarios, "client");

  return (
    <Tabs defaultValue="client" className="px-6 pb-12">
      <div className="flex items-center justify-between gap-3 mb-4">
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="client">Клиентский</TabsTrigger>
          <TabsTrigger value="group" disabled title="В разработке">
            Групповой
          </TabsTrigger>
          <TabsTrigger value="embedded" disabled title="В разработке">
            Встроенный
          </TabsTrigger>
        </TabsList>
        <Button asChild size="xl">
          <Link href="/workflows/builder">
            <Plus className="size-4" />
            Создать
          </Link>
        </Button>
      </div>

      <TabsContent value="client" className="m-0">
        <WorkflowsTab
          data={clientWorkflows}
          description="Сценарий запускается по одному клиенту"
          emptyText="Сценариев нет — создайте первый."
        />
      </TabsContent>
      <TabsContent value="group" className="m-0">
        <p className="text-sm text-muted-foreground">В разработке.</p>
      </TabsContent>
      <TabsContent value="embedded" className="m-0">
        <p className="text-sm text-muted-foreground">В разработке.</p>
      </TabsContent>
    </Tabs>
  );
}
