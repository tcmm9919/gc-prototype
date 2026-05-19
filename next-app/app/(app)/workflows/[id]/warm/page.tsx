import { StateSwitch } from "@/components/ext/state-switch";
import { WarmStatus } from "@/components/scenarios/warm-status";
import { seedScenarios } from "@/lib/mock/seeds";
import { killerFlowWorkflow } from "@/lib/mock/scenarios/killer-flow-demo";

export async function generateStaticParams() {
  const ids = new Set<string>([...seedScenarios.map((s) => s.id), killerFlowWorkflow.id]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Запуск WARM не найден">
      <WarmStatus scenarioId={id} />
    </StateSwitch>
  );
}
