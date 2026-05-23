import { StateSwitch } from "@/components/ext/state-switch";
import { ClientsTable } from "@/components/clients/clients-table";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button size="lg" variant="outline">
          <Download className="size-4" />
          Экспорт
        </Button>
        <Button size="lg">
          <Plus className="size-4" />
          Добавить клиента
        </Button>
      </div>
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
