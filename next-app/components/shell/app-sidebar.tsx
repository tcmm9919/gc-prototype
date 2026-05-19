"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NAV_GROUPS, type NavGroup } from "./nav-config";
import { currentUser } from "@/lib/mock/seeds";
import { useMockData } from "@/lib/mock";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Linear-tight sidebar:
 * - Subtle near-white sidebar that blends into content
 * - Group labels tiny mono-tracking caps
 * - Active item: white surface + tiny shadow (Airbnb card style)
 * - User block at bottom in clean rounded card
 */
export function AppSidebar() {
  const pathname = usePathname() ?? "";
  const data = useMockData();

  const liveBadges = React.useMemo<Record<string, number>>(() => {
    const openAlerts = data.alerts.filter((a) => a.status !== "closed").length;
    const openCases = data.cases.filter((c) => c.status !== "closed").length;
    return {
      "/alerts": openAlerts,
      "/cases": openCases,
    };
  }, [data.alerts, data.cases]);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex h-11 items-center gap-2.5 px-1.5">
          <div className="relative size-8 shrink-0 rounded-lg bg-foreground text-background flex items-center justify-center">
            <span className="font-heading text-[14px] font-bold tracking-[-0.02em] leading-none">F</span>
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary ring-2 ring-sidebar" />
          </div>
          <div className="flex flex-col leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-[14px] font-semibold tracking-[-0.01em] truncate">
              Freedom AI
            </span>
            <span className="text-[11px] text-muted-foreground truncate -mt-0.5">Compliance</span>
          </div>
          <SidebarTrigger className="ml-auto shrink-0 size-7 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-1">
        {NAV_GROUPS.map((group) => (
          <NavGroupBlock
            key={group.label}
            group={group}
            pathname={pathname}
            liveBadges={liveBadges}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2.5 px-1 py-1.5 group-data-[collapsible=icon]:hidden">
          <div
            className="size-8 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-heading font-semibold uppercase tracking-tight"
            style={{
              background: `oklch(0.88 0.05 ${currentUser.avatarHue ?? 200})`,
              color: `oklch(0.30 0.10 ${currentUser.avatarHue ?? 200})`,
            }}
            aria-hidden
          >
            {currentUser.fullName
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="flex flex-col leading-tight min-w-0 flex-1">
            <span className="text-[13px] font-medium truncate">{currentUser.fullName}</span>
            <span className="text-[11px] text-muted-foreground truncate">{currentUser.email}</span>
          </div>
          <span className="status-dot status-dot-pulse text-primary shrink-0" aria-label="online" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavGroupBlock({
  group,
  pathname,
  liveBadges,
}: {
  group: NavGroup;
  pathname: string;
  liveBadges: Record<string, number>;
}) {
  const items = (
    <SidebarMenu>
      {group.items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        const badge = liveBadges[item.href] ?? item.badge;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={active}
              tooltip={item.label}
              className={[
                "transition-all duration-150",
                "h-8 gap-2.5 rounded-md text-[13px] [&_svg]:!size-[15px]",
                "font-normal text-ink-soft",
                "data-[active=true]:!font-medium data-[active=true]:!text-foreground",
                "hover:!bg-sidebar-hover hover:!text-foreground",
                "data-[active=true]:!bg-white data-[active=true]:shadow-xs data-[active=true]:border data-[active=true]:border-border",
                "data-[active=true]:hover:!bg-white",
                "data-[active=true]:[&_svg]:!text-primary",
              ].join(" ")}
            >
              <Link href={item.href}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
            {badge ? (
              <SidebarMenuBadge className="text-[11px] tabular-nums text-muted-foreground bg-transparent font-normal mr-1">
                {badge}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  if (!group.collapsible) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.10em] text-subtle-foreground font-semibold h-6 mt-2">
          {group.label}
        </SidebarGroupLabel>
        <SidebarGroupContent>{items}</SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Collapsible defaultOpen={group.defaultOpen ?? true} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="text-[10px] uppercase tracking-[0.10em] text-subtle-foreground font-semibold h-6 hover:text-muted-foreground transition-colors mt-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between group-data-[collapsible=icon]:hidden">
            <span>{group.label}</span>
            <ChevronDown className="size-3 text-subtle-foreground transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>{items}</SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
