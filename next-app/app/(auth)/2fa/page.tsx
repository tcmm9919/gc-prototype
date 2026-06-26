"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMockStore } from "@/lib/mock/store";
import { SHOW_DEV_LOGIN } from "@/lib/mock/dev-auth";

export default function Page() {
  const router = useRouter();
  const setAuthed = useMockStore((s) => s.setAuthed);
  const [code, setCode] = React.useState("");

  const enter = () => {
    setAuthed(true);
    router.push("/dashboard");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    enter();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.02em]">Подтверждение входа</h1>
        <p className="text-sm text-muted-foreground">Введите 6-значный код из приложения-аутентификатора</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot key={i} index={i} className="size-12 text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
          Отправить код повторно
        </button>
      </div>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={code.length < 6}>
        Подтвердить
      </Button>

      {SHOW_DEV_LOGIN ? (
        <Button type="button" variant="outline" className="h-11 w-full border-dashed" onClick={enter}>
          <Zap className="size-4" />
          Пропустить 2FA (dev)
        </Button>
      ) : null}

      <Link href="/login" className="text-center text-xs text-muted-foreground hover:text-foreground">
        ← Назад ко входу
      </Link>
    </form>
  );
}
