/**
 * Аггрегаторы ID для `generateStaticParams` в dynamic [id]-роутах.
 *
 * ─── Зачем нужен этот файл ──────────────────────────────────────
 * Прод-сборка использует `output: "export"` (см. next.config.mjs)
 * для деплоя на GitHub Pages. Это значит, что для каждой динамической
 * страницы (/alerts/[id], /cases/[id], …) Next генерирует статический
 * HTML только для тех ID, которые перечислены в `generateStaticParams`.
 * Любой ID, не попавший в список — 404 на Pages (в dev работает).
 *
 * Раньше каждый route хранил свой собственный seed literal —
 * при добавлении нового mock-preset нужно было руками
 * дописывать в N route-файлов. Забыли → 404 в проде, dev зелёный.
 *
 * ─── Как добавить новый preset ──────────────────────────────────
 * 1. Создайте новый файл в lib/mock/scenarios/<your-preset>.ts
 *    и экспортируйте оттуда массивы новых сущностей.
 * 2. Импортируйте их сюда и дополните соответствующий getter.
 * 3. Route-файлы трогать НЕ нужно — они уже подтянут изменения.
 *
 * ─── Правила ─────────────────────────────────────────────────────
 * • Все getter'ы возвращают уникальный массив (через Set).
 * • Если preset переиспользует существующие ID (как morning-shift
 *   ссылается на seed clients/transactions) — дописывать НЕ нужно.
 * • Если preset вводит новые ID — обязательно дописать в getter.
 */

import {
  seedAlerts,
  seedCases,
  seedClients,
  seedRules,
  seedScenarios,
  seedTransactions,
  seedAgents,
} from "./seeds";
import {
  morningShiftAlerts,
  morningShiftChatAlerts,
  morningShiftAIcases,
  morningShiftScenarios,
} from "./scenarios/morning-shift-busy";

function uniq(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

export function getAllAlertIds(): string[] {
  return uniq([
    ...seedAlerts.map((a) => a.id),
    ...morningShiftAlerts.map((a) => a.id),
    ...morningShiftChatAlerts.map((a) => a.id),
  ]);
}

export function getAllCaseIds(): string[] {
  return uniq([
    ...seedCases.map((c) => c.id),
    ...morningShiftAIcases.map((c) => c.id),
  ]);
}

export function getAllScenarioIds(): string[] {
  return uniq([
    ...seedScenarios.map((s) => s.id),
    ...morningShiftScenarios.map((s) => s.id),
  ]);
}

export function getAllClientIds(): string[] {
  return uniq([
    ...seedClients.map((c) => c.id),
  ]);
}

export function getAllTransactionIds(): string[] {
  return uniq([
    ...seedTransactions.map((t) => t.id),
  ]);
}

export function getAllRuleIds(): string[] {
  return uniq([
    ...seedRules.map((r) => r.id),
  ]);
}

export function getAllAgentIds(): string[] {
  return uniq([
    ...seedAgents.map((a) => a.id),
  ]);
}
