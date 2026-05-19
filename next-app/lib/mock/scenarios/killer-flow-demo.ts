/**
 * Killer flow — преднастроенный демо-сценарий для walkthrough.
 *
 * Цепочка событий по клиенту Дягилев Михаил Владимирович (см. context.md §14):
 *   Транзакция (1.5M KZT, код 119)
 *     → Правило 'Транзакционная аномалия' v2
 *       → Alert AL-KILLER-01 (severity high)
 *         → Compliance Officer AI создаёт CASE-20260506-7F6A3D24
 *           → workflow 'Income Proof Remediation' (6 шагов)
 *             → клиент загружает income_anomaly_remediation.pdf
 *               → OCR → declared_monthly_income = 6_240_000 KZT
 *                 → Перепроверка правил → правило больше не срабатывает
 *                   → Кейс закрыт автоматически
 *
 * Артефакты используются в Tier-C8 verification: одна цепочка прослеживается на
 * 6+ экранах одновременно.
 */

import type {
  Alert,
  AuditEvent,
  Case,
  Client,
  ComplianceScenario,
  LLMUsageRequest,
  Rule,
  Transaction,
} from "../types";

const DEMO_CLIENT_ID = "CL-KILLER-DYAGILEV";
const DEMO_TX_ID = "701b2188-bb67-4ce6-9240-34a10cb37aa8";
const DEMO_ALERT_ID = "e0f632de-6ce6-4668-b100-692d718d6dff";
const DEMO_CASE_ID = "CASE-20260506-7F6A3D24";
const DEMO_RULE_ID = "RL-KILLER-ANOMALY";
const DEMO_WORKFLOW_ID = "SC-KILLER-REMEDIATION";

const T = (h: number): string => new Date(Date.parse("2026-05-06T16:49:00+05:00") + h * 3600_000).toISOString();
const M = (mins: number): string => new Date(Date.parse("2026-05-06T16:49:00+05:00") + mins * 60_000).toISOString();

export const killerFlowClient: Client = {
  id: DEMO_CLIENT_ID,
  fullName: "Дягилев Михаил Владимирович",
  latinName: "DYAGILEV MIKHAIL VLADIMIROVICH",
  type: "individual",
  segment: "Розничный",
  riskLevel: "medium",
  internalScore: 51,
  iin: "760202050409",
  birthDate: "1976-02-02",
  country: "RU",
  countryFullName: "Российская Федерация",
  pep: false,
  sanctioned: false,
  status: "review",
  responsibleId: "USR-AI",
  lastTransactionAt: T(0),
  tags: ["PDL"],
  incomeSources: ["Заработная плата"],
  email: "dyagilev.mv@example.com",
  phone: "+7 (701) 555-12-34",
  cardVersion: "2.1",
  firstName: "Михаил",
  lastName: "Дягилев",
  middleName: "Владимирович",
  registrationDate: "2024-03-12",
  serviceDays: 786,
  birthplace: "Москва",
  accountBranch: "Центральный филиал, Алматы",
  flags: {
    VIP: "—",
    PEP: "Нет",
    PDL: true,
    EDD: "—",
    FATCA_group: "—",
    FATCA_individual: "—",
    OESR_group: "—",
    OESR_individual: "—",
    representative: "—",
    antifraud: "—",
    limited_account: "—",
    Blacklist: "—",
    iPDL: "—",
    nPDL: "—",
  },
  notificationChannels: { email: true, sms: false, push: false },
  declaredMonthlyIncome: 6_240_000,
  newsScore: 12,
  eddScore: 28,
};

