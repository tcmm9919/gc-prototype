import { StateSwitch } from "@/components/ext/state-switch";
import { LLMRequestDetail } from "@/components/llm/llm-request-detail";

export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Запрос не найден">
      <LLMRequestDetail id={requestId} />
    </StateSwitch>
  );
}
