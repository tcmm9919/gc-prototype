import { StateSwitch } from "@/components/ext/state-switch";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import { getAllTransactionIds } from "@/lib/mock/all-ids";

export async function generateStaticParams() {
  return getAllTransactionIds().map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Транзакция не найдена">
      <TransactionDetail id={id} />
    </StateSwitch>
  );
}
