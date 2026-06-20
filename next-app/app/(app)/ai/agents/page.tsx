import { Bot } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { EmptyState } from "@/components/ext/empty-state";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Агенты"
        description="Пользовательские AI-агенты с кастомными инструкциями для автоматизации комплаенс-задач."
      />
      <EmptyState
        icon={<Bot className="size-7" />}
        title="Управление агентами в разработке"
        description="Скоро здесь появится создание и настройка AI-агентов на Yandex Foundation Models."
      />
    </>
  );
}
