import { StateSwitch } from "@/components/ext/state-switch";
import { WorkflowDetail } from "@/components/workflows/workflow-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Сценарий не найден">
      <WorkflowDetail id={id} />
    </StateSwitch>
  );
}
