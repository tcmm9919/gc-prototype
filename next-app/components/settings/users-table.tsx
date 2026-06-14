"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMockData, type User, type UserRole } from "@/lib/mock";
import { DataTable } from "@/components/ext/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ext/status-badge";
import { AvatarCircle } from "@/components/ext/entity-header";
import { initialsFromName } from "@/lib/format";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Администратор",
  compliance_lead: "Старший офицер",
  compliance_officer: "Офицер",
  analyst: "Аналитик",
  risk_manager: "Риск-менеджер",
  designer: "Сценарист",
  auditor: "Аудитор",
  ai_agent: "ai_agent",
};

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
        if (role === "ai_agent") {
          return <span className="text-xs font-mono text-muted-foreground">ai_agent</span>;
        }
        return <StatusBadge tone="info">{ROLE_LABEL[role]}</StatusBadge>;
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
      toolbar={
        <Button size="xl">
          <Plus className="size-4" />
          Добавить пользователя
        </Button>
      }
      emptyAction={
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Добавить пользователя
        </Button>
      }
    />
  );
}