export const killerFlowTransaction: Transaction = {
  id: DEMO_TX_ID,
  date: T(0),
  clientId: DEMO_CLIENT_ID,
  counterparty: {
    name: "Частное лицо (по расписке)",
    iban: undefined,
    country: "KZ",
    bank: "—",
  },
  amount: 1_500_000,
  currency: "KZT",
  amountKZT: 1_500_000,
  type: "outgoing",
  channel: "branch",
  riskLevel: "medium",
  status: "completed",
  tags: ["крупная"],
  purpose: "Возврат долга по расписке",
  purposeCode: "119",
  purposeDescription: "Прочие безвозмездные переводы денег физическим лицам",
  goodsType: "2000",
  goodsDescription: "Безвозмездный перевод/материальная помощь другому лицу",
  additionalInfo: "Возврат долга по расписке от 12.01.2026",
  branchCode: "ALM-001",
  branchName: "Центральный филиал, Алматы",
  priority: "medium",
  complianceStatus: "Завершена",
  scenarioId: DEMO_RULE_ID,
  geo: { city: "Алматы", country: "KZ" },
};

export const killerFlowRule: Rule = {
  id: DEMO_RULE_ID,
  name: "Транзакционная аномалия",
  description:
    "Транзакция в 3 раза превышает ожидаемую сумму клиента (скользящее среднее или 1/10 заявленного месячного дохода).",
  entity: "transaction",
  enabled: true,
  authorId: "USR-3",
  updatedAt: "2026-04-29T15:54:00+05:00",
  conditions: [
    { id: "cond-1", field: "amountKZT", op: "gt", value: 1_000_000 },
  ],
};

export const killerFlowAlert: Alert = {
  id: DEMO_ALERT_ID,
  date: M(1),
  clientId: DEMO_CLIENT_ID,
  transactionId: DEMO_TX_ID,
  ruleId: DEMO_RULE_ID,
  ruleName: "Транзакционная аномалия",
  scenarioId: DEMO_RULE_ID,
  severity: "high",
  status: "rejected",
  responsibleId: "USR-AI",
};

export const killerFlowCase: Case = {
  id: DEMO_CASE_ID,
  type: "Авто-кейс: Транзакционная аномалия",
  clientId: DEMO_CLIENT_ID,
  status: "resolved",
  priority: "high",
  responsibleId: "USR-AI",
  openedAt: T(0),
  slaDueAt: T(24),
  description:
    "Сработало правило аномальной транзакции (1 500 000 KZT превышает ожидаемый baseline в 3 раза). У клиента не указан declared_monthly_income. Воркфлоу 'Income Proof Remediation' собирает справку о доходах и обновляет declared_monthly_income, что позволит пересчитать baseline и снять алерт при повторной проверке.",
  linkedAlertIds: [DEMO_ALERT_ID],
  linkedTransactionIds: [DEMO_TX_ID],
  tags: ["авто", "income-proof"],
  commentCount: 5,
  evidenceCount: 2,
  subtaskCount: 0,
  autoCase: true,
};

export const killerFlowWorkflow: ComplianceScenario = {
  id: DEMO_WORKFLOW_ID,
  name: "Income Proof Remediation",
  description: "Автоматическое получение и анализ справки о доходах с пересчётом baseline.",
  type: "client",
  status: "active",
  lastRunAt: M(3),
  triggerCount: 1,
  authorId: "USR-AI",
  ruleIds: [DEMO_RULE_ID],
  precision: 0.95,
  recall: 0.92,
  createdAt: "2026-04-29T15:54:00+05:00",
  pipeline: [
    { id: "kf-1", type: "create_alert", config: { severity: "high" } },
    { id: "kf-2", type: "send_email", config: { to: "client", subject: "Требуется подтверждение дохода", template: "income_request" } },
    { id: "kf-3", type: "ocr_document", config: { doc_tag: "income_proof" } },
    { id: "kf-4", type: "extract_income", config: {} },
    { id: "kf-5", type: "calculate_risk", config: {} },
    { id: "kf-6", type: "update_kyc_status", config: { status: "APPROVED" } },
  ],
};

