import { StateSwitch } from "@/components/ext/state-switch";
import { LLMUsageContent } from "@/components/llm/llm-usage-content";

export default function Page() {
  return (
    <StateSwitch skeleton="table" emptyTitle="Нет данных об использовании LLM">
      <LLMUsageContent />
    </StateSwitch>
  );
}
