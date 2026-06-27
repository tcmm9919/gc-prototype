import type {
  Agent,
  AgentRun,
  Alert,
  AlertSeverity,
  AlertStatus,
  AuditEvent,
  Case,
  CasePriority,
  CaseStatus,
  Channel,
  Client,
  ClientStatus,
  ComplianceScenario,
  Counterparty,
  CustomerType,
  LLMUsageRequest,
  RiskFactor,
  RiskLevel,
  Rule,
  RuleCondition,
  RuleEntity,
  RuleOp,
  ScenarioStatus,
  ScenarioType,
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
  UserRole,
} from "./types";
import { getRiskConfig } from "@/lib/scoring/sources";

let seq = 0;
const id = (prefix: string) => `${prefix}-${(++seq).toString(36).padStart(4, "0")}`;
const pick = <T>(arr: readonly T[], i: number) => arr[i % arr.length];

const FIRST_NAMES_M = ["Алибек", "Данияр", "Ержан", "Нурлан", "Аскар", "Мурат", "Тимур", "Бауыржан"];
const FIRST_NAMES_F = ["Айгерим", "Мадина", "Динара", "Жанар", "Гульнара", "Сауле", "Аружан"];
const LAST_NAMES = ["Касенов", "Серикбаев", "Жумабеков", "Ахметов", "Бекмуратов", "Абдрахманов", "Турсынов", "Балтабаев"];
const LEGAL_PREFIXES = ["ТОО", "АО", "ИП"];
const LEGAL_NAMES = ["Алматы Логистикс", "Caspian Trade", "Astana Build", "Tan Group", "Khan Tengri", "Eurasia Foods", "Steppe Drilling"];
const COUNTRIES = ["KZ", "RU", "UZ", "KG", "TR", "AE", "CN", "DE", "US"];
const SEGMENTS = ["Розничный", "Премиум", "Малый бизнес", "Корпоративный", "Private banking"];
const INCOME_SOURCES = ["Заработная плата", "Предпринимательская деятельность", "Дивиденды", "Аренда", "Продажа имущества"];
const CITIES = ["Алматы", "Астана", "Шымкент", "Караганда", "Актобе", "Атырау"];
const CURRENCIES = ["KZT", "USD", "EUR", "RUB", "CNY"];
const TX_PURPOSES = [
  "Зарплата",
  "Перевод между своими счетами",
  "Оплата услуг",
  "Возврат займа",
  "Покупка валюты",
  "Перевод физлицу",
  "Оплата контракта",
];

/** Коды экономической классификации НБ РК */
const PURPOSE_CODES: ReadonlyArray<{ code: string; description: string }> = [
  { code: "119", description: "Прочие безвозмездные переводы денег физическим лицам" },
  { code: "111", description: "Выплата заработной платы по трудовому договору" },
  { code: "343", description: "Переводы клиентом денег со своего текущего счета в одном банке на свой текущий счет в другом банке" },
  { code: "510", description: "Финансовый лизинг (платёж по графику)" },
  { code: "424", description: "Покупка, выкуп акций и документов, подтверждающих участие в уставном капитале" },
  { code: "590", description: "Поступление денег от иностранного контрагента за оказанные услуги" },
];

/** Филиалы Freedom Bank */
const BRANCHES: ReadonlyArray<{ code: "ALM-001" | "ALA-001" | "ALA-014" | "AST-002" | "SHY-007"; name: string }> = [
  { code: "ALM-001", name: "Центральный филиал, Алматы" },
  { code: "ALA-001", name: "Алмалинский филиал, Алматы" },
  { code: "ALA-014", name: "Бостандыкский филиал, Алматы" },
  { code: "AST-002", name: "Есильский филиал, Астана" },
  { code: "SHY-007", name: "Шымкентский филиал" },
];

const TAGS_TX = ["крупная", "трансгран", "нерезидент", "нал", "регулярный"];
const TAGS_CLIENT = ["PEP", "санкции", "новый", "VIP", "под мониторингом"];

