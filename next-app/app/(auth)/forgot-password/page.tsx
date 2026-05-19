import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">Сброс пароля</h1>
        <p className="text-sm text-muted-foreground">
          Отправим ссылку для восстановления на вашу почту
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Почта</Label>
        <Input id="email" type="email" placeholder="name@freedom.kz" autoComplete="email" />
      </div>
      <Button asChild className="w-full">
        <Link href="/reset-password">Отправить ссылку</Link>
      </Button>
      <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground text-center">
        ← Назад ко входу
      </Link>
    </div>
  );
}
