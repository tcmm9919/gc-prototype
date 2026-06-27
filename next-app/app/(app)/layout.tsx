import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppHeader } from "@/components/shell/app-header";
import { AppMain } from "@/components/shell/app-main";
import { AuthGuard } from "@/components/shell/auth-guard";
import { CommandPaletteProvider } from "@/components/shell/command-palette";
import { DevToolbar } from "@/components/shell/dev-toolbar";
import { GlobalAssistantTrigger } from "@/components/shell/global-assistant-trigger";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CommandPaletteProvider>
        <SidebarProvider
          defaultOpen
          className="h-svh overflow-hidden !bg-transparent"
          style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset className="min-w-0 overflow-hidden bg-transparent">
            <AppMain>
              <Suspense fallback={null}>
                <AppHeader />
              </Suspense>
              <Suspense fallback={null}>
                <div className="px-4 pt-1 sm:px-8">{children}</div>
              </Suspense>
            </AppMain>
          </SidebarInset>
          <Suspense fallback={null}>
            <DevToolbar />
          </Suspense>
          <GlobalAssistantTrigger />
        </SidebarProvider>
      </CommandPaletteProvider>
    </AuthGuard>
  );
}