export function makeClient(over: Partial<Client> = {}): Client {
  const i = seq;
  const type: CustomerType = over.type ?? (i % 4 === 0 ? "legal" : "individual");
  const isMale = i % 2 === 0;
  const fullName =
    type === "legal"
      ? `${pick(LEGAL_PREFIXES, i)} «${pick(LEGAL_NAMES, i)}»`
      : `${pick(LAST_NAMES, i)} ${pick(isMale ? FIRST_NAMES_M : FIRST_NAMES_F, i)} ${pick(LAST_NAMES, i + 3)[0]}.`;
  const internalScore = 30 + ((i * 13) % 70);
  // riskLevel всегда выводим из score (пороги 25/50/75) — иначе бейдж и карточка расходятся.
  const riskLevel: RiskLevel = getRiskConfig(internalScore).key;
  return {
    id: over.id ?? id("CL"),
    fullName,
    type,
    segment: pick(SEGMENTS, i),
    riskLevel,
    internalScore,
    iin: type === "individual" ? String(900101400000 + i * 73).slice(0, 12) : undefined,
    bin: type === "legal" ? String(210101400000 + i * 91).slice(0, 12) : undefined,
    birthDate: type === "individual" ? `19${70 + (i % 30)}-0${(i % 9) + 1}-1${(i % 9)}` : undefined,
    registrationDate: type === "legal" ? `201${i % 9}-0${(i % 9) + 1}-1${(i % 9)}` : undefined,
    country: pick(COUNTRIES, i),
    pep: i % 11 === 0,
    sanctioned: i % 23 === 0,
    status: pick<ClientStatus>(["active", "active", "active", "review", "edd", "blocked"], i),
    responsibleId: `USR-${(i % 6) + 1}`,
    lastTransactionAt: new Date(Date.now() - i * 3600_000).toISOString(),
    tags: i % 5 === 0 ? [pick(TAGS_CLIENT, i)] : [],
    incomeSources: [pick(INCOME_SOURCES, i), pick(INCOME_SOURCES, i + 2)],
    email: type === "individual" ? `user${i}@example.kz` : `contact${i}@example.kz`,
    phone: `+7 (7${(i % 10)}${(i % 10)}) ${100 + (i % 900)}-${10 + (i % 90)}-${10 + (i % 90)}`,
    ...over,
  };
}

export function makeCounterparty(over: Partial<Counterparty> = {}): Counterparty {
  const i = seq;
  const country = pick(COUNTRIES, i);
  return {
    name: `${pick(LEGAL_PREFIXES, i)} «${pick(LEGAL_NAMES, i)}»`,
    iban: `KZ${10 + (i % 90)}${"0".repeat(14)}${1000 + (i % 9000)}`,
    country,
    bank: pick(["Halyk Bank", "Kaspi", "Forte Bank", "Jusan", "Freedom"], i),
    iinBin: `${20 + (i % 70)}0140${(100000 + (i * 137) % 899999)}`,
    residency: country === "KZ" ? "Республика Казахстан" : country,
    participantType: "Юр. лицо",
    pdl: false,
    pdlRelative: false,
    oked: pick(
      ["64190 — Денежное посредничество", "46900 — Неспециализированная оптовая торговля", "62010 — Разработка ПО", "68100 — Покупка/продажа недвижимости", "49410 — Грузовые перевозки"],
      i,
    ),
    idDoc: undefined,
    birthDate: undefined,
    birthPlace: undefined,
    legalAddress: `${pick(CITIES, i)}, ${pick(["пр. Абая 10", "ул. Достык 5", "пр. Назарбаева 22", "ул. Сатпаева 90"], i)}`,
    phone: `+7 (7${10 + (i % 89)}) ${100 + (i % 899)}-${10 + (i % 89)}-${10 + ((i * 7) % 89)}`,
    ...over,
  };
}

export function makeTransaction(over: Partial<Transaction> = {}): Transaction {
  const i = seq++;
  const currency = over.currency ?? pick(CURRENCIES, i);
  const amount = over.amount ?? 10_000 + ((i * 12345) % 5_000_000);
  const fxRate = currency === "KZT" ? 1 : currency === "USD" ? 530 : currency === "EUR" ? 580 : currency === "RUB" ? 5.6 : 73;
  const purposeEntry = PURPOSE_CODES[i % PURPOSE_CODES.length];
  const branch = BRANCHES[i % BRANCHES.length];
  const isAnomaly = amount > 1_000_000;
  return {
    id: over.id ?? id("TX"),
    date: new Date(Date.now() - i * 1800_000).toISOString(),
    clientId: over.clientId ?? `CL-${((i % 50) + 1).toString(36).padStart(4, "0")}`,
    counterparty: over.counterparty ?? makeCounterparty(),
    amount,
    currency,
    amountKZT: Math.round(amount * fxRate),
    type: pick<TransactionType>(["transfer", "incoming", "outgoing", "exchange", "cash"], i),
    channel: pick<Channel>(["mobile", "web", "branch", "api"], i),
    riskLevel: pick<RiskLevel>(["low", "low", "medium", "high", "critical"], i),
    status: pick<TransactionStatus>(["completed", "completed", "completed", "review", "blocked"], i),
    tags: i % 4 === 0 ? [pick(TAGS_TX, i)] : [],
    purpose: pick(TX_PURPOSES, i),
    purposeCode: purposeEntry.code,
    purposeDescription: purposeEntry.description,
    goodsType: i % 3 === 0 ? "2000" : undefined,
    goodsDescription: i % 3 === 0 ? "Безвозмездный перевод/материальная помощь другому лицу" : undefined,
    additionalInfo: i % 5 === 0 ? "Возврат долга по расписке" : undefined,
    branchCode: branch.code,
    branchName: branch.name,
    priority: isAnomaly ? "medium" : pick(["low", "low", "low", "medium"] as const, i),
    complianceStatus: pick(["Завершена", "Обработана", "Завершена", "Ожидание", "Завершена"] as const, i),
    geo: { city: pick(CITIES, i), country: "KZ" },
    ...over,
  };
}

