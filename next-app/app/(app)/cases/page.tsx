import { StateSwitch } from "@/components/ext/state-switch";
import { CasesTable } from "@/components/cases/cases-table";

export default function Page() {
  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="Открытых кейсов нет"
      emptyDescription="Можете создать кейс вручную или дождаться эскалации из оповещений."
    >
      <CasesTable />
    </StateSwitch>
  );
}
