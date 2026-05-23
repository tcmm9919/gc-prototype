import { StateSwitch } from "@/components/ext/state-switch";
import { RuleDetail } from "@/components/rules/rule-detail";
import { getAllRuleIds } from "@/lib/mock/all-ids";

export async function generateStaticParams() {
  return getAllRuleIds().map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StateSwitch skeleton="detail" emptyTitle="Правило не найдено">
      <RuleDetail id={id} />
    </StateSwitch>
  );
}
