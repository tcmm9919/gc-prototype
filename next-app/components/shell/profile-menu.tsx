"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarCircle } from "@/components/ext/entity-header";
import { currentUser } from "@/lib/mock/seeds";
import { initialsFromName } from "@/lib/format";
import { useMockStore } from "@/lib/mock/store";
import { cn } from "@/lib/utils";

const AVATAR_SRC = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face";

export function ProfileMenu({ expanded = true }: { expanded?: boolean }) {
  const router = useRouter();
  const setAuthed = useMockStore((s) => s.setAuthed);

  const logout = () => {
    setAuthed(false);
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-foreground/[0.04]",
            !expanded && "justify-center",
          )}
        >
          <AvatarCircle
            initials={initialsFromName(currentUser.fullName)}
            size="sm"
            hue={currentUser.avatarHue ?? 200}
            src={AVATAR_SRC}
            alt={currentUser.fullName}
          />
          {expanded ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[14px] font-medium leading-tight">{currentUser.fullName}</span>
                <span className="truncate text-[12px] leading-tight text-muted-foreground">{currentUser.email}</span>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{currentUser.fullName}</span>
            <span className="text-xs text-muted-foreground">{currentUser.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserIcon className="size-4" />
          Профиль и лимиты
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-risk-critical focus:text-risk-critical">
          <LogOut className="size-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
