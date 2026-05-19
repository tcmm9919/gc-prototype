"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockStore } from "@/lib/mock/store";

export default function Page() {
  const router = useRouter();
  const setAuthed = useMockStore((s) => s.setAuthed);
  const [email, setEmail] = React.useState("e.zhumabekov@freedom.kz");
  const [password, setPassword] = React.useState("••••••••");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock-auth: любые непустые поля → переход к 2FA
    if (email && password) router.push("/2fa");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">Вход в GCP</h1>
        <p className="text-sm text-muted-foreground">Используйте корпоративную почту Freedom Bank</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Почта</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Забыли?
            </Link>
          </div>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
      </div>
      <Button type="submit" className="w-full" onClick={() => setAuthed(false)}>
        Войти
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Mock-auth: любые непустые поля проводят к шагу 2FA. После ввода кода — главный экран.
      </p>
    </form>
  );
}
