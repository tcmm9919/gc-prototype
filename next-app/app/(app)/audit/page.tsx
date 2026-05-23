import { StateSwitch } from "@/components/ext/state-switch";
import { AuditTable } from "@/components/audit/audit-table";

export default function Page() {
  return (
    <StateSwitch skeleton="table" emptyTitle="События не найдены">
      <AuditTable />
    </StateSwitch>
  );
}
