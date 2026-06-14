import { StateSwitch } from "@/components/ext/state-switch";
import { AlertsTable } from "@/components/alerts/alerts-table";

export default function Page() {
  return (
    <StateSwitch skeleton="table" emptyTitle="Оповещений нет" emptyDescription="Срабатывания сценариев появятся здесь.">
      <AlertsTable />
    </StateSwitch>
  );
}
