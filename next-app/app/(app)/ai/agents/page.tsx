import { StateSwitch } from "@/components/ext/state-switch";
import { AgentsGrid } from "@/components/ai/agents-grid";

export default function Page() {
  return (
    <StateSwitch skeleton="list" emptyTitle="Агентов нет" emptyDescription="Создайте первого агента.">
      <AgentsGrid />
    </StateSwitch>
  );
}
