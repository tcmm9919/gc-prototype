import { StateSwitch } from "@/components/ext/state-switch";
import { AiLimitsContent } from "@/components/settings/ai-limits-content";

export default function Page() {
  return (
    <StateSwitch skeleton="dashboard" emptyTitle="Нет данных о расходе AI">
      <AiLimitsContent />
    </StateSwitch>
  );
}
