"use client";

import { RiskFactorForm } from "@/components/settings/risk-factor-form";
import { useMockData } from "@/lib/mock";

export function RiskFactorEditClient({ id }: { id: string }) {
  const data = useMockData();
  const factor = data.riskFactors.find((f) => f.id === id) ?? data.riskFactors[0];

  return factor ? <RiskFactorForm factor={factor} /> : null;
}
