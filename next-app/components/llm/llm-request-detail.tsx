"use client";

import Link from "next/link";
import { Coins, MessageSquare, Zap } from "lucide-react";
import { useMockData } from "@/lib/mock";
import { EntityHeader } from "@/components/ext/entity-header";
import { StatusBadge } from "@/components/ext/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelativeTime } from "@/components/ext/relative-time";
import { formatNumber } from "@/lib/format";

export function LLMRequestDetail({ id }: { id: string }) {
  const data = useMockData();
  const req = data.llmUsage.find((r) => r.id === id) ?? data.llmUsage[0];
  if (!req) return null;

  const user = data.users.find((u) => u.id === req.userId);
  const agent = req.agentId ? data.agents.find((a) => a.id === req.agentId) : undefined;

  return (
    <>
      <EntityHeader
        avatar={
          <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Zap className="size-6" />
          </div>
        }
        title={`LLM-запрос ${req.id}`}
        subtitle={`${user?.fullName ?? req.userId} · ${req.model}`}
        badges={
          <>
            <StatusBadge tone="muted">{req.model}</StatusBadge>
            {agent ? <StatusBadge tone="info">{agent.name}</StatusBadge> : null}
          </>
        }
      />

      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="size-4" />
              Стоимость
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Стоимость</span>
              {/* в KZT по демо-курсу — согласовано со списком LLM Usage (470 ₸/$) */}
              <span className="font-medium tabular-nums">
                {new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                  req.costUSD * 470,
                )}{" "}
                ₸
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Input</span>
              <span className="tabular-nums">{formatNumber(req.inputTokens)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Output</span>
              <span className="tabular-nums">{formatNumber(req.outputTokens)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Время</span>
              <RelativeTime iso={req.timestamp} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="size-4" />
              Промпт и ответ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Промпт (превью)</span>
              <p className="mt-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 leading-relaxed">{req.promptPreview}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ответ (превью)</span>
              <p className="mt-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 leading-relaxed">{req.responsePreview}</p>
            </div>
          </CardContent>
        </Card>

        {req.relatedEntityType && req.relatedEntityId ? (
          <Card className="lg:col-span-3 border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Связанная сущность</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/${req.relatedEntityType}s/${req.relatedEntityId}`} className="text-primary hover:underline">
                {req.relatedEntityType} {req.relatedEntityId}
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
