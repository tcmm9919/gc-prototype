"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatePageShell } from "@/components/ext/create-page-shell";

const MODELS = [
  "yandexgpt-5.1/latest",
  "deepseek-v32/latest",
  "gpt-oss-120b/latest",
  "qwen3-235b-a22b-fp8/latest",
  "gemma-3-27b-it/latest",
];

export default function Page() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [model, setModel] = React.useState(MODELS[0]);
  const [instructions, setInstructions] = React.useState("");
  const [enabled, setEnabled] = React.useState(true);

  return (
    <CreatePageShell
      breadcrumbs={[
        { label: "Агенты", href: "/ai/agents" },
        { label: "Новый агент" },
      ]}
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Агент создан");
        router.push("/ai/agents");
      }}
      footer={
        <>
          <Button type="button" variant="outline" asChild>
            <Link href="/ai/agents">Отмена</Link>
          </Button>
          <Button type="submit">Создать агента</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Идентификация */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="agent-name">
            Название <span className="text-destructive">*</span>
          </Label>
          <Input
            id="agent-name"
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="напр. Агент по верификации источников дохода"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="agent-desc">Описание</Label>
          <Input
            id="agent-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Кратко: что делает агент"
          />
        </div>

        {/* Конфигурация */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="agent-model">Модель</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="agent-model" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m} value={m}>
                  <span className="font-mono text-xs">{m}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Поведение */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="agent-instructions">Инструкция для LLM-агента</Label>
          <Textarea
            id="agent-instructions"
            rows={10}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Системный промпт: роль, процесс, ограничения…"
            className="resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Поддерживается Markdown. Опишите роль агента, шаги обработки и ограничения.
          </p>
        </div>

        {/* Состояние */}
        <div className="flex items-center gap-3 border-t border-border pt-5">
          <Switch id="agent-enabled" checked={enabled} onCheckedChange={setEnabled} />
          <Label htmlFor="agent-enabled" className="cursor-pointer">
            Агент включён
          </Label>
        </div>
      </div>
    </CreatePageShell>
  );
}
