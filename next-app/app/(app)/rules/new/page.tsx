"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CreatePageShell } from "@/components/ext/create-page-shell";
import { RuleBuilder } from "@/components/rules/rule-builder";

export default function Page() {
  const router = useRouter();

  return (
    <CreatePageShell
      wide
      breadcrumbs={[
        { label: "Правила", href: "/rules" },
        { label: "Новое правило" },
      ]}
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Правило создано");
        router.push("/rules");
      }}
      footer={
        <>
          <Button type="button" variant="outline" asChild>
            <Link href="/rules">Отмена</Link>
          </Button>
          <Button type="submit">Создать правило</Button>
        </>
      }
    >
      <RuleBuilder />
    </CreatePageShell>
  );
}
