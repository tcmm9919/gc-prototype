import { StateSwitch } from "@/components/ext/state-switch";
import { WarmStatus } from "@/components/scenarios/warm-status";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Запуск WARM не найден">
      <WarmStatus scenarioId={id} />
    </StateSwitch>
  );
}
