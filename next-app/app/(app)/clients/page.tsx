import { StateSwitch } from "@/components/ext/state-switch";
import { ClientsTable } from "@/components/clients/clients-table";

export default function Page() {
  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="Клиентов пока нет"
      emptyDescription="Подключите импорт из CRM или добавьте первого клиента вручную."
    >
      <ClientsTable />
    </StateSwitch>
  );
}
