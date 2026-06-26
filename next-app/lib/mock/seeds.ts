import {
  many,
  makeAgent,
  makeAlert,
  makeAuditEvent,
  makeCase,
  makeClient,
  makeLLMUsage,
  makeRiskFactor,
  makeRule,
  makeScenario,
  makeTransaction,
  makeUser,
} from "./factories";
import { storyAlerts, storyCases, storyClients, storyTransactions } from "./stories";
import { getRiskConfig } from "@/lib/scoring/sources";
import type {
  Agent,
  Alert,
  AuditEvent,
  Case,
  Client,
  ComplianceScenario,
  LLMUsageRequest,
  RiskFactor,
  Rule,
  Transaction,
  User,
} from "./types";

export const seedUsers: User[] = [
  makeUser({ id: "USR-1", fullName: "T. Kunapyanov", email: "t.kunapyanov@gmail.com", role: "admin", createdAt: "2026-05-15" }),
  makeUser({ id: "USR-2", fullName: "A. Tuyakbayev", email: "a.tuyakbayev@globerce.capital", role: "admin", createdAt: "2026-05-15" }),
  makeUser({ id: "USR-3", fullName: "Madina S.", email: "madina.satybaldiyeva@globerce.capital", role: "admin", createdAt: "2026-05-04" }),
  makeUser({
    id: "USR-AI",
    fullName: "Compliance Officer AI",
    email: "compliance.ai@globerce.local",
    role: "ai_agent",
    status: "inactive",
    createdAt: "2026-04-29",
  }),
  makeUser({ id: "USR-4", fullName: "A. D.", email: "a.ovezov@globerce.capital", role: "admin", createdAt: "2026-04-24" }),
  makeUser({ id: "USR-5", fullName: "M. M.", email: "meir@globerce.capital", role: "admin", createdAt: "2026-04-24" }),
  makeUser({ id: "USR-6", fullName: "A. T.", email: "tenizbaia@freedombank.kz", role: "admin", createdAt: "2026-04-24" }),
  makeUser({ id: "USR-7", fullName: "E. C.", email: "yevgeniy@globerce.capital", role: "admin", createdAt: "2026-04-24" }),
  makeUser({ id: "USR-8", fullName: "I. L.", email: "ilya.lizikov@globerce.capital", role: "admin", createdAt: "2026-04-24" }),
];

// Curated demo stories идут первыми, чтобы попадаться на глаза при walkthrough;
// фейк-сиды дополняют объёмом, чтобы списки/графики выглядели реалистично.
// riskLevel выводим из internalScore по каноничным порогам (25/50/75), чтобы
// бейдж в списке всегда совпадал с уровнем риска в карточке клиента.
export const seedClients: Client[] = [...storyClients, ...many(makeClient, 80)].map((c) => ({
  ...c,
  riskLevel: getRiskConfig(c.internalScore).key,
}));
// Демо-объём для карточных табов: ~100 айтемов на клиента CL-S01 — чтобы
// пагинация в карточных списках (Транзакции/Оповещения/Кейсы) реально листалась.
const BULK_CLIENT = "CL-S01";
const bulkTransactions = Array.from({ length: 100 }, () => makeTransaction({ clientId: BULK_CLIENT }));
const bulkAlerts = Array.from({ length: 100 }, () => makeAlert({ clientId: BULK_CLIENT }));
const bulkCases = Array.from({ length: 100 }, () => makeCase({ clientId: BULK_CLIENT }));

