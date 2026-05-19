"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";

interface AnimatedProgressProps {
  value: number;
  className?: string;
  duration?: number;
}

export function AnimatedProgress({ value, className, duration = 700 }: AnimatedProgressProps) {
  const [v, setV] = React.useState(0);

  React.useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setV(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <Progress value={v} className={className} />;
}
