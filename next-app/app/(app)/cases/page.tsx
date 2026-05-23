import Link from "next/link";
import { Plus } from "lucide-react";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { CasesTable } from "@/components/cases/cases-table";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button asChild size="lg">
          <Link href="/cases/new">
            <Plus className="size-4" />
            Новый кейс
          </Link>
        </Button>
      </div>
      <StateSwitch skeleton="table" emptyTitle="Открытых кейсов нет" emptyDescription="Можете создать кейс вручную или дождаться эскалации из оповещений.">
        <CasesTable />
      </StateSwitch>
    </>
  );
}
