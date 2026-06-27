"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NAV_GROUPS, type NavItem } from "./nav-config";
import { ProfileMenu } from "./profile-menu";
import { useMockData } from "@/lib/mock";
import { cn } from "@/lib/utils";

const NARROW_QUERY = "(max-width: 1023px)";

/** Сворачивать сайдбар в компактный рейл на узких экранах (планшет, <1024).
 *  useSyncExternalStore — SSR-безопасно (сервер отдаёт false → совпадает с первым
 *  клиентским рендером, без hydration mismatch). */
function useNarrowViewport() {
  return React.useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(NARROW_QUERY);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}

function isActive(pathname: string, href: string) {
  const n = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  if (href === "/dashboard") return n === href;
  return n === href || n.startsWith(href + "/");
}

const COMPACT_WIDTH = "4.5rem";
const EXPANDED_WIDTH = "16rem";

export function AppSidebar() {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const narrow = useNarrowViewport();
  // На узких экранах (<1024) держим компактный 88px-рейл, иначе раскрытый сайдбар
  // (256px) съедает контент и таблицы. Тоггл по-прежнему работает на десктопе.
  const expanded = state === "expanded" && !narrow;

  // Мобила (<768): сайдбар уезжает в off-canvas Sheet, открывается бургером в шапке.
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-64 gap-0 border-r border-sidebar-border bg-sidebar p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Навигация</SheetTitle>
          <NavBody expanded onNavigate={() => setOpenMobile(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar
      collapsible="none"
      variant="sidebar"
      className="relative isolate z-30 overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out"
      style={{ "--sidebar-width": expanded ? EXPANDED_WIDTH : COMPACT_WIDTH } as React.CSSProperties}
    >
      <NavBody expanded={expanded} showToggle />
    </Sidebar>
  );
}

/** Содержимое сайдбара — бренд + навигация + футер. Общее для десктоп-рейла и мобильного Sheet. */
function NavBody({
  expanded,
  showToggle = false,
  onNavigate,
}: {
  expanded: boolean;
  showToggle?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const data = useMockData();
  const { toggleSidebar } = useSidebar();

  const liveBadges = React.useMemo<Record<string, number>>(
    () => ({
      "/alerts": data.alerts.filter((a) => a.status !== "closed").length,
      "/cases": data.cases.filter((c) => c.status !== "closed").length,
      "/transactions": data.transactions.filter((t) => t.status === "review").length,
    }),
    [data.alerts, data.cases, data.transactions],
  );

  const mainGroups = NAV_GROUPS.filter((g) => !g.footer);
  const footerGroups = NAV_GROUPS.filter((g) => g.footer);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Бренд */}
      <div className="gap-0 px-3 pt-4 pb-3">
        <div className={cn("flex items-center gap-2.5", !expanded && "justify-center")}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary font-heading text-[15px] font-bold text-primary-foreground shadow-sm">
            F
          </div>
          {expanded ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-heading text-[15px] font-semibold leading-tight tracking-tight">Freedom AI</span>
                <span className="truncate text-[12px] leading-tight text-muted-foreground">Globerce Compliance</span>
              </div>
              {showToggle ? (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Свернуть"
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <ChevronsLeft className="size-4" />
                </button>
              ) : null}
            </>
          ) : null}
        </div>
        {showToggle && !expanded ? (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Развернуть"
            className="mt-2 flex w-full items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <ChevronsRight className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Основные группы */}
      <div className="min-h-0 flex-1 gap-0 overflow-y-auto px-2 pt-1">
        {mainGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5 pb-2">
            {expanded ? (
              <span className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </span>
            ) : null}
            {group.items.map((item) => (
              <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} badge={liveBadges[item.href]} expanded={expanded} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </div>

      {/* Настройки + профиль */}
      <div className="gap-1 px-2 pt-1 pb-3">
        {footerGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} badge={liveBadges[item.href]} expanded={expanded} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
        <div className="mt-1 border-t border-sidebar-border pt-2">
          <ProfileMenu expanded={expanded} />
        </div>
      </div>
    </div>
  );
}

function NavRow({ item, active, badge, expanded, onNavigate }: { item: NavItem; active: boolean; badge?: number; expanded: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;

  if (!expanded) {
    return (
      <Link
        href={item.href}
        title={item.label}
        onClick={onNavigate}
        className={cn(
          "relative flex items-center justify-center rounded-lg py-2.5 text-foreground transition-colors",
          active ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]",
        )}
      >
        <Icon className="size-[18px]" strokeWidth={2} />
        {badge ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" /> : null}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex h-9 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-foreground transition-colors",
        active ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.04]",
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={2} />
      <span className="flex-1 truncate">{item.label}</span>
      {badge ? <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground/70">{badge}</span> : null}
    </Link>
  );
}
