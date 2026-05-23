import { StateSwitch } from "@/components/ext/state-switch";
import { AlertDetail } from "@/components/alerts/alert-detail";
import { getAllAlertIds } from "@/lib/mock/all-ids";

export async function generateStaticParams() {
  return getAllAlertIds().map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Оповещение не найдено">
      <AlertDetail id={id} />
    </StateSwitch>
  );
}
