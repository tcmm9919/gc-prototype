import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { ClientsTable } from "@/components/clients/clients-table";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Клиенты"
        description="Реестр физ. и юр. лиц на комплаенс-мониторинге"
        actions={
          <>
            <Button size="lg" variant="outline">
              <Download className="size-4" />
              Экспорт
            </Button>
            <Button size="lg">
              <Plus className="size-4" />
              Добавить клиента
            </Button>
          </>
        }
      />
      <StateSwitch
        skeleton="table"
        emptyTitle="Клиентов пока нет"
        emptyDescription="Подключите импорт из CRM или добавьте первого клиента вручную."
      >
        <ClientsTable />
      </StateSwitch>
    </>
  );
}
