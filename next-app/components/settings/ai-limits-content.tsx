"use client";

import * as React from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useMockData } from "@/lib/mock";
import {
  buildDailySeries,
  buildGroups,
  buildUserUsage,
  LIGHT_GROUP,
  type AiUserUsage,
  type LimitSource,
} from "@/lib/mock/ai-limits";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ext/status-badge";
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
import { TokenUsageBars } from "@/components/settings/token-usage-bars";

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
const fmtLimit = (n: number | null) => (n == null ? "∞" : fmt(n));

const SOURCE_LABEL: Record<LimitSource, string> = {
  unlimited: "безлимит",
  group: "группа",
  personal: "персональный",
};

type TabId = "users" | "groups" | "personal";
const TABS: { id: TabId; label: string }[] = [
  { id: "users", label: "Расход по пользователям" },
  { id: "groups", label: "Группы" },
  { id: "personal", label: "Персональные лимиты" },
];

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="py-0">
      <CardContent className="space-y-1 px-4 py-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </CardContent>
    </Card>
  );
}

/** Загрузка лимита: текст «безлимит» либо бар + %-метка (смысл не только цветом). */
function LoadCell({ used, limit }: { used: number; limit: number | null }) {
  if (limit == null) {
    return <span className="text-sm text-muted-foreground">безлимит</span>;
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const tone =
    pct >= 90 ? "bg-risk-critical" : pct >= 70 ? "bg-risk-medium" : "bg-risk-low";
  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.08]">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}

export function AiLimitsContent() {
  const data = useMockData();

  const usage = React.useMemo<AiUserUsage[]>(() => buildUserUsage(data.users), [data.users]);
  const groups = React.useMemo(() => buildGroups(), []);

  const kpi = React.useMemo(() => {
    const daily = usage.reduce((s, u) => s + u.dailyTokens, 0);
    const monthly = usage.reduce((s, u) => s + u.monthlyTokens, 0);
    const over = usage.filter(
      (u) => u.monthlyLimit != null && u.monthlyTokens > u.monthlyLimit,
    ).length;
    return { daily, monthly, over };
  }, [usage]);

  const series = React.useMemo(() => buildDailySeries(kpi.monthly), [kpi.monthly]);

  const memberCount = React.useMemo(
    () => ({
      Default: usage.filter((u) => u.group === "Default").length,
      [LIGHT_GROUP]: usage.filter((u) => u.group === LIGHT_GROUP).length,
    }),
    [usage],
  );

  const [tab, setTab] = React.useState<TabId>("users");

  return (
    <div className="w-full">
      {/* Сегментированный контрол (как saved-views в таблицах проекта) */}
      <div
        role="tablist"
        aria-label="Лимиты AI"
        className="mb-5 inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-foreground/[0.06] p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-md px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "users" ? <UsersTab usage={usage} kpi={kpi} series={series} /> : null}
      {tab === "groups" ? <GroupsTab groups={groups} memberCount={memberCount} /> : null}
      {tab === "personal" ? <PersonalTab usage={usage} /> : null}
    </div>
  );
}

/* ───────────────────────── Tab 1 — расход по пользователям ──────────────── */

function UsersTab({
  usage,
  kpi,
  series,
}: {
  usage: AiUserUsage[];
  kpi: { daily: number; monthly: number; over: number };
  series: ReturnType<typeof buildDailySeries>;
}) {
  const [query, setQuery] = React.useState("");
  const rows = usage.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Расход за сутки" value={`${fmt(kpi.daily)} ток.`} />
        <StatCard label="Расход за 30 дней" value={`${fmt(kpi.monthly)} ток.`} />
        <StatCard
          label="Превысили лимит"
          value={kpi.over}
          hint={kpi.over === 0 ? "все в пределах лимитов" : "требуется внимание"}
        />
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="font-heading text-[15px] font-semibold">Расход токенов по дням, 30 дней</h3>
          <TokenUsageBars data={series} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[13px] text-muted-foreground">
                <th className="px-4 py-3 font-normal">Пользователь</th>
                <th className="px-4 py-3 font-normal">Группы</th>
                <th className="px-4 py-3 text-right font-normal">Сутки</th>
                <th className="px-4 py-3 font-normal">Загрузка / сутки</th>
                <th className="px-4 py-3 text-right font-normal">30 дней</th>
                <th className="px-4 py-3 font-normal">Загрузка / 30д</th>
                <th className="px-4 py-3 font-normal">Источник лимита</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone="muted">{u.group}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmt(u.dailyTokens)} / {fmtLimit(u.dailyLimit)}
                  </td>
                  <td className="px-4 py-3">
                    <LoadCell used={u.dailyTokens} limit={u.dailyLimit} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmt(u.monthlyTokens)} / {fmtLimit(u.monthlyLimit)}
                  </td>
                  <td className="px-4 py-3">
                    <LoadCell used={u.monthlyTokens} limit={u.monthlyLimit} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{SOURCE_LABEL[u.source]}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Никто не найден по запросу «{query}».
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────── Tab 2 — группы ──────────────────────── */

