"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_GROUPS } from "./nav-config";
import { useMockData } from "@/lib/mock";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  const normalized = pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;
  if (href === "/dashboard") return normalized === href;
  return normalized === href || normalized.startsWith(href + "/");
}

const COMPACT_WIDTH = "5.5rem";
const EXPANDED_WIDTH = "15rem";

export function AppSidebar() {
  const pathname = usePathname() ?? "";
  const data = useMockData();
  const { state, toggleSidebar } = useSidebar();
  const expanded = state === "expanded";

  const liveBadges = React.useMemo<Record<string, number>>(() => {
    const openAlerts = data.alerts.filter((a) => a.status !== "closed").length;
    const openCases = data.cases.filter((c) => c.status !== "closed").length;
    return {
      "/alerts": openAlerts,
      "/cases": openCases,
    };
  }, [data.alerts, data.cases]);

  return (
    <Sidebar
      collapsible="none"
      variant="sidebar"
      className="relative z-30 transition-[width] duration-200 ease-out"
      style={{ "--sidebar-width": expanded ? EXPANDED_WIDTH : COMPACT_WIDTH } as React.CSSProperties}
    >
      <SidebarHeader>
        <div
          className={cn(
            "flex pt-4 pb-2.5 gap-2.5",
            expanded ? "items-center px-3" : "flex-col items-center"
          )}
        >
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-heading text-[16px] font-bold shadow-sm shrink-0">
            F
          </div>
          {expanded ? (
            <span className="font-heading text-[15px] font-semibold tracking-tight truncate">
              Freedom AI
            </span>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 gap-1.5 pt-1 pb-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              const badge = liveBadges[item.href] ?? item.badge;

              if (expanded) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "group/row relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-foreground",
                      active
                        ? "bg-foreground/[0.08]"
                        : "hover:bg-foreground/[0.04]"
                    )}
                  >
                    <Icon className="size-5 shrink-0" fill="currentColor" strokeWidth={1.5} />
                    <span className="text-[14px] font-medium truncate flex-1">
                      {item.label}
                    </span>
                    {badge ? (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold tabular-nums flex items-center justify-center shrink-0">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "group/tile relative flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-colors text-center text-foreground",
                    active
                      ? "bg-foreground/[0.08]"
                      : "hover:bg-foreground/[0.04]"
                  )}
                >
                  <Icon className="size-5 shrink-0" fill="currentColor" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium leading-[1.15] line-clamp-2 break-words px-0.5">
                    {item.label}
                  </span>
                  {badge ? (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold tabular-nums flex items-center justify-center">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={expanded ? "Свернуть сайдбар" : "Развернуть сайдбар"}
          title={expanded ? "Свернуть" : "Развернуть"}
          className={cn(
            "mt-auto flex items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] transition-colors",
            expanded
              ? "gap-3 px-3 py-2.5"
              : "flex-col gap-1 px-1 py-2.5"
          )}
        >
          {expanded ? (
            <>
              <PanelLeftClose className="size-5 shrink-0" strokeWidth={1.5} />
              <span className="text-[14px] font-medium">Свернуть</span>
            </>
          ) : (
            <PanelLeftOpen className="size-5 shrink-0" strokeWidth={1.5} />
          )}
        </button>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
