import { cn } from "@/lib/utils";

interface EntityHeaderProps {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function EntityHeader({ avatar, title, subtitle, badges, actions, className }: EntityHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border px-6 py-5 md:flex-row md:items-center md:justify-between", className)}>
      <div className="flex items-center gap-4 min-w-0">
        {avatar ? <div className="shrink-0">{avatar}</div> : null}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground truncate">{title}</h1>
            {badges}
          </div>
          {subtitle ? <p className="text-sm text-muted-foreground truncate">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

interface AvatarCircleProps {
  initials: string;
  hue?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  src?: string;
  alt?: string;
}

const SIZE: Record<NonNullable<AvatarCircleProps["size"]>, string> = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
};

export function AvatarCircle({ initials, hue = 200, size = "md", className, src, alt }: AvatarCircleProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? initials}
        className={cn(
          "shrink-0 rounded-full object-cover shadow-[inset_0_-1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]",
          SIZE[size],
          className,
        )}
      />
    );
  }
  const bg = `linear-gradient(135deg, oklch(0.86 0.12 ${hue}) 0%, oklch(0.74 0.14 ${(hue + 35) % 360}) 100%)`;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium shadow-[inset_0_-1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]",
        SIZE[size],
        className,
      )}
      style={{ background: bg, color: `oklch(0.22 0.06 ${hue})` }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
