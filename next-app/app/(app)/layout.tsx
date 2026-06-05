import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppHeader } from "@/components/shell/app-header";
import { AuthGuard } from "@/components/shell/auth-guard";
import { CommandPaletteProvider } from "@/components/shell/command-palette";
import { DevToolbar } from "@/components/shell/dev-toolbar";
import { GlobalAssistantTrigger } from "@/components/shell/global-assistant-trigger";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CommandPaletteProvider>
        <SidebarProvider
          defaultOpen={false}
          className="h-svh overflow-hidden !bg-transparent"
          style={{ "--sidebar-width": "5.5rem" } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset className="overflow-hidden bg-transparent">
            <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
              <Suspense fallback={null}>
                <AppHeader />
              </Suspense>
              <Suspense fallback={null}>
                <div className="px-8 pt-2">{children}</div>
              </Suspense>
            </main>
          </SidebarInset>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 h-32 z-20 backdrop-blur-xl bg-background/40"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.35) 85%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 55%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.35) 85%, transparent 100%)",
            }}
          />
          <Suspense fallback={null}>
            <DevToolbar />
          </Suspense>
          <GlobalAssistantTrigger />
        </SidebarProvider>
      </CommandPaletteProvider>
    </AuthGuard>
  );
}
