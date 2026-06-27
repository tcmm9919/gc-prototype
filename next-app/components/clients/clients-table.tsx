"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Crown,
  Filter,
  Globe,
  Lock as LockIcon,
  Play,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react"

import { DataTable } from "@/components/ext/data-table"
import { RiskBadge } from "@/components/ext/risk-badge"
import { StatusDot, type StatusTone } from "@/components/ext/status-dot"
import { MicroPill } from "@/components/ext/micro-pill"
import { AvatarCircle } from "@/components/ext/entity-header"
import { RelativeTime } from "@/components/ext/relative-time"
import { ClientHoverPreview } from "@/components/clients/client-hover-preview"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useMockData,
  useMockStore,
  type Client,
  type ClientStatus,
  type RiskLevel,
} from "@/lib/mock"
import { toast } from "sonner"
import { type DataTableView } from "@/components/ext/data-table"
import { initialsFromName } from "@/lib/format"

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Активен",
  review: "На проверке",
  edd: "EDD",
  blocked: "Заблокирован",
}

const STATUS_TONE: Record<ClientStatus, StatusTone> = {
  active: "success",
  review: "warning",
  edd: "info",
  blocked: "danger",
}

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
}

const isVip = (c: Client) => c.tags.includes("VIP") || c.flags?.VIP === true

const CLIENTS_VIEWS: DataTableView<Client>[] = [
  { id: "all", label: "Все" },
  {
    id: "critical-risk",
    label: "Critical risk",
    predicate: (c) => c.riskLevel === "critical",
  },
  {
    id: "in-edd",
    label: "В EDD",
    predicate: (c) => c.status === "edd",
  },
  {
    id: "blocked",
    label: "Заблокированные",
    predicate: (c) => c.status === "blocked",
  },
]

