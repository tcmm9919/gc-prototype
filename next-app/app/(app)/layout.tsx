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
        <SidebarProvider className="h-svh overflow-hidden">
          <AppSidebar />
          <SidebarInset className="overflow-hidden md:peer-data-[variant=inset]:my-5 md:peer-data-[variant=inset]:mr-5 md:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:rounded-2xl">
            <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
              <AppHeader />
              <div className="px-8 pt-8">{children}</div>
            </main>
          </SidebarInset>
          <DevToolbar />
          <GlobalAssistantTrigger />
        </SidebarProvider>
      </CommandPaletteProvider>
    </AuthGuard>
  );
}
