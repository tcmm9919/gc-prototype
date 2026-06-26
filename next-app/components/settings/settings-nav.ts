import { Settings as SettingsIcon, Users, BrainCircuit, Activity, Gauge, ScrollText } from "lucide-react"

export type SettingsNavItem = {
  label: string
  href: string
  icon: typeof Users
  description: string
  eyebrow: string
  unit: string
}
export type SettingsNavGroup = { index: string; label: string; items: SettingsNavItem[] }

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    index: "01",
    label: "Управление",
    items: [
      { label: "Система", href: "/settings/system", icon: SettingsIcon,
        description: "SLA, валюта, пороги риска, конфиг агента", eyebrow: "Конфигурация · ключ-значение", unit: "ключей" },
      { label: "Пользователи", href: "/settings/users", icon: Users,
        description: "Учётные записи, роли и доступы офицеров", eyebrow: "Доступ · роли", unit: "человек" },
    ],
  },
  {
    index: "02",
    label: "AI и данные",
    items: [
      { label: "ML-модели", href: "/settings/instructions", icon: BrainCircuit,
        description: "Каталог моделей: Feature Store, TSAD, CTSM", eyebrow: "Каталог · документация", unit: "модели" },
      { label: "Использование LLM", href: "/settings/llm-usage", icon: Activity,
        description: "Токены, стоимость и латентность вызовов", eyebrow: "Расходы · мониторинг", unit: "запросов" },
      { label: "Лимиты AI", href: "/settings/ai-limits", icon: Gauge,
        description: "Дневной и месячный лимит токенов на группы и пользователей. Дашборд расходов и контроль превышений.", eyebrow: "Лимиты · контроль", unit: "лимитов" },
    ],
  },
  {
    index: "03",
    label: "Безопасность",
    items: [
      { label: "Журнал аудита", href: "/settings/audit", icon: ScrollText,
        description: "Действия пользователей и системы", eyebrow: "Аудит · события", unit: "событий" },
    ],
  },
]

export const SETTINGS_NAV_ITEMS = SETTINGS_NAV.flatMap((g) => g.items)
