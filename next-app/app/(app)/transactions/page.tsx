import { StateSwitch } from "@/components/ext/state-switch";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button size="lg" variant="outline">
          <Download className="size-4" />
          Экспорт
        </Button>
      </div>
      <StateSwitch skeleton="table" emptyTitle="Операций пока нет" emptyDescription="Транзакции появятся по мере их поступления.">
        <TransactionsTable />
      </StateSwitch>
    </>
  );
}
