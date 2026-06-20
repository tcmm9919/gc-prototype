import { Shield } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { EmptyState } from "@/components/ext/empty-state";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Комплаенс-агент"
        description="Авто-агент комплаенс-офицера: анализ оповещений, эскалация и запуск сценариев для клиентов."
      />
      <EmptyState
        icon={<Shield className="size-7" />}
        title="Комплаенс-агент в разработке"
        description="Скоро здесь появятся настройки авто-обработки оповещений и история решений по клиентам."
      />
    </>
  );
}
