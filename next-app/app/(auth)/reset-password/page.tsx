import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">Новый пароль</h1>
        <p className="text-sm text-muted-foreground">
          Минимум 12 символов, цифра, заглавная буква и специальный символ
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pwd">Новый пароль</Label>
          <Input id="pwd" type="password" autoComplete="new-password" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pwd2">Повтор пароля</Label>
          <Input id="pwd2" type="password" autoComplete="new-password" />
        </div>
      </div>
      <Button asChild className="w-full">
        <Link href="/login">Сохранить и войти</Link>
      </Button>
    </div>
  );
}
