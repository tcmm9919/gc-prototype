import { StateSwitch } from "@/components/ext/state-switch";
import { ExecutorDashboard } from "@/components/dashboard/executor-dashboard";

export default function Page() {
  return (
    <StateSwitch skeleton="dashboard">
      <ExecutorDashboard />
    </StateSwitch>
  );
}
