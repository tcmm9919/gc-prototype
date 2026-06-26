import { StateSwitch } from "@/components/ext/state-switch";
import { AgentDetail } from "@/components/ai/agent-detail";
import { getAllAgentIds } from "@/lib/mock/all-ids";

export function generateStaticParams() {
  return getAllAgentIds().map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Агент не найден">
      <AgentDetail id={id} />
    </StateSwitch>
  );
}