export const seedTransactions: Transaction[] = [...storyTransactions, ...many(makeTransaction, 300), ...bulkTransactions];
export const seedAlerts: Alert[] = [...storyAlerts, ...many(makeAlert, 60), ...bulkAlerts];
export const seedCases: Case[] = [...storyCases, ...many(makeCase, 35), ...bulkCases];
export const seedRules: Rule[] = many(makeRule, 12);
export const seedScenarios: ComplianceScenario[] = many(makeScenario, 18);
export const seedAgents: Agent[] = [
  makeAgent({
    id: "AG-1",
    name: "Compliance Officer",
    description:
      "Автономный триаж оповещений: создаёт кейс из алерта, запускает ремедиационный воркфлоу, эскалирует или пропускает.",
    model: "yandexgpt-5.1/latest",
    enabled: true,
    tools: ["list_alerts", "create_case", "start_workflow", "escalate", "skip_alert", "send_email"],
    instructionsMd: `# Роль
Ты — Compliance Officer AI. Твоя задача — автономно обрабатывать оповещения (алерты) в системе AML/KYC.

## Процесс
1. Получи список новых оповещений через \`list_alerts(status="new")\`.
2. По каждому алерту прими решение: DISPATCH, ESCALATE или SKIP.
   - **DISPATCH** — создай кейс (\`create_case\`) и запусти ремедиационный воркфлоу (\`start_workflow\`).
   - **ESCALATE** — если severity ≥ high или сумма > 50 000 USD, эскалируй менеджеру (\`escalate\`).
   - **SKIP** — если дубликат или ложное срабатывание, пропусти (\`skip_alert\`) с комментарием.
3. По итогам отправь summary-письмо ответственному офицеру (\`send_email\`).

## Ограничения
- Не принимай финальных решений по блокировке клиента — только эскалируй.
- Все действия логируй в audit trail.
- При неуверенности — эскалируй, не пропускай.`,
  }),
  makeAgent({
    id: "AG-2",
    name: "Верификация источников средств",
    description: "Проверка источников средств клиента в рамках KYC/AML — анализ поступлений, сверка с анкетой, санкционный скрининг.",
    model: "yandexgpt-5.1/latest",
    enabled: true,
    tools: ["read_client", "get_transactions", "check_sanctions", "generate_report"],
    instructionsMd: `# Роль
Ты — агент верификации источников средств (Source of Funds).

## Процесс
1. Получи профиль клиента и историю транзакций.
2. Определи основные источники дохода по паттернам поступлений.
3. Сверь с заявленными источниками в анкете KYC.
4. Проверь контрагентов по санкционным спискам.
5. Сформируй заключение: подтверждён / требует дополнительной проверки / подозрительный.

## Ограничения
- Не давай юридических советов.
- Все выводы — со ссылкой на конкретные транзакции.`,
  }),
  makeAgent({
    id: "AG-3",
    name: "Compliance-саммари",
    description: "Формирует краткое compliance-заключение на основе данных скрининга и скоринга клиента.",
    model: "yandexgpt-5.1/latest",
    enabled: true,
    tools: ["read_client", "get_screening_results", "get_risk_score", "generate_summary"],
    instructionsMd: `# Роль
Ты — агент формирования compliance-саммари.

## Процесс
1. Собери результаты скрининга клиента (санкции, PEP, adverse media).
2. Получи текущий risk score и его компоненты.
3. Сформируй краткое compliance-заключение в структурированном виде.

## Формат вывода
- Статус: CLEAR / REVIEW / ALERT
- Risk Score: числовое значение + уровень
- Ключевые находки: список
- Рекомендация: одно предложение`,
  }),
  makeAgent({
    id: "AG-4",
    name: "Описание рисков",
    description: "Генерирует развёрнутое описание рисков клиента для регуляторной отчётности.",
    model: "yandexgpt-5.1/latest",
    enabled: false,
    tools: ["read_client", "get_risk_factors", "get_transaction_history", "generate_report"],
    instructionsMd: `# Роль
Ты — агент генерации описания рисков для регуляторной отчётности.

## Процесс
1. Проанализируй профиль клиента и историю операций.
2. Выяви ключевые факторы риска (география, объём, контрагенты, PEP-статус).
3. Сформируй развёрнутое описание рисков на русском языке для включения в отчёт.

## Ограничения
- Формат — официальный деловой стиль.
- Каждый фактор риска — с указанием источника данных.
- Не включай рекомендации по решению — только описание рисков.`,
  }),
  // Доп. агенты для масштаба списка — разные модели/инструменты/статусы.
  makeAgent({
    id: "AG-5",
    name: "Скрининг по санкционным спискам",
    description: "Сверяет клиента и контрагентов с OFAC / EU / UN / локальными списками и формирует вердикт.",
    model: "deepseek-v32/latest",
    enabled: true,
    tools: ["read_client", "check_sanctions", "search_web", "generate_report"],
  }),
  makeAgent({
    id: "AG-6",
    name: "Анализ транзакционных паттернов",
    description: "Выявляет нетипичные паттерны переводов: дробление, транзит, velocity-всплески.",
    model: "qwen3-235b-a22b-fp8/latest",
    enabled: true,
    tools: ["get_transactions", "call_ml_model", "explain"],
  }),
  makeAgent({
    id: "AG-7",
    name: "Adverse media монитор",
    description: "Сканирует открытые источники на негативные упоминания о клиенте и его связях.",
    model: "gpt-oss-120b/latest",
    enabled: true,
    tools: ["search_web", "summarize", "generate_report"],
  }),
  makeAgent({
    id: "AG-8",
    name: "Генератор SAR-черновиков",
    description: "Готовит черновик отчёта о подозрительной операции (SAR) по кейсу.",
    model: "gemma-3-27b-it/latest",
    enabled: false,
    tools: ["read_case", "get_transactions", "generate_report"],
  }),
  makeAgent({
    id: "AG-9",
    name: "Классификатор назначений платежей",
    description: "Определяет экономический смысл операции по назначению и КНП.",
    model: "yandexgpt-5.1/latest",
    enabled: true,
    tools: ["get_transactions", "classify"],
  }),
];
export const seedAudit: AuditEvent[] = many(makeAuditEvent, 200);
export const seedLLMUsage: LLMUsageRequest[] = many(makeLLMUsage, 162);
export const seedRiskFactors: RiskFactor[] = many(makeRiskFactor, 5);

export const currentUser: User = seedUsers[2];
