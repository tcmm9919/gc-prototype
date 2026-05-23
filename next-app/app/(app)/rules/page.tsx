import Link from "next/link";
import { Plus } from "lucide-react";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { RulesTable } from "@/components/rules/rules-table";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button asChild size="lg">
          <Link href="/rules/new">
            <Plus className="size-4" />
            Новое правило
          </Link>
        </Button>
      </div>
      <StateSwitch skeleton="table" emptyTitle="Правил пока нет" emptyDescription="Создайте первое правило для запуска сценариев.">
        <RulesTable />
      </StateSwitch>
    </>
  );
}
