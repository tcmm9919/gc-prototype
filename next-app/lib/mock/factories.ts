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
  const riskLevel: RiskLevel = pick<RiskLevel>(["low", "medium", "high", "critical"], i);
  return {
    id: over.id ?? id("CL"),
    fullName,
    type,
    segment: pick(SEGMENTS, i),
    riskLevel,
    internalScore: 30 + ((i * 13) % 70),
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
  return {
    name: `${pick(LEGAL_PREFIXES, i)} «${pick(LEGAL_NAMES, i)}»`,
    iban: `KZ${10 + (i % 90)}${"0".repeat(14)}${1000 + (i % 9000)}`,
    country: pick(COUNTRIES, i),
    bank: pick(["Halyk Bank", "Kaspi", "Forte Bank", "Jusan", "Freedom"], i),
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
    enabled: i % 7 !== 0,
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

export function makeRiskFactor(over: Partial<RiskFactor> = {}): RiskFactor {
  const i = seq;
  return {
    id: over.id ?? `RF-${(i + 1).toString(36).padStart(4, "0")}`,
    name: pick(
      [
        "Страна высокого риска",
        "Политически значимое лицо (PEP)",
        "Расхождение профиля и операций",
        "Крупная кассовая операция",
        "Санкционный список",
      ],
      i,
    ),
    description: "Фактор, влияющий на скоринг клиента и срабатывание правил.",
    category: pick<RiskFactor["category"]>(["geo", "client", "behavior", "product"], i),
    weight: 10 + ((i * 11) % 50),
    ...over,
  };
}

export function many<T>(make: () => T, count: number): T[] {
  return Array.from({ length: count }, () => make());
}
