import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-muted/40 px-6 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-base font-semibold">GCP</span>
          <span className="text-xs text-muted-foreground">Compliance Platform</span>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
