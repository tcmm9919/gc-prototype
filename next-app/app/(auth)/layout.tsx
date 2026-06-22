export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-muted/40 px-6 py-12">
      {/* Бренд — единый с оболочкой приложения (см. app-sidebar.tsx) */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary font-heading text-[15px] font-bold text-primary-foreground shadow-sm">
          F
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-[15px] font-semibold tracking-tight">Freedom AI</span>
          <span className="text-xs text-muted-foreground">Globerce Compliance</span>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
