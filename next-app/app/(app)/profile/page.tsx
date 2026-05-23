"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { Switch } from "@/components/ui/switch";
import { AvatarCircle } from "@/components/ext/entity-header";
import { StatusBadge } from "@/components/ext/status-badge";
import { currentUser } from "@/lib/mock/seeds";
import { initialsFromName } from "@/lib/format";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button size="lg">Сохранить</Button>
      </div>
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Кто я</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <AvatarCircle initials={initialsFromName(currentUser.fullName)} size="lg" hue={currentUser.avatarHue ?? 200} />
              <div className="flex flex-col leading-tight">
                <span className="font-medium">{currentUser.fullName}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <StatusBadge tone="info">Офицер комплаенса</StatusBadge>
              <StatusBadge tone="success">Активен</StatusBadge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Контакты и предпочтения</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Имя">
              <Input defaultValue={currentUser.fullName} />
            </Field>
            <Field label="E-mail">
              <Input defaultValue={currentUser.email} />
            </Field>
            <Field label="Уведомления на e-mail">
              <Switch defaultChecked />
            </Field>
            <Field label="Тёмная тема — авто">
              <Switch defaultChecked />
            </Field>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Мои лимиты LLM</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Limit label="Токены / день" used={42_180} cap={200_000} unit="" />
            <Limit label="Стоимость / месяц" used={12.4} cap={50} unit="$" />
            <Limit label="Запросов / час" used={14} cap={30} unit="" />
            <Limit label="Параллельных запусков агентов" used={2} cap={3} unit="" />
            <Limit label="Кейсов в работе" used={7} cap={15} unit="" />
            <Limit label="Запросов на эскалацию" used={1} cap={5} unit="" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function Limit({ label, used, cap, unit }: { label: string; used: number; cap: number; unit: string }) {
  const percent = Math.min((used / cap) * 100, 100);
  const danger = percent > 80;
  return (
    <div className="space-y-1.5 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`tabular-nums font-medium ${danger ? "text-risk-high" : ""}`}>
          {unit}{used.toLocaleString("ru-KZ")} / {unit}{cap.toLocaleString("ru-KZ")}
        </span>
      </div>
      <AnimatedProgress value={percent} className="h-1.5" />
    </div>
  );
}
