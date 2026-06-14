"use client";

import { PageHeader } from "@/components/ext/page-header";
import { RiskFactorForm } from "@/components/settings/risk-factor-form";
import { useMockData } from "@/lib/mock";

export function RiskFactorEditClient({ id }: { id: string }) {
  const data = useMockData();
  const factor = data.riskFactors.find((f) => f.id === id) ?? data.riskFactors[0];

  return (
    <>
      <PageHeader
        title={factor?.name ?? "Риск-фактор"}
        description={`${factor?.id ?? id} · редактирование параметров фактора`}
      />
      {factor ? <RiskFactorForm factor={factor} /> : null}
    </>
  );
}
