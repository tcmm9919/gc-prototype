import { StateSwitch } from "@/components/ext/state-switch";
import { ClientCard } from "@/components/clients/client-card";
import { getAllClientIds } from "@/lib/mock/all-ids";

export async function generateStaticParams() {
  return getAllClientIds().map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch
      skeleton="detail"
      emptyTitle="Клиент не найден"
      emptyDescription="Возможно, ID устарел или клиент был удалён."
      delegateToTabParam
    >
      <ClientCard id={id} />
    </StateSwitch>
  );
}
