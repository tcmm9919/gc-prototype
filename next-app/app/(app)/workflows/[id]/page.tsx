import { StateSwitch } from "@/components/ext/state-switch";
import { WorkflowDetail } from "@/components/workflows/workflow-detail";
import { seedScenarios } from "@/lib/mock/seeds";
import { killerFlowWorkflow } from "@/lib/mock/scenarios/killer-flow-demo";

export async function generateStaticParams() {
  const ids = new Set<string>([...seedScenarios.map((s) => s.id), killerFlowWorkflow.id]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Сценарий не найден">
      <WorkflowDetail id={id} />
    </StateSwitch>
  );
}