export function makeAlert(over: Partial<Alert> = {}): Alert {
  const i = seq;
  return {
    id: over.id ?? id("AL"),
    date: new Date(Date.now() - i * 900_000).toISOString(),
    clientId: `CL-${((i % 50) + 1).toString(36).padStart(4, "0")}`,
    transactionId: i % 3 === 0 ? `TX-${((i % 200) + 1).toString(36).padStart(4, "0")}` : undefined,
    ruleId: `RL-${((i % 12) + 1).toString(36).padStart(4, "0")}`,
    ruleName: pick(
      ["Severance Rule", "Late-night Transfers", "High-Risk Country", "Velocity Spike", "Round-Amount Cash", "PEP Match"],
      i,
    ),
    scenarioId: i % 2 === 0 ? `SC-${((i % 10) + 1).toString(36).padStart(4, "0")}` : undefined,
    severity: pick<AlertSeverity>(["low", "medium", "medium", "high", "critical"], i),
    status: pick<AlertStatus>(["new", "new", "in_progress", "escalated", "closed"], i),
    responsibleId: `USR-${(i % 6) + 1}`,
    ...over,
  };
}

/** Generate a CASE-YYYYMMDD-XXXXXXXX id from an opened-at date */
function generateCaseId(openedAtIso: string, salt: number): string {
  const d = new Date(openedAtIso);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hex = ((salt * 0x9e3779b1) >>> 0).toString(16).padStart(8, "0").toUpperCase().slice(0, 8);
  return `CASE-${y}${m}${day}-${hex}`;
}

export function makeCase(over: Partial<Case> = {}): Case {
  const i = seq;
  const openedAt = new Date(Date.now() - i * 86_400_000).toISOString();
  const isAutoCase = i % 4 === 0;
  return {
    id: over.id ?? generateCaseId(openedAt, i),
    type: isAutoCase ? "Авто-кейс: Транзакционная аномалия" : pick(["AML — отмывание", "KYC — верификация", "Санкционный риск", "Подозрительная активность"], i),
    clientId: `CL-${((i % 50) + 1).toString(36).padStart(4, "0")}`,
    status: pick<CaseStatus>(["open", "in_progress", "in_progress", "in_review", "escalated", "resolved", "closed"], i),
    priority: pick<CasePriority>(["low", "medium", "high", "critical"], i),
    responsibleId: isAutoCase ? "USR-AI" : `USR-${(i % 6) + 1}`,
    openedAt,
    slaDueAt: new Date(Date.parse(openedAt) + 5 * 86_400_000).toISOString(),
    description: isAutoCase
      ? "Сработало правило аномальной транзакции. Воркфлоу 'Income Proof Remediation' собирает справку о доходах и обновляет declared_monthly_income, что позволит пересчитать baseline."
      : "Расследование подозрительной активности, требуется анализ цепочки транзакций.",
    linkedAlertIds: [`AL-${((i % 30) + 1).toString(36).padStart(4, "0")}`],
    linkedTransactionIds: [
      `TX-${((i % 200) + 1).toString(36).padStart(4, "0")}`,
      `TX-${((i % 200) + 2).toString(36).padStart(4, "0")}`,
    ],
    tags: i % 5 === 0 ? ["приоритет", "регулятор"] : [],
    commentCount: isAutoCase ? 5 + (i % 4) : (i * 7) % 12,
    evidenceCount: isAutoCase ? 2 : (i % 5),
    subtaskCount: i % 6,
    autoCase: isAutoCase || undefined,
    ...over,
  };
}

