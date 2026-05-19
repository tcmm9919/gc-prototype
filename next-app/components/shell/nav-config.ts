import {
  Activity,
  ArrowLeftRight,
  Bell,
  BrainCircuit,
  Folder,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Settings,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Static badge (overridden by live counts in AppSidebar if matching href is wired). */
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Мониторинг",
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
      { href: "/clients", label: "Клиенты", icon: Users },
      { href: "/transactions", label: "Транзакции", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Расследования",
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/rules", label: "Правила", icon: ListChecks },
      { href: "/alerts", label: "Оповещения", icon: Bell },
      { href: "/cases", label: "Кейсы", icon: Folder },
    ],
  },
  {
    label: "Автоматизация",
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/workflows", label: "Конструктор сценариев", icon: Workflow },
      { href: "/ai", label: "AI-Инструменты", icon: Sparkles },
      { href: "/instructions", label: "ML Модели", icon: BrainCircuit },
    ],
  },
  {
    label: "Система",
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/llm-usage", label: "Использование LLM", icon: Activity },
      { href: "/audit", label: "Журнал аудита", icon: ScrollText },
      { href: "/settings/users", label: "Настройки", icon: Settings },
    ],
  },
];

export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Дашборд",
  clients: "Клиенты",
  transactions: "Транзакции",
  chat: "Чат",
  rules: "Правила",
  alerts: "Оповещения",
  cases: "Кейсы",
  workflows: "Конструктор сценариев",
  builder: "Редактор",
  ai: "AI-Инструменты",
  agents: "Агенты",
  "compliance-officer": "Комплаенс-агент",
  instructions: "ML Модели",
  "bank-offline-fs": "Bank Offline Feature Store",
  tsad: "TSAD",
  ctsm: "CTSM",
  "llm-usage": "Использование LLM",
  audit: "Журнал аудита",
  settings: "Настройки",
  users: "Пользователи",
  system: "Система",
  "risk-factors": "Риск-факторы",
  profile: "Профиль",
  new: "Создать",
  scoring: "Скоринг",
  edd: "EDD",
  news: "Новости",
  history: "История",
  documents: "Документы",
  warm: "WARM",
};
