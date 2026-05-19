import { PageHeader } from "@/components/ext/page-header";
import { RiskFactorForm } from "@/components/settings/risk-factor-form";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Новый риск-фактор"
        description="Добавьте фактор, который будет учитываться в скоринге клиентов и сценариях"
      />
      <RiskFactorForm />
    </>
  );
}
