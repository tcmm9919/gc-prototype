import { StateSwitch } from "@/components/ext/state-switch";
import { ClientCard } from "@/components/clients/client-card";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch
      skeleton="detail"
      emptyTitle="Клиент не найден"
      emptyDescription="Возможно, ID устарел или клиент был удалён."
    >
      <ClientCard id={id} />
    </StateSwitch>
  );
}
