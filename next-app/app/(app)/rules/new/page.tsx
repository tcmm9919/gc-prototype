import { PageHeader } from "@/components/ext/page-header";
import { RuleBuilder } from "@/components/rules/rule-builder";

export default function Page() {
  return (
    <>
      <PageHeader title="Новое правило" description="Конструктор условий с группами AND/OR" />
      <RuleBuilder />
    </>
  );
}
