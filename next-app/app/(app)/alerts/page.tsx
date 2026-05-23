import { StateSwitch } from "@/components/ext/state-switch";
import { AlertsTable } from "@/components/alerts/alerts-table";
import { AlertsSummary } from "@/components/alerts/alerts-summary";

export default function Page() {
  return (
    <StateSwitch skeleton="table" emptyTitle="Оповещений нет" emptyDescription="Срабатывания сценариев появятся здесь.">
      <AlertsSummary />
      <AlertsTable />
    </StateSwitch>
  );
}
