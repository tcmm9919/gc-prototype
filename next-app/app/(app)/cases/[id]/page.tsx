import { StateSwitch } from "@/components/ext/state-switch";
import { CaseDetail } from "@/components/cases/case-detail";
import { seedCases } from "@/lib/mock/seeds";
import { killerFlowCase } from "@/lib/mock/scenarios/killer-flow-demo";

export async function generateStaticParams() {
  const ids = new Set<string>([...seedCases.map((c) => c.id), killerFlowCase.id]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Кейс не найден">
      <CaseDetail id={id} />
    </StateSwitch>
  );
}
