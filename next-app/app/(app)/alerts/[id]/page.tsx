import { StateSwitch } from "@/components/ext/state-switch";
import { AlertDetail } from "@/components/alerts/alert-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Оповещение не найдено">
      <AlertDetail id={id} />
    </StateSwitch>
  );
}
