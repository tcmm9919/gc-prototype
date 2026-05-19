"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMockStore } from "@/lib/mock/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const authed = useMockStore((s) => s.authed);
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated && !authed) {
      router.replace("/login");
    }
  }, [hydrated, authed, router, pathname]);

  if (hydrated && !authed) {
    return null;
  }
  return <>{children}</>;
}
