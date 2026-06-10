import { StateSwitch } from "@/components/ext/state-switch";
import { LLMRequestDetail } from "@/components/llm/llm-request-detail";
import { seedLLMUsage } from "@/lib/mock/seeds";

export async function generateStaticParams() {
  const ids = new Set<string>([
    ...seedLLMUsage.map((u) => u.id),
  ]);
  return Array.from(ids).map((requestId) => ({ requestId }));
}

export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Запрос не найден">
      <LLMRequestDetail id={requestId} />
    </StateSwitch>
  );
}
