import { seedRiskFactors } from "@/lib/mock/seeds";
import { RiskFactorEditClient } from "./risk-factor-edit-client";

export async function generateStaticParams() {
  return seedRiskFactors.map((f) => ({ id: f.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RiskFactorEditClient id={id} />;
}
