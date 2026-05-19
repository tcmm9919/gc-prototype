import { StateSwitch } from "@/components/ext/state-switch";
import { ClientCard } from "@/components/clients/client-card";
import { seedClients } from "@/lib/mock/seeds";
import { killerFlowClient } from "@/lib/mock/scenarios/killer-flow-demo";

export async function generateStaticParams() {
  const ids = new Set<string>([...seedClients.map((c) => c.id), killerFlowClient.id]);
  return Array.from(ids).map((id) => ({ id }));
}

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
