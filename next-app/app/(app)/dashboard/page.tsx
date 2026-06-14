import { StateSwitch } from "@/components/ext/state-switch";
import { ExecutorDashboard } from "@/components/dashboard/executor-dashboard";

export default function Page() {
  return (
    <StateSwitch skeleton="dashboard">
      <div className="pt-4">
        <ExecutorDashboard />
      </div>
    </StateSwitch>
  );
}
