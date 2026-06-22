import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Bell,
  Folder,
  ListChecks,
  Workflow,
  MessageSquare,
  Bot,
  BrainCircuit,
  Settings,
  ShieldAlert,
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
  footer?: boolean;
};

// Grouped (reference-style). Routes unchanged. `footer` groups render at the bottom (no label).
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Обзор",
    items: [
      { label: "Дашборд", href: "/dashboard", icon: LayoutDashboard },
      { label: "AI чат", href: "/chat", icon: MessageSquare },
    ],
  },
  {
    label: "Работа",
    items: [
      { label: "Клиенты", href: "/clients", icon: Users },
      { label: "Транзакции", href: "/transactions", icon: ArrowLeftRight },
      { label: "Оповещения", href: "/alerts", icon: Bell },
      { label: "Кейсы", href: "/cases", icon: Folder },
      { label: "Риск-факторы", href: "/risk-factors", icon: ShieldAlert },
    ],
  },
  {
    label: "Инструменты",
    items: [
      { label: "Правила", href: "/rules", icon: ListChecks },
      { label: "Сценарии", href: "/workflows", icon: Workflow },
      { label: "Агенты", href: "/ai", icon: Bot },
      { label: "ML Модели", href: "/settings/instructions", icon: BrainCircuit },
    ],
  },
  {
    label: "Система",
    footer: true,
    items: [{ label: "Настройки", href: "/settings", icon: Settings }],
  },
];

// ROUTE_LABELS — used by breadcrumbs/header title derivation. Keep all known routes.
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Дашборд",
  clients: "Клиенты",
  transactions: "Транзакции",
  alerts: "Оповещения",
  cases: "Кейсы",
  "risk-factors": "Риск-факторы",
  rules: "Правила",
  workflows: "Конструктор сценариев",
  chat: "AI чат",
  ai: "Агенты",
  agents: "Агенты",
  "compliance-agent": "Комплаенс-агент",
  instructions: "ML Модели",
  "llm-usage": "Использование LLM",
  audit: "Журнал аудита",
  settings: "Настройки",
  profile: "Профиль",
  styleguide: "Стайлгайд",
  "dashboard-legacy": "Старый дашборд",
};
