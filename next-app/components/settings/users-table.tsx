"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useMockData, type User, type UserRole } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { AvatarCircle } from "@/components/ext/entity-header";
import { initialsFromName } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Администратор",
  compliance_lead: "Старший офицер",
  compliance_officer: "Офицер",
  analyst: "Аналитик",
  risk_manager: "Риск-менеджер",
  designer: "Сценарист",
  auditor: "Аудитор",
  ai_agent: "AI-агент",
};

const ASSIGNABLE_ROLES: UserRole[] = [
  "admin",
  "compliance_lead",
  "compliance_officer",
  "analyst",
  "risk_manager",
  "auditor",
];

function AddUserDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("compliance_officer");
  const canSubmit = name.trim() && email.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    toast.success(`Приглашение отправлено: ${name.trim()}`, {
      description: `${email.trim()} · ${ROLE_LABEL[role]}`,
    });
    setName("");
    setEmail("");
    setRole("compliance_officer");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить пользователя</DialogTitle>
          <DialogDescription>Новому сотруднику придёт приглашение на корпоративную почту.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-user-name">Имя</Label>
            <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Айгерим Серикбаева" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-user-email">Email</Label>
            <Input id="new-user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@globerce.capital" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-user-role">Роль</Label>
            <NativeSelect id="new-user-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {ASSIGNABLE_ROLES.map((r) => (
                <NativeSelectOption key={r} value={r}>
                  {ROLE_LABEL[r]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              Отправить приглашение
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU");
}

export function UsersTable() {
  const data = useMockData();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Имя",
      meta: { width: "minmax(0, 1.5fr)" },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AvatarCircle initials={initialsFromName(row.original.fullName)} size="sm" hue={row.original.avatarHue ?? 200} />
          <span className="font-medium">{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { width: "minmax(0, 1.8fr)" },
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() as string}</span>,
    },
    {
      accessorKey: "role",
      header: "Роль",
      cell: ({ getValue }) => {
        const role = getValue() as UserRole;
        // AI-агент отличаем нейтральным тоном от человеческих ролей (info)
        return (
          <StatusBadge tone={role === "ai_agent" ? "muted" : "info"}>{ROLE_LABEL[role]}</StatusBadge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      meta: { width: "minmax(0, 0.9fr)" },
      cell: ({ getValue }) => {
        const status = getValue() as User["status"];
        if (status === "active") return <StatusBadge tone="success">Активен</StatusBadge>;
        if (status === "inactive") return <StatusBadge tone="muted">Неактивен</StatusBadge>;
        return <StatusBadge tone="muted">Отключён</StatusBadge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Создан",
      cell: ({ getValue }) => <span className="text-sm tabular-nums">{formatDate(getValue() as string | undefined)}</span>,
    },
  ];

  return (
    <DataTable<User>
      bordered
      data={data.users}
      columns={columns}
      globalFilterPlaceholder="Поиск по имени, email, роли..."
      pageSize={15}
      renderMobileCard={(u) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <AvatarCircle initials={initialsFromName(u.fullName)} size="sm" hue={u.avatarHue ?? 200} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 truncate font-medium text-foreground">{u.fullName}</span>
                <StatusBadge tone={u.role === "ai_agent" ? "muted" : "info"}>{ROLE_LABEL[u.role]}</StatusBadge>
              </div>
              <span className="truncate font-mono text-xs text-muted-foreground">{u.email}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            {u.status === "active" ? (
              <StatusBadge tone="success">Активен</StatusBadge>
            ) : u.status === "inactive" ? (
              <StatusBadge tone="muted">Неактивен</StatusBadge>
            ) : (
              <StatusBadge tone="muted">Отключён</StatusBadge>
            )}
            <span className="ml-auto tabular-nums">{formatDate(u.createdAt)}</span>
          </div>
        </div>
      )}
      toolbar={
        <AddUserDialog
          trigger={
            <Button size="xl">
              <Plus className="size-4" />
              Добавить пользователя
            </Button>
          }
        />
      }
      emptyAction={
        <AddUserDialog
          trigger={
            <Button size="sm" variant="outline">
              <Plus className="size-4" />
              Добавить пользователя
            </Button>
          }
        />
      }
    />
  );
}
