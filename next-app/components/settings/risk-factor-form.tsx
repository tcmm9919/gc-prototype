"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe, ShieldAlert, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";

import type { RiskFactor } from "@/lib/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { StatusBadge } from "@/components/ext/status-badge";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<RiskFactor["category"], { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  geo: { label: "География", icon: Globe, description: "Страна, юрисдикция, гео-связи" },
  client: { label: "Клиент", icon: User, description: "Профильные характеристики клиента (PEP, санкции и т.п.)" },
  behavior: { label: "Поведение", icon: ShieldAlert, description: "Транзакционные паттерны, аномалии" },
  product: { label: "Продукт", icon: ShoppingBag, description: "Тип используемых продуктов / каналов" },
};

interface Props {
  factor?: RiskFactor;
}

export function RiskFactorForm({ factor }: Props) {
  const router = useRouter();
  const isNew = !factor;

  const [name, setName] = React.useState(factor?.name ?? "");
  const [description, setDescription] = React.useState(factor?.description ?? "");
  const [category, setCategory] = React.useState<RiskFactor["category"]>(factor?.category ?? "geo");
  const [weight, setWeight] = React.useState<number>(factor?.weight ?? 20);

  const meta = CATEGORY_META[category];

  return (
    <div className="grid gap-4 py-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Основные параметры</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="rf-name">Название</Label>
              <Input
                id="rf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Напр. Страна высокого риска"
              />
              <p className="text-xs text-muted-foreground">
                Короткое имя фактора, как оно появится в скоринге и правилах.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="rf-desc">Описание</Label>
              <Textarea
                id="rf-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Кратко: когда срабатывает, на что влияет."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Категория</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as RiskFactor["category"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_META) as RiskFactor["category"][]).map((c) => {
                    const m = CATEGORY_META[c];
                    const Icon = m.icon;
                    return (
                      <SelectItem key={c} value={c}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-3.5" />
                          {m.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rf-weight">Вес</Label>
              <Input
                id="rf-weight"
                type="number"
                min={1}
                max={100}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">От 1 до 100. Прибавляется к итоговому риск-скору клиента.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Где будет использоваться</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <CheckRow defaultOn label="Учитывать в формуле итогового риск-уровня клиента" />
            <CheckRow defaultOn label="Доступен в конструкторе сценариев как условие" />
            <CheckRow label="Применять к историческим данным при backfill" />
            <CheckRow label="Эскалировать кейс автоматически при срабатывании" />
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Превью</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={cn("size-10 shrink-0 rounded-lg bg-muted text-muted-foreground flex items-center justify-center")}>
                <meta.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-medium block truncate">{name || "Без названия"}</span>
                <span className="text-xs text-muted-foreground">{meta.description}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <StatusBadge tone="muted">{meta.label}</StatusBadge>
              <span className="font-mono text-sm font-medium tabular-nums">
                <motion.span key={weight} initial={{ scale: 1.15, color: "var(--primary)" }} animate={{ scale: 1, color: "var(--foreground)" }} transition={{ duration: 0.25 }}>
                  +{weight}
                </motion.span>
              </span>
            </div>
            <AnimatedProgress value={Math.min(weight, 100)} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              Скоринг считается линейно от суммы весов сработавших факторов. 100 = критический.
            </p>
          </CardContent>
        </Card>
      </aside>

      <div className="lg:col-span-2 flex items-center justify-between gap-2 pt-2">
        <p className="text-xs text-muted-foreground">
          {isNew ? "Фактор появится в скоринге сразу после сохранения." : "Изменения применяются ко всем сценариям, использующим этот фактор."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/settings/risk-factors")}>
            Отмена
          </Button>
          <Button size="lg" onClick={() => router.push("/settings/risk-factors")}>
            {isNew ? "Создать фактор" : "Сохранить изменения"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 cursor-pointer hover:bg-muted/40">
      <input type="checkbox" className="size-4 rounded border-border accent-primary" defaultChecked={defaultOn} />
      <span>{label}</span>
    </label>
  );
}
