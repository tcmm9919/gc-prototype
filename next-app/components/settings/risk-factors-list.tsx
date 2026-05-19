"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

import { useMockData, type RiskFactor } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";

const CATEGORY_LABEL: Record<RiskFactor["category"], string> = {
  geo: "География",
  client: "Клиент",
  behavior: "Поведение",
  product: "Продукт",
};

const CATEGORY_TONE: Record<RiskFactor["category"], "info" | "warning" | "danger" | "success"> = {
  geo: "warning",
  client: "info",
  behavior: "danger",
  product: "success",
};

export function RiskFactorsList() {
  const data = useMockData();
  const router = useRouter();

  return (
    <div className="grid gap-3 py-6 md:grid-cols-2 lg:grid-cols-3">
      {data.riskFactors.map((f, i) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.2, ease: "easeOut" }}
        >
          <Card
            className="group h-full cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
            onClick={() => router.push(`/settings/risk-factors/${f.id}`)}
          >
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium leading-snug group-hover:underline">{f.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{f.id}</span>
                </div>
                <StatusBadge tone={CATEGORY_TONE[f.category]}>{CATEGORY_LABEL[f.category]}</StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{f.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Вес:</span>
                  <span className="font-mono text-sm font-medium tabular-nums">+{f.weight}</span>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button asChild variant="ghost" size="icon" className="size-7" aria-label="Редактировать">
                    <Link href={`/settings/risk-factors/${f.id}`}>
                      <Pencil className="size-3.5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Удалить">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
