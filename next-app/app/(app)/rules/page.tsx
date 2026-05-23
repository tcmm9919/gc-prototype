import { StateSwitch } from "@/components/ext/state-switch";
import { RulesTable } from "@/components/rules/rules-table";

export default function Page() {
  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="Правил пока нет"
      emptyDescription="Создайте первое правило для запуска сценариев."
    >
      <RulesTable />
    </StateSwitch>
  );
}
