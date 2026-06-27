"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, Bot, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ext/status-badge"

const PRINCIPLE_STEPS = [
  "Получает каждое новое оповещение сразу после обработки транзакции.",
  "Анализирует контекст: правило, транзакцию и клиента — и определяет подходящий сценарий действий.",
  "При решении запустить сценарий — создаёт кейс, привязывает оповещение и отправляет клиенту письмо со ссылкой.",
  "Ожидает завершения сценария клиентом (до 7 дней) и повторно проверяет правила по обновлённым данным.",
  "Если правило больше не срабатывает — кейс закрывается автоматически. Иначе менеджер получает письмо с подробностями.",
  "При решении «эскалация» или «пропустить» — отправляет менеджеру письмо или фиксирует решение в журнале.",
]

interface ActivityRow {
  time: string
  action: string
  status: "ok" | "error"
  details: string
  link?: { href: string; label: string }
}

const ACTIVITY: ActivityRow[] = [
  {
    time: "20.06.2026 18:21",
    action: "Эскалировано менеджеру",
    status: "ok",
    details: "",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "20.06.2026 18:21",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — Сработало правило аномальной транзакции, но клиент заблокирован (is_blocked=true) и не имеет email. Воркфлоу 'Подтверждение доходов пользователем' требует отправки email, что невозможно. Ситуация требует ручного вмешательства.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "11.06.2026 15:14",
    action: "Отправлено письмо менеджеру",
    status: "ok",
    details:
      "[Compliance AI] CASE-20260603-85797F0F — manual review required",
    link: { href: "/cases", label: "кейс" },
  },
  {
    time: "11.06.2026 15:14",
    action: "Сценарий завершён",
    status: "error",
    details: "FAILED",
    link: { href: "/cases", label: "кейс" },
  },
  {
    time: "10.06.2026 17:39",
    action: "Отправлено письмо менеджеру",
    status: "ok",
    details:
      "[Compliance AI] CASE-20260603-3AC12F6A — manual review required",
    link: { href: "/cases", label: "кейс" },
  },
  {
    time: "10.06.2026 17:39",
    action: "Сценарий завершён",
    status: "error",
    details: "FAILED",
    link: { href: "/cases", label: "кейс" },
  },
  {
    time: "03.06.2026 17:40",
    action: "Запущен сценарий для клиента",
    status: "ok",
    details: "",
    link: { href: "/cases", label: "кейс" },
  },
  {
    time: "03.06.2026 17:40",
    action: "Создан кейс",
    status: "ok",
    details: "CASE-20260603-85797F0F",
    link: { href: "/cases", label: "кейс" },
  },
  {
    time: "03.06.2026 17:40",
    action: "Решение LLM",
    status: "ok",
    details:
      "dispatch_workflow — Сработало правило аномальной транзакции (сумма 1.5M KZT). У клиента не указан declared_monthly_income, что необходимо для точного расчета baseline. Воркфлоу 'Подтверждение доходов пользователем' (id=5) запрашивает справку о доходах, извлекает declared_monthly_income и обновляет его, что позволит при повторной проверке корректно оценить аномальность.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:36",
    action: "Эскалировано менеджеру",
    status: "ok",
    details: "",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:36",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — Клиент заблокирован (is_blocked=true) и имеет статус KYC FAILED, что требует ручной проверки. Доступный воркфлоу по подтверждению доходов не решает суть правила «Ночная транзакция» и не может быть запущен из-за отсутствия email у клиента. Требуется вмешательство комплаенс-офицера.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:36",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — Сработало правило «Ночная транзакция» для клиента с заблокированным статусом (is_blocked=true) и неудачным KYC (FAILED). Доступный воркфлоу по подтверждению доходов не решает задачу проверки ночной транзакции, а также требует email для отправки ссылки, который у клиента отсутствует. Требуется ручная оценка комплаенс-офицером.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:25",
    action: "Эскалировано менеджеру",
    status: "ok",
    details: "",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:25",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — Сработало правило транзита крупных сумм (15M KZT исходящий перевод ФЛ). Для проверки превышения декларированного доступа требуется справка о доходах, которую собирает воркфлоу 'Подтверждение доходов пользователем'. Однако у клиента не указан email, поэтому автоматическая отправка ссылки на воркфлоу невозможна. Требуется ручное вмешательство для заполнения контактных данных или альтернативной доставки.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:23",
    action: "Эскалировано менеджеру",
    status: "ok",
    details: "",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:23",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — Сработало правило аномальной транзакции (15 млн KZT, превышение baseline). У клиента не указан email, поэтому воркфлоу 'Подтверждение доходов пользователем' не сможет отправить ссылку для загрузки документов. Требуется ручное вмешательство для заполнения контактных данных или альтернативной отправки.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:22",
    action: "Эскалировано менеджеру",
    status: "ok",
    details: "",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:22",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — У клиента отсутствует email, поэтому воркфлоу «Подтверждение доходов пользователем» не сможет отправить ссылку для загрузки документов. Требуется ручное вмешательство для связи с клиентом альтернативным каналом или дополнения контактных данных.",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:16",
    action: "Эскалировано менеджеру",
    status: "ok",
    details: "",
    link: { href: "/alerts", label: "алерт" },
  },
  {
    time: "03.06.2026 17:16",
    action: "Решение LLM",
    status: "ok",
    details:
      "escalate — Сработало правило аномальной транзакции (1.5M KZT). У клиента отсутствует email, поэтому воркфлоу 'Подтверждение доходов пользователем' не может быть запущен автоматически — шаг send_email невыполним. Требуется ручное вмешательство для отправки ссылки альтернативным каналом.",
    link: { href: "/alerts", label: "алерт" },
  },
]

