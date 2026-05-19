import { StateSwitch } from "@/components/ext/state-switch";
import { AlertDetail } from "@/components/alerts/alert-detail";
import { seedAlerts } from "@/lib/mock/seeds";
import { killerFlowAlert } from "@/lib/mock/scenarios/killer-flow-demo";

export async function generateStaticParams() {
  const ids = new Set<string>([...seedAlerts.map((a) => a.id), killerFlowAlert.id]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Оповещение не найдено">
      <AlertDetail id={id} />
    </StateSwitch>
  );
}
