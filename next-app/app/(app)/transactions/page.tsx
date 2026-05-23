import { StateSwitch } from "@/components/ext/state-switch";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export default function Page() {
  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="Операций пока нет"
      emptyDescription="Транзакции появятся по мере их поступления."
    >
      <TransactionsTable />
    </StateSwitch>
  );
}
