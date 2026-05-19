import { StateSwitch } from "@/components/ext/state-switch";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { seedTransactions } from "@/lib/mock/seeds";
import { killerFlowTransaction } from "@/lib/mock/scenarios/killer-flow-demo";

export async function generateStaticParams() {
  const ids = new Set<string>([...seedTransactions.map((t) => t.id), killerFlowTransaction.id]);
  return Array.from(ids).map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Транзакция не найдена">
      <TransactionDetail id={id} />
    </StateSwitch>
  );
}