function GroupsTab({
  groups,
  memberCount,
}: {
  groups: ReturnType<typeof buildGroups>;
  memberCount: Record<string, number>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewGroupDialog />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[13px] text-muted-foreground">
              <th className="px-4 py-3 font-normal">Название</th>
              <th className="px-4 py-3 font-normal">Описание</th>
              <th className="px-4 py-3 text-right font-normal">Лимит сут.</th>
              <th className="px-4 py-3 text-right font-normal">Лимит 30д</th>
              <th className="px-4 py-3 text-right font-normal">Участников</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium">{g.name}</span>
                  {g.isDefault ? (
                    <span className="ml-1.5 text-xs text-muted-foreground">по умолчанию</span>
                  ) : null}
                </td>
                <td className="max-w-md px-4 py-3 text-muted-foreground">
                  {g.description || "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtLimit(g.dailyLimit)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtLimit(g.monthlyLimit)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{memberCount[g.name] ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  {g.isDefault ? null : (
                    <button
                      type="button"
                      onClick={() => toast.warning(`Группа «${g.name}» удалена`)}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <Trash2 className="size-3.5" />
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewGroupDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [daily, setDaily] = React.useState("");
  const [monthly, setMonthly] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    toast.success(`Группа «${name.trim()}» создана`);
    setName("");
    setDescription("");
    setDaily("");
    setMonthly("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Новая группа
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая группа лимитов</DialogTitle>
          <DialogDescription>
            Лимиты группы применяются ко всем её участникам. Пустое поле = безлимит.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="grp-name">
              Название <span className="text-destructive">*</span>
            </Label>
            <Input
              id="grp-name"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. heavy llm usage"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grp-desc">Описание</Label>
            <Input
              id="grp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Для кого эта группа"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="grp-daily">Лимит сут., токенов</Label>
              <Input
                id="grp-daily"
                type="number"
                min={0}
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                placeholder="безлимит"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grp-monthly">Лимит 30д, токенов</Label>
              <Input
                id="grp-monthly"
                type="number"
                min={0}
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                placeholder="безлимит"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">Создать группу</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────── Tab 3 — персональные лимиты ───────────────────── */

function PersonalTab({ usage }: { usage: AiUserUsage[] }) {
  const [selectedId, setSelectedId] = React.useState(usage[0]?.id ?? "");
  const [daily, setDaily] = React.useState("");
  const [monthly, setMonthly] = React.useState("");

  const selected = usage.find((u) => u.id === selectedId) ?? usage[0];

  const select = (id: string) => {
    setSelectedId(id);
    setDaily("");
    setMonthly("");
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    toast.success(`Персональный лимит для «${selected.name}» сохранён`);
  };

  if (!selected) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Список пользователей */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-3 py-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Пользователи
        </div>
        <div className="max-h-[480px] overflow-y-auto p-1.5">
          {usage.map((u) => {
            const active = u.id === selected.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => select(u.id)}
                className={cn(
                  "flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-foreground/[0.04]",
                )}
                aria-current={active}
              >
                <span className="text-sm font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.email}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Детали выбранного пользователя */}
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="py-0">
            <CardContent className="space-y-1 px-4 py-3">
              <span className="text-xs text-muted-foreground">За последние 24 часа</span>
              <div className="text-xl font-semibold tabular-nums">
                {fmt(selected.dailyTokens)} / {fmtLimit(selected.dailyLimit)} ток.
              </div>
              <span className="text-xs text-muted-foreground">
                источник: {SOURCE_LABEL[selected.source]}
              </span>
            </CardContent>
          </Card>
          <Card className="py-0">
            <CardContent className="space-y-1 px-4 py-3">
              <span className="text-xs text-muted-foreground">За последние 30 дней</span>
              <div className="text-xl font-semibold tabular-nums">
                {fmt(selected.monthlyTokens)} / {fmtLimit(selected.monthlyLimit)} ток.
              </div>
              <span className="text-xs text-muted-foreground">
                источник: {SOURCE_LABEL[selected.source]}
              </span>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={save} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Персональный лимит имеет приоритет над групповым. Пустое поле — наследовать из группы.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pers-daily">Дневной лимит, токенов</Label>
              <Input
                id="pers-daily"
                type="number"
                min={0}
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                placeholder={selected.dailyLimit == null ? "безлимит" : fmt(selected.dailyLimit)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pers-monthly">Месячный лимит, токенов</Label>
              <Input
                id="pers-monthly"
                type="number"
                min={0}
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                placeholder={selected.monthlyLimit == null ? "безлимит" : fmt(selected.monthlyLimit)}
              />
            </div>
          </div>
          <Button type="submit">Сохранить лимит</Button>
        </form>
      </div>
    </div>
  );
}
