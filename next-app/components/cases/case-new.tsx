"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

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
import { useMockData } from "@/lib/mock";
import { currentUser } from "@/lib/mock/seeds";
import { CreatePageShell } from "@/components/ext/create-page-shell";

export function CaseNew() {
  const data = useMockData();
  const router = useRouter();
  const params = useSearchParams();
  const fromAlertId = params?.get("fromAlert");
  const sourceAlert = fromAlertId ? data.alerts.find((a) => a.id === fromAlertId) : undefined;

  const [name, setName] = React.useState("");
  const [priority, setPriority] = React.useState<string>(
    sourceAlert?.severity === "critical" || sourceAlert?.severity === "high"
      ? sourceAlert.severity
      : sourceAlert?.severity === "medium"
        ? "medium"
        : "low",
  );
  const [description, setDescription] = React.useState(
    sourceAlert ? `Кейс по оповещению ${sourceAlert.id} («${sourceAlert.ruleName}»).` : "",
  );

  return (
    <CreatePageShell
      breadcrumbs={[
        { label: "Кейсы", href: "/cases" },
        { label: "Новый кейс" },
      ]}
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Кейс создан");
        router.push("/cases");
      }}
      footer={
        <>
          <Button type="button" variant="outline" asChild>
            <Link href="/cases">Отмена</Link>
          </Button>
          <Button type="submit" disabled={!name.trim()}>Создать кейс</Button>
        </>
      }
    >
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="case-name">
            Название <span className="text-destructive">*</span>
          </Label>
          <Input
            id="case-name"
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Краткое название кейса"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="case-desc">Описание</Label>
          <Textarea
            id="case-desc"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите причину открытия кейса"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="case-priority">Приоритет</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="case-priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="critical">Критический</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4 text-sm">
          <span className="text-muted-foreground">Исполнитель:</span>
          <span className="font-medium">{currentUser.fullName}</span>
        </div>
      </div>
    </CreatePageShell>
  );
}
