"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useMockData } from "@/lib/mock";
import { currentUser } from "@/lib/mock/seeds";
import { Button } from "@/components/ui/button";

function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Доброе утро";
  if (hour >= 12 && hour < 17) return "Добрый день";
  if (hour >= 17 && hour < 23) return "Добрый вечер";
  return "Доброй ночи";
}

function firstName(fullName: string): string {
  const parts = fullName.replace(/«|»/g, "").trim().split(/\s+/);
  return parts[1]?.replace(/\.$/, "") ?? parts[0];
}

function pluralize(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export function DashboardHero() {
  const data = useMockData();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const myCriticalAlerts = data.alerts.filter(
    (a) => a.responsibleId === currentUser.id && a.severity === "critical" && a.status !== "closed",
  ).length;

  const mySlaAtRisk = data.cases.filter((c) => {
    if (c.responsibleId !== currentUser.id || c.status === "closed") return false;
    const dueIn = new Date(c.slaDueAt).getTime() - Date.now();
    return dueIn < 24 * 3600_000;
  }).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      <div>
        <h2 className="font-heading text-3xl font-black tracking-tight text-foreground">
          {now ? greeting(now.getHours()) : "Здравствуйте"}, {firstName(currentUser.fullName)}.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {myCriticalAlerts + mySlaAtRisk > 0
            ? `На вас ${myCriticalAlerts} критических ${pluralize(myCriticalAlerts, ["алерт", "алерта", "алертов"])} и ${mySlaAtRisk} ${pluralize(mySlaAtRisk, ["кейс", "кейса", "кейсов"])} с истекающим SLA. Начните с очереди ниже.`
            : "Критических элементов на вас нет — можно заняться текущими сценариями и аналитикой."}
        </p>
      </div>

      <div>
        <Button asChild size="lg">
          <Link href="/chat">
            Спросить ассистента
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </motion.section>
  );
}
