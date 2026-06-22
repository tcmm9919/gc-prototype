/**
 * Мок-данные раздела «Лимиты AI» (Настройки).
 *
 * seedLLMUsage не годится как источник (только USR-1..6, таймстемпы в пределах
 * суток) — поэтому здесь отдельный детерминированный набор, привязанный к реальным
 * пользователям стора. Сумма дневного ряда = «Расход за 30 дней» (KPI и график
 * рассказывают одну историю).
 */

export interface AiLimitGroup {
  id: string;
  name: string;
  isDefault: boolean;
  description: string;
  /** null = безлимит */
  dailyLimit: number | null;
  monthlyLimit: number | null;
}

export type LimitSource = "unlimited" | "group" | "personal";

export interface AiUserUsage {
  id: string;
  name: string;
  email: string;
  group: string;
  dailyTokens: number;
  monthlyTokens: number;
  /** Разрешённый (resolved) лимит: персональный → групповой → безлимит. null = безлимит. */
  dailyLimit: number | null;
  monthlyLimit: number | null;
  source: LimitSource;
}

export interface DailyUsagePoint {
  /** Номер дня в окне 1…30 (1 = 29 дней назад, 30 = сегодня). */
  day: number;
  tokens: number;
}

// Единственная не-дефолтная группа с реальным лимитом — чтобы счётчик участников,
// «Источник лимита = группа» и нетривиальный бар загрузки совпадали по всем табам.
export const LIGHT_GROUP = "light llm usage";
const LIGHT_USER_EMAIL = "ilya.lizikov@globerce.capital";
const LIGHT_DAILY = 100_000;
const LIGHT_MONTHLY = 200_000;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildUserUsage(
  users: ReadonlyArray<{ id: string; fullName: string; email: string }>,
): AiUserUsage[] {
  return users.map((u) => {
    if (u.email === LIGHT_USER_EMAIL) {
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        group: LIGHT_GROUP,
        dailyTokens: 42_000,
        monthlyTokens: 132_000,
        dailyLimit: LIGHT_DAILY,
        monthlyLimit: LIGHT_MONTHLY,
        source: "group",
      };
    }
    const h = hash(u.id);
    const monthlyTokens = h % 5 < 2 ? 1_000 + (h % 18_000) : 0;
    const dailyTokens = h % 11 === 0 ? 200 + (h % 2_700) : 0;
    return {
      id: u.id,
      name: u.fullName,
      email: u.email,
      group: "Default",
      dailyTokens,
      monthlyTokens,
      dailyLimit: null,
      monthlyLimit: null,
      source: "unlimited",
    };
  });
}

export function buildGroups(): AiLimitGroup[] {
  return [
    {
      id: "default",
      name: "Default",
      isDefault: true,
      description:
        "Группа по умолчанию для пользователей без явной группы. Лимиты здесь применяются ко всем сразу.",
      dailyLimit: null,
      monthlyLimit: null,
    },
    {
      id: "light",
      name: LIGHT_GROUP,
      isDefault: false,
      description: "Сниженный лимит для пользователей с лёгким сценарием использования LLM.",
      dailyLimit: LIGHT_DAILY,
      monthlyLimit: LIGHT_MONTHLY,
    },
  ];
}

// Разреженный профиль расхода по дням (форма как на проде: пики + тихие дни).
const DAY_WEIGHTS = [
  1, 0, 2, 2, 8, 5, 3, 0, 3, 0, 0, 0, 4, 0, 1, 0, 2, 3, 0, 1, 0, 2, 0, 0, 3, 0, 1, 0, 2, 4,
];

/** Дневной ряд за 30 дней; сумма ≈ total (совпадает с KPI «Расход за 30 дней»). */
export function buildDailySeries(total: number): DailyUsagePoint[] {
  const sum = DAY_WEIGHTS.reduce((a, b) => a + b, 0) || 1;
  return DAY_WEIGHTS.map((w, i) => ({
    day: i + 1,
    tokens: Math.round((total * w) / sum),
  }));
}
