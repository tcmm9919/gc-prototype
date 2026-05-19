import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { RulesTable } from "@/components/rules/rules-table";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Правила"
        description="Атомарные условия, используемые в сценариях и оповещениях"
        actions={
          <Button asChild size="lg">
            <Link href="/rules/new">
              <Plus className="size-4" />
              Новое правило
            </Link>
          </Button>
        }
      />
      <StateSwitch skeleton="table" emptyTitle="Правил пока нет" emptyDescription="Создайте первое правило для запуска сценариев.">
        <RulesTable />
      </StateSwitch>
    </>
  );
}