export function makeRule(over: Partial<Rule> = {}): Rule {
  const i = seq;
  return {
    id: over.id ?? id("RL"),
    name: pick(
      [
        "Крупный перевод нерезиденту",
        "Серия мелких транзакций",
        "Транзакция в страну высокого риска",
        "Несоответствие профилю клиента",
        "Кассовая операция > 1 млн KZT",
      ],
      i,
    ),
    description: "Атомарное условие, используемое в сценариях расследования.",
    entity: pick<RuleEntity>(["client", "transaction", "group"], i),
    category: (["transaction", "client", "screening", "behavior"] as const)[i % 4],
    severity: (["high", "medium", "critical", "low", "high"] as const)[i % 5],
    enabled: i % 7 !== 0,
    draft: i % 9 === 4,
    version: [1, 4, 2, 1, 5, 3, 1, 10, 2, 1, 6, 1][i % 12],
    authorId: `USR-${(i % 6) + 1}`,
    updatedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    conditions: [
      { id: id("CN"), field: "amountKZT", op: "gt" as RuleOp, value: 1_000_000 },
      { id: id("CN"), field: "counterparty.country", op: "in" as RuleOp, value: ["AE", "TR", "CY"] },
    ] satisfies RuleCondition[],
    ...over,
  };
}

/** Канонические сценарии из боевой админки */
const STORY_WORKFLOWS = [
  {
    name: "Блокировка клиента",
    pipeline: [
      { type: "block_client", config: { reason: "Сработка регламента" } },
      { type: "create_case", config: { case_type: "Блокировка" } },
      { type: "send_email", config: { to: "manager", subject: "Клиент заблокирован" } },
    ],
  },
  {
    name: "Отчет по документации от клиента",
    pipeline: [
      { type: "ocr_document", config: { doc_tag: "income_proof" } },
      { type: "extract_income", config: {} },
      { type: "generate_report", config: { template: "compliance_brief" } },
    ],
  },
  {
    name: "Полная проверка клиента 6 шагов",
    pipeline: [
      { type: "sanction_check", config: { lists: "all" } },
      { type: "block_client", config: { reason: "Подозрение в санкциях" } },
      { type: "run_agent", config: { agent_id: "income_verification" } },
      { type: "calculate_risk", config: {} },
      { type: "update_kyc_status", config: { status: "IN_REVIEW" } },
      { type: "create_alert", config: { severity: "high" } },
    ],
  },
  {
    name: "Санкционная проверка с отправкой на почту",
    pipeline: [
      { type: "sanction_check", config: { lists: "all" } },
      { type: "send_email", config: { to: "manager", subject: "Sanction screening result" } },
    ],
  },
];

export function makeScenario(over: Partial<ComplianceScenario> = {}): ComplianceScenario {
  const i = seq;
  const isStory = i < STORY_WORKFLOWS.length;
  const story = isStory ? STORY_WORKFLOWS[i] : null;
  return {
    id: over.id ?? id("SC"),
    name:
      story?.name ??
      pick(
        [
          "Подозрительные ночные переводы",
          "Резкий рост оборотов клиента",
          "Цепочка переводов на нерезидентов",
          "Группа связанных клиентов с общим бенефициаром",
          "Сделки с PEP без обоснования",
        ],
        i,
      ),
    description: "Pipeline типизированных активностей, выполняемых над клиентом.",
    type: "client" as ScenarioType,
    status: pick<ScenarioStatus>(["active", "active", "paused", "draft"], i),
    lastRunAt: new Date(Date.now() - i * 3600_000).toISOString(),
    triggerCount: (i * 7) % 200,
    authorId: `USR-${(i % 6) + 1}`,
    ruleIds: [
      `RL-${((i % 12) + 1).toString(36).padStart(4, "0")}`,
      `RL-${((i % 12) + 2).toString(36).padStart(4, "0")}`,
    ],
    createdAt: new Date(Date.now() - i * 86_400_000 - 7 * 86_400_000).toISOString(),
    pipeline: story
      ? story.pipeline.map((s, idx) => ({ id: `step-${i}-${idx}`, type: s.type, config: s.config as Record<string, string | boolean> }))
      : [
          { id: `step-${i}-0`, type: "sanction_check", config: { lists: "all" } },
          { id: `step-${i}-1`, type: "calculate_risk", config: {} },
        ],
    precision: 0.6 + ((i * 13) % 40) / 100,
    recall: 0.55 + ((i * 17) % 40) / 100,
    ...over,
  };
}

