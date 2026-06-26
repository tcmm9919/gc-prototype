import { ShieldCheck, Sparkles, Lock } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Брендовая панель (split-screen) — тёмно-зелёный градиент + лаймовый акцент */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-primary/15 blur-3xl" />

        {/* Лого */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-white/15 font-heading text-[15px] font-bold text-white backdrop-blur">
            F
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-[15px] font-semibold tracking-tight">Freedom AI</span>
            <span className="text-xs text-white/70">Globerce Compliance</span>
          </div>
        </div>

        {/* Слоган */}
        <div className="relative flex flex-col gap-3">
          <Sparkles className="size-6 text-primary" />
          <h2 className="max-w-md font-heading text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
            Комплаенс под контролем искусственного интеллекта
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/75">
            AML/KYC-мониторинг в реальном времени: скоринг рисков, авто-обработка оповещений и AI-ассистент офицера.
          </p>
        </div>

        {/* Бейджи доверия */}
        <div className="relative flex flex-col gap-2.5 text-sm text-white/80">
          <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Используется в Freedom Bank Kazakhstan</span>
          <span className="flex items-center gap-2"><Lock className="size-4 text-primary" /> Защищённый доступ · 2FA · аудит действий</span>
        </div>
      </div>

      {/* Форма */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Лого для мобайла (панель скрыта) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary font-heading text-[15px] font-bold text-primary-foreground shadow-sm">
              F
            </div>
            <span className="font-heading text-[15px] font-semibold tracking-tight">Freedom AI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
