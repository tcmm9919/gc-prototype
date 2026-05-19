"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockStore } from "@/lib/mock/store";

export default function Page() {
  const router = useRouter();
  const setAuthed = useMockStore((s) => s.setAuthed);
  const [code, setCode] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthed(true);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">Подтверждение входа</h1>
        <p className="text-sm text-muted-foreground">Введите 6-значный код из приложения-аутентификатора</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Код</Label>
        <Input
          id="code"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="······"
          className="font-mono text-center tracking-[0.5em]"
        />
      </div>
      <Button type="submit" className="w-full" disabled={code.length === 0}>
        Подтвердить
      </Button>
      <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground text-center">
        ← Назад ко входу
      </Link>
    </form>
  );
}
