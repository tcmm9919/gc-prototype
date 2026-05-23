import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Bell,
  Folder,
  ListChecks,
  Workflow,
  Sparkles,
  Brain,
  Activity,
  ScrollText,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
};

// Flat list — single group, no header. Order: ЦПК-flow first, system tail.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Главное",
    items: [
      { label: "Дашборд", href: "/dashboard", icon: LayoutDashboard },
      { label: "Клиенты", href: "/clients", icon: Users },
      { label: "Транзакции", href: "/transactions", icon: ArrowLeftRight },
      { label: "Алерты", href: "/alerts", icon: Bell },
      { label: "Кейсы", href: "/cases", icon: Folder },
      { label: "Правила", href: "/rules", icon: ListChecks },
      { label: "Сценарии", href: "/workflows", icon: Workflow },
      { label: "AI", href: "/ai", icon: Sparkles },
      { label: "ML Модели", href: "/instructions", icon: Brain },
      { label: "LLM", href: "/llm-usage", icon: Activity },
      { label: "Аудит", href: "/audit", icon: ScrollText },
      { label: "Настройки", href: "/settings/system", icon: Settings },
    ],
  },
];

// ROUTE_LABELS — used by breadcrumbs/header title derivation. Keep all known routes.
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Дашборд",
  clients: "Клиенты",
  transactions: "Транзакции",
  alerts: "Алерты",
  cases: "Кейсы",
  rules: "Правила",
  workflows: "Конструктор сценариев",
  ai: "AI",
  agents: "AI-Инструменты",
  instructions: "ML Модели",
  "llm-usage": "Использование LLM",
  audit: "Журнал аудита",
  settings: "Настройки",
  profile: "Профиль",
  styleguide: "Стайлгайд",
  "dashboard-legacy": "Старый дашборд",
};
