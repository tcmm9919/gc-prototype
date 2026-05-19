import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { CasesTable } from "@/components/cases/cases-table";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Кейсы"
        description="Расследования по клиентам. Тип кейса определяет workflow (стикер 3)"
        actions={
          <Button asChild size="lg">
            <Link href="/cases/new">
              <Plus className="size-4" />
              Новый кейс
            </Link>
          </Button>
        }
      />
      <StateSwitch skeleton="table" emptyTitle="Открытых кейсов нет" emptyDescription="Можете создать кейс вручную или дождаться эскалации из оповещений.">
        <CasesTable />
      </StateSwitch>
    </>
  );
}
