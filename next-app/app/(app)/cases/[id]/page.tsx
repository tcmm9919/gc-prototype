import { StateSwitch } from "@/components/ext/state-switch";
import { CaseDetail } from "@/components/cases/case-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Кейс не найден">
      <CaseDetail id={id} />
    </StateSwitch>
  );
}
