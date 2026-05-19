import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Транзакции"
        description="Реестр операций с риск-флагами и привязкой к сценариям"
        actions={
          <Button size="lg" variant="outline">
            <Download className="size-4" />
            Экспорт
          </Button>
        }
      />
      <StateSwitch skeleton="table" emptyTitle="Операций пока нет" emptyDescription="Транзакции появятся по мере их поступления.">
        <TransactionsTable />
      </StateSwitch>
    </>
  );
}
