import { StateSwitch } from "@/components/ext/state-switch";
import { WorkflowsTable } from "@/components/workflows/workflows-table";

export default function Page() {
  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="Сценариев нет"
      emptyDescription="Создайте первый сценарий через конструктор."
    >
      <WorkflowsTable />
    </StateSwitch>
  );
}
