import { Download } from "lucide-react";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/audit-table";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button size="lg" variant="outline">
          <Download className="size-4" />
          Экспорт CSV
        </Button>
      </div>
      <StateSwitch skeleton="table" emptyTitle="События не найдены">
        <AuditTable />
      </StateSwitch>
    </>
  );
}