export function makeAgent(over: Partial<Agent> = {}): Agent {
  const i = seq;
  const runs: AgentRun[] = Array.from({ length: 5 }, (_, k) => ({
    id: id("RUN"),
    startedAt: new Date(Date.now() - k * 7200_000).toISOString(),
    durationMs: 1500 + ((i + k) * 137) % 8000,
    status: pick<AgentRun["status"]>(["success", "success", "success", "failure"], k),
    inputTokens: 500 + ((i + k) * 23) % 2000,
    outputTokens: 200 + ((i + k) * 19) % 1500,
  }));
  return {
    id: over.id ?? id("AG"),
    name: pick(
      [
        "Агент по верификации источников дохода",
        "Агент по проверке контрагентов",
        "Агент по анализу транзакционных паттернов",
        "Compliance-агент (мета)",
      ],
      i,
    ),
    description: "Специализированный AI-агент с собственным промптом и инструментами.",
    enabled: i % 4 !== 0,
    model: "yandexgpt-5.1/latest",
    instructionsMd:
      "# Роль\nТы — AI-агент по комплаенсу.\n\n## Цель\nАнализировать данные клиента и формировать заключение.\n\n## Ограничения\n- Не давать юридических советов.\n- Все выводы — со ссылкой на источник.\n",
    tools: ["read_client", "search_transactions", "call_ml_model"],
    lastRuns: runs,
    ...over,
  };
}

const AUDIT_ACTIONS = ["Создание", "Обновление", "Удаление", "Вход", "Одобрение", "Отправка", "run", "recalculate"] as const;
const AUDIT_RESOURCES = ["client", "transaction", "alert", "case", "rule", "scenario", "risk", "risk-attributes", "report"] as const;
/** Realistic auditor principals: regular users + system + Compliance Officer AI */
const AUDIT_USERS = ["USR-1", "USR-2", "USR-3", "USR-4", "USR-5", "system", "compliance-officer-ai"];
/** Live admin IPs from real env */
const AUDIT_IPS = ["10.233.80.37", "10.233.79.201", "10.233.70.98", "10.233.87.104", "127.0.0.1"];

export function makeAuditEvent(over: Partial<AuditEvent> = {}): AuditEvent {
  const i = seq;
  const action = pick(AUDIT_ACTIONS, i);
  // `system` user only creates transactions; AI only does run/recalculate
  let user = pick(AUDIT_USERS, i);
  if (action === "Создание" && i % 3 === 0) user = "system";
  if (action === "run" || action === "recalculate") {
    if (i % 4 === 0) user = "compliance-officer-ai";
  }
  return {
    id: over.id ?? id("AU"),
    timestamp: new Date(Date.now() - i * 300_000).toISOString(),
    userId: user,
    action,
    entityType: pick(AUDIT_RESOURCES, i) as AuditEvent["entityType"],
    entityId: `EN-${((i % 99) + 1).toString(36).padStart(4, "0")}`,
    ip: user === "system" ? "127.0.0.1" : pick(AUDIT_IPS, i),
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36",
    ...over,
  };
}

const LLM_AGENTS = [
  "agent",
  "chat_agent",
  "compliance_agent",
  "converter",
  "edd_full",
  "edd_short",
  "monitoring_agent",
  "search_agent",
] as const;

const LLM_MODELS = [
  "deepseek-v32/latest",
  "gpt-oss-120b/latest",
  "qwen3-235b-a22b-fp8/latest",
  "yandexgpt-5.1/latest",
  "gemma-3-27b-it/latest",
] as const;

/** Per-1k-tokens cost in USD (rough approximations from observed live data) */
const MODEL_COST_PER_1K: Record<(typeof LLM_MODELS)[number], { input: number; output: number }> = {
  "deepseek-v32/latest": { input: 0.0015, output: 0.006 },
  "gpt-oss-120b/latest": { input: 0.001, output: 0.003 },
  "qwen3-235b-a22b-fp8/latest": { input: 0.002, output: 0.005 },
  "yandexgpt-5.1/latest": { input: 0.0018, output: 0.005 },
  "gemma-3-27b-it/latest": { input: 0.0008, output: 0.002 },
};