export default function Page() {
  const [enabled, setEnabled] = React.useState(true)
  const [email, setEmail] = React.useState("tenizbaia@freedombank.kz")
  const [dispatch, setDispatch] = React.useState(true)
  const [clearAuto, setClearAuto] = React.useState(true)
  const [stillTriggers, setStillTriggers] = React.useState(true)
  const [escalate, setEscalate] = React.useState(true)

  return (
    <div className="pb-6 pt-5">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* LEFT — пассапорт агента (sticky) */}
        <aside className="self-start lg:sticky lg:top-20">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col items-start gap-2">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-primary-foreground shadow-sm">
                <Bot className="size-5" />
              </div>
              <h1 className="font-heading text-[17px] font-bold leading-tight tracking-[-0.02em]">Комплаенс-агент</h1>
              <StatusBadge tone={enabled ? "success" : "muted"}>{enabled ? "Активен" : "Выключен"}</StatusBadge>
              <span className="font-mono text-xs text-muted-foreground">AG · compliance-officer</span>
            </div>

            <p className="text-xs leading-snug text-muted-foreground">
              Авто-агент: реагирует на новые оповещения, выбирает сценарий для клиента и присылает менеджеру итог.
            </p>

            <div className="flex flex-col gap-2.5 rounded-xl bg-foreground/[0.03] p-4 dark:bg-white/[0.04]">
              <CARow label="Модель" value="yandexgpt-5.1" />
              <CARow label="Тип" value="Авто-агент" />
              <CARow label="Решений" value={ACTIVITY.length} />
              <CARow label="Менеджер" value={email.split("@")[0]} />
            </div>

            <Button
              size="lg"
              variant={enabled ? "outline" : "default"}
              className="w-full justify-center"
              onClick={() => setEnabled((v) => !v)}
            >
              {enabled ? "Выключить агента" : "Включить агента"}
            </Button>
          </div>
        </aside>

        {/* RIGHT — контент */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <h3 className="flex items-center gap-2 font-heading text-[15px] font-semibold">
              <AlertTriangle className="size-4 text-primary" />
              Принцип работы
            </h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {PRINCIPLE_STEPS.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p className="pt-1 text-xs text-muted-foreground">
              Инструкция модели управляется в Yandex AI console; источник в репозитории —{" "}
              <code className="font-mono">api/agent_instructions/compliance_officer_instruction.txt</code>.
            </p>
          </section>

          <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-heading text-[15px] font-semibold">Настройки</h3>

            <div className="space-y-1.5">
              <Label htmlFor="manager-email">Email менеджера для отчётов</Label>
              <Input id="manager-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              <p className="text-xs text-muted-foreground">
                Куда отправлять письма с решениями и итогами. Если пусто — агент работает молча, только пишет в журнал.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Когда отправлять письма</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={dispatch} onCheckedChange={(v) => setDispatch(v === true)} />
                  При запуске сценария клиенту
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={clearAuto} onCheckedChange={(v) => setClearAuto(v === true)} />
                  Когда кейс закрыт автоматически
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={stillTriggers} onCheckedChange={(v) => setStillTriggers(v === true)} />
                  Когда правило всё ещё срабатывает / клиент не ответил
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox checked={escalate} onCheckedChange={(v) => setEscalate(v === true)} />
                  Когда агент эскалирует
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => toast("Изменения отменены")}>
                Отмена
              </Button>
              <Button onClick={() => toast.success("Настройки сохранены")}>
                Сохранить
              </Button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-heading text-[15px] font-semibold">Активность агента</h3>
              <Button variant="outline" size="sm">
                <RefreshCcw className="size-3.5" />
                Обновить
              </Button>
            </div>
            {/* Mobile: список строк вместо таблицы (иначе колонки прячутся за гориз. скроллом). */}
            <div className="divide-y divide-border/60 md:hidden">
              {ACTIVITY.map((row, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium">{row.action}</span>
                    <span
                      className={`shrink-0 inline-flex rounded border px-1.5 py-0.5 font-mono text-xs ${
                        row.status === "ok"
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "border-destructive/30 bg-destructive/15 text-destructive"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">{row.time}</div>
                  {row.details ? <p className="text-xs text-muted-foreground">{row.details}</p> : null}
                  {row.link ? (
                    <Link href={row.link.href} className="text-xs text-primary hover:underline">
                      {row.link.label} ↗
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="whitespace-nowrap px-4 py-2 text-left">
                  Время
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left">
                  Действие
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left">
                  Статус
                </th>
                <th className="px-4 py-2 text-left">Детали</th>
                <th className="whitespace-nowrap px-4 py-2 text-left">
                  Связь
                </th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
                    {row.time}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    {row.action}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-xs ${
                        row.status === "ok"
                          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "border-destructive/30 bg-destructive/15 text-destructive"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {row.details}
                  </td>
                  <td className="px-4 py-2.5">
                    {row.link ? (
                      <Link
                        href={row.link.href}
                        className="text-xs text-primary hover:underline"
                      >
                        {row.link.label} ↗
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function CARow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  )
}