export function ClientsTable() {
  const router = useRouter()
  const data = useMockData()
  const users = data.users
  const [riskFilter, setRiskFilter] = React.useState<Set<RiskLevel>>(new Set())
  const [statusFilter, setStatusFilter] = React.useState<Set<ClientStatus>>(
    new Set()
  )
  const [typeFilter, setTypeFilter] = React.useState<
    Set<"individual" | "legal">
  >(new Set())
  const [countryFilter, setCountryFilter] = React.useState<Set<string>>(
    new Set()
  )
  const [vipFilter, setVipFilter] = React.useState<Set<"vip" | "non-vip">>(
    new Set()
  )

  const countries = React.useMemo(
    () =>
      [...new Set(data.clients.map((c) => c.country).filter(Boolean))].sort(),
    [data.clients]
  )

  const filtered = React.useMemo(
    () =>
      data.clients.filter((c) => {
        if (riskFilter.size && !riskFilter.has(c.riskLevel)) return false
        if (statusFilter.size && !statusFilter.has(c.status)) return false
        if (typeFilter.size && !typeFilter.has(c.type)) return false
        if (countryFilter.size && !countryFilter.has(c.country)) return false
        if (vipFilter.size) {
          const v = isVip(c)
          if (v && !vipFilter.has("vip")) return false
          if (!v && !vipFilter.has("non-vip")) return false
        }
        return true
      }),
    [
      data.clients,
      riskFilter,
      statusFilter,
      typeFilter,
      countryFilter,
      vipFilter,
    ]
  )

  const userById = React.useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  )

  const columns = React.useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Клиент",
        meta: { width: "minmax(0, 2.4fr)" },
        cell: ({ row }) => {
          const c = row.original
          return (
            <ClientHoverPreview client={c}>
              <Link
                href={`/clients/${c.id}`}
                onClick={(e) => e.stopPropagation()}
                className="group/clientcell flex min-w-0 items-start gap-2"
              >
                <AvatarCircle
                  initials={initialsFromName(c.fullName)}
                  size="sm"
                  hue={(c.id.charCodeAt(3) * 47) % 360}
                />
                <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                  <span className="truncate font-medium group-hover/clientcell:underline">
                    {c.fullName}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span>{c.id}</span>
                    <MicroPill tone="info">{c.segment}</MicroPill>
                    {c.tags.map((t) => (
                      <MicroPill key={t} tone="muted">
                        {t}
                      </MicroPill>
                    ))}
                  </div>
                </div>
              </Link>
            </ClientHoverPreview>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Тип",
        meta: { width: "minmax(0, 0.7fr)" },
        cell: ({ getValue }) =>
          getValue() === "legal" ? "Юр. лицо" : "Физ. лицо",
      },
      {
        accessorKey: "riskLevel",
        header: "Риск",
        meta: { width: "minmax(0, 0.8fr)" },
        sortingFn: (a, b) =>
          RISK_ORDER[a.original.riskLevel] - RISK_ORDER[b.original.riskLevel],
        cell: ({ row }) => <RiskBadge level={row.original.riskLevel} />,
      },
      {
        accessorKey: "internalScore",
        header: "Скор",
        meta: { width: "minmax(0, 0.6fr)" },
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => (
          <StatusDot tone={STATUS_TONE[row.original.status]}>
            {STATUS_LABELS[row.original.status]}
          </StatusDot>
        ),
      },
      {
        accessorKey: "responsibleId",
        header: "Ответственный",
        meta: { width: "minmax(0, 1.3fr)" },
        cell: ({ getValue }) => {
          const u = userById.get(getValue() as string)
          return <span className="text-sm">{u?.fullName ?? "—"}</span>
        },
      },
      {
        accessorKey: "lastTransactionAt",
        header: "Посл. операция",
        cell: ({ getValue }) => <RelativeTime iso={getValue() as string} />,
      },
    ],
    [userById]
  )

  const toggleSet = <T,>(s: Set<T>, v: T): Set<T> => {
    const next = new Set(s)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    return next
  }

  return (
    <DataTable<Client>
      data={filtered}
      views={CLIENTS_VIEWS}
      columns={columns}
      globalFilterPlaceholder="Поиск по имени, ID..."
      onRowClick={(c) => router.push(`/clients/${c.id}`)}
      renderMobileCard={(c) => {
        const u = userById.get(c.responsibleId)
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <AvatarCircle
                initials={initialsFromName(c.fullName)}
                size="sm"
                hue={(c.id.charCodeAt(3) * 47) % 360}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 truncate font-medium text-foreground">{c.fullName}</span>
                  <RiskBadge level={c.riskLevel} />
                </div>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <span>{c.id}</span>
                  <MicroPill tone="info">{c.segment}</MicroPill>
                  {c.tags.slice(0, 2).map((t) => (
                    <MicroPill key={t} tone="muted">{t}</MicroPill>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              <StatusDot tone={STATUS_TONE[c.status]}>{STATUS_LABELS[c.status]}</StatusDot>
              <span>Скор <span className="font-medium tabular-nums text-foreground">{c.internalScore}</span></span>
              <span className="ml-auto truncate">{u?.fullName ?? "—"}</span>
            </div>
          </div>
        )
      }}
      rowLabel={(c) => `Открыть клиента ${c.fullName}`}
      pageSize={20}
      globalFilterFn={(row, _col, value) => {
        const c = row.original
        const q = String(value).toLowerCase()
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          (c.iin ?? c.bin ?? "").includes(q)
        )
      }}
      filters={
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Риск
                {riskFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">
                    {riskFilter.size}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Уровень риска</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["low", "medium", "high", "critical"] as RiskLevel[]).map(
                (r) => (
                  <DropdownMenuCheckboxItem
                    key={r}
                    checked={riskFilter.has(r)}
                    onCheckedChange={() =>
                      setRiskFilter((s) => toggleSet(s, r))
                    }
                  >
                    <RiskBadge level={r} />
                  </DropdownMenuCheckboxItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Статус
                {statusFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">
                    {statusFilter.size}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Статус клиента</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(STATUS_LABELS) as ClientStatus[]).map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilter.has(s)}
                  onCheckedChange={() =>
                    setStatusFilter((set) => toggleSet(set, s))
                  }
                >
                  {STATUS_LABELS[s]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Filter className="size-4" />
                Тип
                {typeFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">
                    {typeFilter.size}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Тип клиента</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={typeFilter.has("individual")}
                onCheckedChange={() =>
                  setTypeFilter((s) => toggleSet(s, "individual"))
                }
              >
                Физ. лицо
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter.has("legal")}
                onCheckedChange={() =>
                  setTypeFilter((s) => toggleSet(s, "legal"))
                }
              >
                Юр. лицо
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Globe className="size-4" />
                Страна
                {countryFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">
                    {countryFilter.size}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-72 overflow-y-auto"
            >
              <DropdownMenuLabel>Страна резидентства</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {countries.map((co) => (
                <DropdownMenuCheckboxItem
                  key={co}
                  checked={countryFilter.has(co)}
                  onCheckedChange={() =>
                    setCountryFilter((s) => toggleSet(s, co))
                  }
                >
                  {co}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xl">
                <Crown className="size-4" />
                VIP
                {vipFilter.size ? (
                  <span className="ml-1 rounded-sm bg-primary/15 px-1 text-xs">
                    {vipFilter.size}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>VIP-статус</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={vipFilter.has("vip")}
                onCheckedChange={() => setVipFilter((s) => toggleSet(s, "vip"))}
              >
                VIP
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={vipFilter.has("non-vip")}
                onCheckedChange={() =>
                  setVipFilter((s) => toggleSet(s, "non-vip"))
                }
              >
                Не VIP
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      bulkActions={(selected, clear) => {
        const ids = selected.map((c) => c.id)
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-background hover:bg-background/10"
              onClick={() => {
                toast.info(`Сценарий запущен на ${ids.length} клиентов`)
                clear()
              }}
            >
              <Play className="size-3.5" />
              Запустить сценарий
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-background hover:bg-background/10"
              onClick={() => {
                const snapshot = useMockStore
                  .getState()
                  .data.clients.filter((c) => ids.includes(c.id))
                useMockStore
                  .getState()
                  .bulkUpdateClients(ids, { status: "review" })
                toast.success(`${ids.length} клиентов на проверке`, {
                  action: {
                    label: "Отменить",
                    onClick: () =>
                      useMockStore.getState().bulkUpsertClients(snapshot),
                  },
                })
                clear()
              }}
            >
              <Search className="size-3.5" />
              На проверку
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-background hover:bg-background/10"
              onClick={() => {
                const snapshot = useMockStore
                  .getState()
                  .data.clients.filter((c) => ids.includes(c.id))
                useMockStore
                  .getState()
                  .bulkUpdateClients(ids, { status: "edd" })
                toast.success(`${ids.length} клиентов переведены в EDD`, {
                  action: {
                    label: "Отменить",
                    onClick: () =>
                      useMockStore.getState().bulkUpsertClients(snapshot),
                  },
                })
                clear()
              }}
            >
              <ShieldAlert className="size-3.5" />В EDD
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-red-400 hover:bg-red-400/10"
              onClick={() => {
                const snapshot = useMockStore
                  .getState()
                  .data.clients.filter((c) => ids.includes(c.id))
                useMockStore
                  .getState()
                  .bulkUpdateClients(ids, { status: "blocked" })
                toast.warning(`${ids.length} клиентов заблокированы`, {
                  action: {
                    label: "Отменить",
                    onClick: () =>
                      useMockStore.getState().bulkUpsertClients(snapshot),
                  },
                })
                clear()
              }}
            >
              <LockIcon className="size-3.5" />
              Заблокировать
            </Button>
          </>
        )
      }}
      emptyAction={
        <Button asChild size="sm" variant="outline">
          <Link href="/clients/new">
            <Plus className="size-4" />
            Добавить клиента
          </Link>
        </Button>
      }
    />
  )
}
