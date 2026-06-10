"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { History, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMockStore } from "@/lib/mock/store";
import { scenarioLabels, scenarioPresets } from "@/lib/mock/scenarios";
import type { MockState, ScenarioPreset } from "@/lib/mock/types";

const STATE_OPTIONS: Array<{ key: MockState; label: string; short: string }> = [
  { key: "data", label: "Данные", short: "D" },
  { key: "loading", label: "Загрузка", short: "L" },
  { key: "empty", label: "Пусто", short: "E" },
  { key: "error", label: "Ошибка", short: "R" },
];

export function DevToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const scenario = useMockStore((s) => s.scenario);
  const setScenario = useMockStore((s) => s.setScenario);
  const currentState: MockState = ((params?.get("state") as MockState) ?? "data");

  const setState = (state: MockState) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (state === "data") next.delete("state");
    else next.set("state", state);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="pointer-events-auto h-9 gap-1.5 rounded-full border-dashed bg-background/80 shadow-sm backdrop-blur"
          >
            <Wrench className="size-3.5" />
            <span className="font-mono text-xs">{currentState[0].toUpperCase()}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs">{scenarioLabels[scenario]}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-72">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Состояние страницы</span>
              <div className="grid grid-cols-4 gap-1">
                {STATE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.key}
                    size="sm"
                    variant={currentState === opt.key ? "default" : "outline"}
                    onClick={() => setState(opt.key)}
                    className={cn("h-8 flex-col gap-0 px-1 text-[11px]")}
                    title={opt.label}
                  >
                    <span className="font-mono text-xs leading-none">{opt.short}</span>
                    <span className="leading-none">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Mock-сценарий</span>
              <Select value={scenario} onValueChange={(v) => setScenario(v as ScenarioPreset)}>
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(scenarioPresets) as ScenarioPreset[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {scenarioLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full justify-start gap-2"
              onClick={() => {
                router.push("/styleguide/dashboard-legacy");
              }}
            >
              <History className="size-3.5 text-muted-foreground" />
              Старый дашборд
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Переключатель видим только в dev-режиме. ⌘K — поиск и быстрый переход.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
