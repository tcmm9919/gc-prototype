import { PageHeader } from "@/components/ext/page-header";
import { CaseNew } from "@/components/cases/case-new";

export default function Page() {
  return (
    <>
      <PageHeader title="Новый кейс" description="Выбор типа, клиента, привязка алертов и транзакций" />
      <CaseNew />
    </>
  );
}