export function makeLLMUsage(over: Partial<LLMUsageRequest> = {}): LLMUsageRequest {
  const i = seq;
  const agentName = pick(LLM_AGENTS, i);
  const model = pick(LLM_MODELS, i);
  // monitoring_agent uses lots of tool tokens (web search)
  const isMonitoring = agentName === "monitoring_agent";
  // converter typically has bigger inputs (PDF/HTML content)
  const isConverter = agentName === "converter";
  const inputTokens = isConverter ? 5000 + ((i * 23) % 2000) : 400 + ((i * 23) % 3000);
  const outputTokens = 200 + ((i * 17) % 1500);
  const toolTokens = isMonitoring ? 10_000 + ((i * 31) % 50_000) : 0;
  const reasoningTokens = model === "deepseek-v32/latest" && i % 5 === 0 ? 300 + ((i * 13) % 1500) : 0;
  const cacheTokens = i % 7 === 0 ? 1000 + ((i * 11) % 3000) : 0;
  const latencyMs = (isMonitoring ? 20_000 : 2_000) + ((i * 137) % 30_000);
  const costs = MODEL_COST_PER_1K[model];
  return {
    id: over.id ?? id("LM"),
    timestamp: new Date(Date.now() - i * 600_000).toISOString(),
    userId: `USR-${(i % 6) + 1}`,
    agentId: i % 3 === 0 ? `AG-${((i % 4) + 1).toString(36).padStart(4, "0")}` : undefined,
    agentName,
    model,
    inputTokens,
    outputTokens,
    toolTokens,
    reasoningTokens,
    cacheTokens,
    latencyMs,
    status: i % 13 === 0 ? "Ошибка" : "Успешно",
    costUSD: ((inputTokens * costs.input + outputTokens * costs.output + toolTokens * costs.input * 0.5) / 1000),
    promptPreview: "Проанализируй источники дохода клиента и сопоставь с транзакциями…",
    responsePreview: "На основе анализа транзакций за последние 90 дней клиент демонстрирует…",
    ...over,
  };
}

export function makeUser(over: Partial<User> = {}): User {
  const i = seq;
  return {
    id: over.id ?? `USR-${(i % 6) + 1}`,
    fullName: `${pick(LAST_NAMES, i)} ${pick(FIRST_NAMES_M, i)[0]}.${pick(FIRST_NAMES_M, i + 2)[0]}.`,
    email: `officer${i + 1}@freedom.kz`,
    role: pick<UserRole>(
      ["admin", "compliance_lead", "compliance_officer", "analyst", "risk_manager", "designer", "auditor"],
      i,
    ),
    status: i % 8 === 0 ? "disabled" : "active",
    lastLoginAt: new Date(Date.now() - i * 7200_000).toISOString(),
    avatarHue: (i * 47) % 360,
    ...over,
  };
}

const RF_POOL: Omit<RiskFactor, "id">[] = [
  {
    name: "Скоринговый балл",
    description: "Итоговый ML-скор клиента из истории скоринга.",
    type: "scoring_history",
    source: "scoring_history.total",
    sourceLabel: "Scoring total",
    aggregation: "latest",
    buckets: [
      { op: "gte", value: 75, score: 100 },
      { op: "gte", value: 50, score: 60 },
      { op: "gte", value: 0, score: 20 },
    ],
    weight: 0.35,
    active: true,
  },
  {
    name: "Проверка на ПДЛ",
    description: "Совпадение клиента со списком публичных должностных лиц.",
    type: "client_field",
    source: "customers.pdl",
    sourceLabel: "PDL flag",
    aggregation: "latest",
    buckets: [{ op: "eq", value: 1, score: 100 }],
    weight: 0.1,
    active: true,
  },
  {
    name: "Крупная кассовая операция",
    description: "Максимальная сумма операции за период.",
    type: "transaction",
    source: "transactions.amount_kzt",
    sourceLabel: "Сумма операции (KZT)",
    aggregation: "max",
    buckets: [
      { op: "gte", value: 5000000, score: 90 },
      { op: "gte", value: 1000000, score: 50 },
    ],
    weight: 0.2,
    active: true,
  },
  {
    name: "Негативные медиа",
    description: "Число adverse-media упоминаний клиента.",
    type: "media",
    source: "media.adverse_count",
    sourceLabel: "Adverse-media hits",
    aggregation: "count",
    buckets: [
      { op: "gte", value: 3, score: 100 },
      { op: "gte", value: 1, score: 50 },
    ],
    weight: 0.15,
    active: false,
  },
  {
    name: "Частота транзакций",
    description: "Количество операций за 30 дней.",
    type: "transaction",
    source: "transactions.count_30d",
    sourceLabel: "Транзакций за 30 дн",
    aggregation: "count",
    buckets: [
      { op: "gte", value: 100, score: 80 },
      { op: "between", value: 30, value2: 100, score: 40 },
    ],
    weight: 0.2,
    active: true,
  },
];

export function makeRiskFactor(over: Partial<RiskFactor> = {}): RiskFactor {
  const i = seq++;
  const t = RF_POOL[i % RF_POOL.length];
  return {
    id: over.id ?? `RF-${(i + 1).toString(36).padStart(4, "0")}`,
    ...t,
    // Сидовые атрибуты — системные: их нельзя удалить, только редактировать/отключать.
    system: true,
    ...over,
  };
}

export function many<T>(make: () => T, count: number): T[] {
  return Array.from({ length: count }, () => make());
}

// ─────────────────────────────────────────────── SCORE BREAKDOWN ──────

