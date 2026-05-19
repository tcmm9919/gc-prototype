import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { AlertsTable } from "@/components/alerts/alerts-table";
import { AlertsSummary } from "@/components/alerts/alerts-summary";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Оповещения"
        description="Алерты по сработавшим правилам и сценариям"
      />
      <StateSwitch skeleton="table" emptyTitle="Оповещений нет" emptyDescription="Срабатывания сценариев появятся здесь.">
        <AlertsSummary />
        <AlertsTable />
      </StateSwitch>
    </>
  );
}
