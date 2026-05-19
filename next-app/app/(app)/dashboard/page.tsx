import { StateSwitch } from "@/components/ext/state-switch";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function Page() {
  return (
    <StateSwitch
      skeleton="detail"
      emptyTitle="Нет данных за период"
      emptyDescription="Активность появится по мере поступления операций."
    >
      <DashboardContent />
    </StateSwitch>
  );
}