export const killerFlowLLMUsage: LLMUsageRequest[] = [
  llm("decision_open_case", T(0), 3754, 1086),
  llm("dispatch_workflow", M(1), 3753, 1139),
  llm("recheck_rules", M(3), 3755, 855),
  llm("close_case_email", M(3), 3756, 1107),
  llm("extract_income_ocr", M(2), 5836, 549, { agentName: "converter" }),
  llm("compliance_decision_2", M(63), 3764, 1872),
  llm("compliance_decision_3", M(65), 3770, 1519),
  llm("compliance_decision_4", M(128), 3755, 1339),
  llm("compliance_decision_5", M(130), 3753, 728),
  llm("compliance_decision_6", M(132), 3754, 1086),
];

function llm(
  suffix: string,
  ts: string,
  inputTokens: number,
  outputTokens: number,
  over: Partial<LLMUsageRequest> = {},
): LLMUsageRequest {
  const cost = (inputTokens * 0.0015 + outputTokens * 0.006) / 1000;
  return {
    id: `LM-KF-${suffix}`,
    timestamp: ts,
    userId: "USR-AI",
    agentName: "compliance_agent",
    model: "deepseek-v32/latest",
    inputTokens,
    outputTokens,
    toolTokens: 0,
    reasoningTokens: 0,
    cacheTokens: 0,
    latencyMs: 27585,
    status: "Успешно",
    costUSD: cost,
    promptPreview: "Compliance Officer AI: проанализировать алерт и определить действие...",
    responsePreview: "dispatch_workflow — Income Proof Remediation",
    relatedEntityType: "case",
    relatedEntityId: DEMO_CASE_ID,
    ...over,
  };
}

export const killerFlowAuditEvents: AuditEvent[] = [
  {
    id: "AU-KF-1",
    timestamp: T(0),
    userId: "system",
    action: "Создание",
    entityType: "transaction",
    entityId: DEMO_TX_ID,
    ip: "127.0.0.1",
    userAgent: "system",
  },
  {
    id: "AU-KF-2",
    timestamp: M(1),
    userId: "compliance-officer-ai",
    action: "Создание",
    entityType: "alert",
    entityId: DEMO_ALERT_ID,
    ip: "10.233.80.37",
    userAgent: "compliance-agent",
  },
  {
    id: "AU-KF-3",
    timestamp: M(1),
    userId: "compliance-officer-ai",
    action: "Создание",
    entityType: "case",
    entityId: DEMO_CASE_ID,
    ip: "10.233.80.37",
    userAgent: "compliance-agent",
  },
  {
    id: "AU-KF-4",
    timestamp: M(1),
    userId: "compliance-officer-ai",
    action: "run",
    entityType: "scenario",
    entityId: DEMO_WORKFLOW_ID,
    ip: "10.233.80.37",
    userAgent: "compliance-agent",
  },
  {
    id: "AU-KF-5",
    timestamp: M(3),
    userId: "compliance-officer-ai",
    action: "recalculate",
    entityType: "risk",
    entityId: DEMO_CLIENT_ID,
    ip: "10.233.80.37",
    userAgent: "compliance-agent",
  },
  {
    id: "AU-KF-6",
    timestamp: M(3),
    userId: "compliance-officer-ai",
    action: "Обновление",
    entityType: "case",
    entityId: DEMO_CASE_ID,
    ip: "10.233.80.37",
    userAgent: "compliance-agent",
  },
  {
    id: "AU-KF-7",
    timestamp: M(3),
    userId: "compliance-officer-ai",
    action: "Отправка",
    entityType: "report",
    entityId: DEMO_CASE_ID,
    ip: "10.233.80.37",
    userAgent: "compliance-agent",
  },
];

export const KILLER_FLOW_LINK = `/clients/${DEMO_CLIENT_ID}`;
export const KILLER_FLOW_CASE_LINK = `/cases/${DEMO_CASE_ID}`;
export const KILLER_FLOW_WORKFLOW_LINK = `/workflows/${DEMO_WORKFLOW_ID}`;
