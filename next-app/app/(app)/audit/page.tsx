import { Download } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/audit-table";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Журнал аудита"
        description="Все действия пользователей и системы. Покрытие — стикер 5"
        actions={
          <Button size="lg" variant="outline">
            <Download className="size-4" />
            Экспорт CSV
          </Button>
        }
      />
      <StateSwitch skeleton="table" emptyTitle="События не найдены">
        <AuditTable />
      </StateSwitch>
    </>
  );
}
