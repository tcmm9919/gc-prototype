import { PageHeader } from "@/components/ext/page-header";
import { LLMUsageContent } from "@/components/llm/llm-usage-content";

export default function Page() {
  return (
    <>
      <PageHeader title="Использование LLM" description="Лимиты, баланс и дополнительный расход" />
      <LLMUsageContent />
    </>
  );
}
