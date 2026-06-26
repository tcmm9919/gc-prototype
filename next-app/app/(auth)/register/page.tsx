"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockStore } from "@/lib/mock/store";
import { DEV_REGISTER, SHOW_DEV_LOGIN } from "@/lib/mock/dev-auth";

export default function Page() {
  const router = useRouter();
  const setAuthed = useMockStore((s) => s.setAuthed);
  const [fullName, setFullName] = React.useState(DEV_REGISTER.fullName);
  const [email, setEmail] = React.useState(DEV_REGISTER.email);
  const [org, setOrg] = React.useState(DEV_REGISTER.org);
  const [password, setPassword] = React.useState(DEV_REGISTER.password);
  const [show, setShow] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && password) router.push("/2fa");
  };

  const devLogin = () => {
    setAuthed(true);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.02em]">Создать аккаунт</h1>
        <p className="text-sm text-muted-foreground">Регистрация офицера комплаенса в платформе</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">ФИО</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Корпоративная почта</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org">Организация</Label>
          <Input id="org" value={org} onChange={(e) => setOrg(e.target.value)} className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Скрыть пароль" : "Показать пароль"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Минимум 8 символов, цифра и заглавная буква.</p>
        </div>
      </div>

      <Button type="submit" size="lg" className="h-11 w-full">Создать аккаунт</Button>

      {SHOW_DEV_LOGIN ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground/60">
            <span className="h-px flex-1 bg-border" /> dev <span className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" className="h-11 w-full border-dashed" onClick={devLogin}>
            <Zap className="size-4" />
            Войти как разработчик
          </Button>
        </div>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">Войти</Link>
      </p>
    </form>
  );
}