import {
  RISK_WEIGHTS,
  type InternalScoringCategory,
  type NewsItem,
  type ScoreHistoryEntry,
  type ScoreSourceKey,
  type TransactionTrigger,
} from "@/lib/scoring/sources";
import {
  calculateProfileRisk,
  type ScoreBreakdown,
  type ScoreSourceData,
} from "@/lib/scoring/formula";

const CHANNEL_LABELS: Record<Channel, string> = {
  mobile: "мобильный банк",
  web: "интернет-банк",
  branch: "филиал",
  api: "API",
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const minAgoIso = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

/**
 * Источники композитного риска для клиента.
 * Showcase: CL-S02 (бывш. Дягилев / killer flow — сценарий удалён,
 * рукописный набор закреплён за CL-S02, сумма вкладов 58.05 ≈ internalScore 58).
 * ⚠️ Формула «взвешенное среднее» — гипотеза (open question #1).
 */
export function makeScoreSources(client: Client): ScoreSourceData[] {
  if (client.id === "CL-S02") {
    // news → высокий (68), pdl → критический (85); итог ≈ 59 ≈ internalScore 58
    return [
      { source: "anomalous_transactions", score: 94, confidence: 89, weight: RISK_WEIGHTS.anomalous_transactions, hasData: true, lastRun: minAgoIso(12), note: "2 сработавших транзакции" },
      { source: "internal_scoring", score: 16, confidence: 94, weight: RISK_WEIGHTS.internal_scoring, hasData: true, lastRun: minAgoIso(12), note: "2 сработавших признака" },
      { source: "edd_agent", score: 71, confidence: 76, weight: RISK_WEIGHTS.edd_agent, hasData: true, lastRun: minAgoIso(38), note: "Отчёт edd_full сгенерирован" },
      { source: "news_agent", score: 68, confidence: 91, weight: RISK_WEIGHTS.news_agent, hasData: true, lastRun: minAgoIso(54), note: "3 негативных упоминания" },
      { source: "pdl_check", score: 85, confidence: 99, weight: RISK_WEIGHTS.pdl_check, hasData: true, lastRun: minAgoIso(12), note: "Совпадение: иностранное ПДЛ (iPDL)" },
    ];
  }

  const h = hashStr(client.id);
  // Формула — 4 фактора (30/40/15/15), ПДЛ вне формулы (excludeFromFormula).
  // Факторы откалиброваны так, что Σ(factor×weight)/Σweight ≈ 1 → взвешенная
  // сумма ≈ internalScore (без warning). ПДЛ остаётся как отдельная проверка.
  const factors: Record<ScoreSourceKey, number> = {
    anomalous_transactions: 1.3,
    internal_scoring: 0.6,
    edd_agent: 1.0,
    news_agent: 1.4,
    pdl_check: 1.5,
  };
  const keys = Object.keys(factors) as ScoreSourceKey[];
  const notes: Record<ScoreSourceKey, string> = {
    anomalous_transactions: `${1 + (h % 2)} сработавших транзакции`,
    internal_scoring: `${h % 3} сработавших признака`,
    edd_agent: "Отчёт edd_full сгенерирован",
    news_agent: `${1 + (h % 3)} упоминания`,
    pdl_check: "Совпадение по списку ПДЛ",
  };
  return keys.map((source, idx) => {
    const jitter = ((h >> (idx * 3)) % 7) - 3;
    const score = Math.max(0, Math.min(100, Math.round(client.internalScore * factors[source] + jitter)));
    const confidence =
      source === "pdl_check" ? 99
      : source === "edd_agent" && h % 3 === 0 ? 64
      : Math.min(98, 72 + ((h >> idx) % 25));
    return {
      source,
      score,
      confidence,
      weight: RISK_WEIGHTS[source],
      hasData: true,
      lastRun: minAgoIso(10 + idx * 17),
      note: notes[source],
    };
  });
}

export function makeScoreBreakdown(
  client: Client,
  overrideScore?: number,
): ScoreBreakdown {
  const sources = makeScoreSources(client);
  if (overrideScore == null) {
    return calculateProfileRisk(sources, RISK_WEIGHTS._config_version);
  }
  // Демо: аддитивный сдвиг баллов источников на delta — двигает взвешенное
  // среднее ровно на delta (в отличие от умножения, не упирается в потолок
  // на критическом уровне). Итог ≈ overrideScore.
  const base = calculateProfileRisk(sources, RISK_WEIGHTS._config_version);
  const delta = overrideScore - base.finalScore;
  const shifted = sources.map((s) => ({
    ...s,
    score: Math.max(2, Math.min(98, Math.round(s.score + delta))),
  }));
  return calculateProfileRisk(shifted, RISK_WEIGHTS._config_version);
}

/** История расчётов риска за `days` дней (детерминированно, конец = текущий API-балл) */
export function makeScoreHistory(client: Client, days = 30): ScoreHistoryEntry[] {
  const final = client.internalScore;
  const h = hashStr(client.id);
  const n = 9 + (h % 3); // 9–11 расчётов
  const span = days * 24 * 3600_000;
  const now = Date.now();
  const values: number[] = [final];
  let v = final;
  for (let i = 1; i < n; i++) {
    const step = (((h >> i) % 11) - 5) * 1.3;
    v = Math.max(2, Math.min(98, v - step));
    values.unshift(Math.round(v));
  }
  return values.map((value, i) => ({
    value,
    date: new Date(now - span + (span / (n - 1)) * i).toISOString(),
  }));
}

/** Дневной ряд риска за N дней (для большого line-графа). Последняя точка = текущий балл. Детерминирован, без Date — SSG-safe. */
export function makeDailyRiskSeries(client: Client, days = 30): number[] {
  const final = client.internalScore;
  const h = hashStr(client.id);
  const out: number[] = [final];
  let v = final;
  for (let i = 1; i < days; i++) {
    const step = (((h >> (i % 24)) % 9) - 4) * 0.9;
    v = Math.max(2, Math.min(98, v - step));
    out.unshift(Math.round(v));
  }
  return out;
}

/** Сработавшие транзакции для drill-down «Аномальные транзакции» */
export function makeAnomalousTransactionsList(
  client: Client,
  transactions: Transaction[],
): TransactionTrigger[] {
  const top = transactions
    .filter((t) => t.clientId === client.id)
    .sort((a, b) => b.amountKZT - a.amountKZT)
    .slice(0, 2);
  const rules = client.id === "CL-S02" ? ["IES-1", "LRG-2"] : ["LRG-2", "GEO-7"];
  const breakdown = makeScoreBreakdown(client);
  const base = breakdown.sources.find((s) => s.source === "anomalous_transactions")?.score ?? 60;
  return top.map((t, i) => ({
    id: t.id,
    href: `/transactions/${t.id}`,
    score: Math.max(5, Math.min(98, base - i * 27 - 3)),
    title: `${t.amount.toLocaleString("ru-RU")} ${t.currency} · ${CHANNEL_LABELS[t.channel]}`,
    subtitle: `${t.id} · ${new Date(t.date).toLocaleDateString("ru-RU")}`,
    ruleCode: rules[i] ?? "LRG-2",
  }));
}

/** Категории внутреннего скоринга (перенос блока «Внутренний скоринг») */
export function makeInternalScoringCategories(client: Client): InternalScoringCategory[] {
  const triggeredGeneral: InternalScoringCategory["triggered"] =
    client.internalScore > 10
      ? [
          { code: "g002", label: "Возраст 18–25 лет", meta: "age=18", weight: "+15" },
          { code: "g009", label: "Ритейл-операции >50 тыс. тенге в месяц", weight: "−30" },
        ]
      : [];
  return [
    { name: "Общие признаки", total: 29, triggered: triggeredGeneral },
    { name: "Мошенничество", total: 13, triggered: [] },
    { name: "Незаконный оборот наркотиков / НОН", total: 14, triggered: [] },
    { name: "Незаконный игровой бизнес", total: 6, triggered: [] },
    { name: "Терроризм", total: 7, triggered: [] },
    { name: "Финансовые пирамиды", total: 11, triggered: [] },
    { name: "Коррупция, хищение бюджетных средств, налоговые преступления", total: 11, triggered: [] },
    { name: "Незаконный оборот криптовалюты", total: 7, triggered: [] },
    { name: "Международные экономические санкции / МЭС", total: 2, triggered: [] },
  ];
}

/** Новости для drill-down новостного агента */
export function makeNewsList(client: Client): NewsItem[] {
  const hasNews = client.id === "CL-S02" || Boolean(client.newsScore);
  if (!hasNews) return [];
  const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toLocaleDateString("ru-RU");
  return [
    { sentiment: "NEGATIVE", title: "Клиент упомянут в расследовании о выводе капитала через ОАЭ", source: "Kazinform", date: daysAgo(4) },
    { sentiment: "NEGATIVE", title: "Налоговая проверка аффилированной компании", source: "Курсив", date: daysAgo(11) },
    { sentiment: "NEUTRAL", title: "Интервью о рынке недвижимости Алматы", source: "Forbes.kz", date: daysAgo(19) },
  ];
}
