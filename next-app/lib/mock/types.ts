export type RiskLevel = "low" | "medium" | "high" | "critical";
export type CustomerType = "individual" | "legal";
export type Channel = "mobile" | "web" | "branch" | "api";
export type TransactionType = "transfer" | "incoming" | "outgoing" | "exchange" | "cash";
export type ClientStatus = "active" | "review" | "edd" | "blocked";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "new" | "in_progress" | "rejected" | "escalated" | "closed";
export type CaseStatus = "open" | "in_progress" | "in_review" | "escalated" | "resolved" | "closed";
export type CasePriority = "low" | "medium" | "high" | "critical";
export type RuleEntity = "client" | "transaction" | "group";
export type ScenarioType = "client" | "group";
export type ScenarioStatus = "active" | "paused" | "draft";
export type TransactionStatus = "completed" | "review" | "blocked";

export type UserRole =
  | "admin"
  | "compliance_lead"
  | "compliance_officer"
  | "analyst"
  | "risk_manager"
  | "designer"
  | "auditor"
  | "ai_agent";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled" | "inactive";
  lastLoginAt?: string;
  createdAt?: string;
  avatarHue?: number;
}

export interface ClientFlags {
  VIP?: boolean | "—";
  PEP?: boolean | "Нет" | "—";
  PDL?: boolean | "—";
  EDD?: boolean | "—";
  FATCA_group?: boolean | "—";
  FATCA_individual?: boolean | "—";
  OESR_group?: boolean | "—";
  OESR_individual?: boolean | "—";
  representative?: boolean | "—";
  antifraud?: boolean | "—";
  limited_account?: boolean | "—";
  Blacklist?: boolean | "—";
  iPDL?: boolean | "—";
  nPDL?: boolean | "—";
}

export interface ClientNotificationChannels {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface Client {
  id: string;
  fullName: string;
  latinName?: string;
  type: CustomerType;
  segment: string;
  riskLevel: RiskLevel;
  internalScore: number;
  iin?: string;
  bin?: string;
  birthDate?: string;
  registrationDate?: string;
  country: string;
  countryFullName?: string;
  pep: boolean;
  sanctioned: boolean;
  status: ClientStatus;
  responsibleId: string;
  lastTransactionAt?: string;
  tags: string[];
  incomeSources: string[];
  email?: string;
  phone?: string;
  // Boevaya admin extras:
  cardVersion?: string;
  kolvirCode?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  serviceDays?: number;
  birthplace?: string;
  accountBranch?: string;
  flags?: ClientFlags;
  notificationChannels?: ClientNotificationChannels;
  declaredMonthlyIncome?: number;
  newsScore?: number;
  eddScore?: number;
}

export interface Counterparty {
  name: string;
  iban?: string;
  country?: string;
  bank?: string;
}

export type BranchCode = "ALM-001" | "ALA-001" | "ALA-014" | "AST-002" | "SHY-007";

export interface Transaction {
  id: string;
  date: string;
  clientId: string;
  counterparty: Counterparty;
  amount: number;
  currency: string;
  amountKZT: number;
  type: TransactionType;
  channel: Channel;
  scenarioId?: string;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  tags: string[];
  purpose?: string;
  /** Экономический код назначения (НБ РК), напр. 119, 111, 343 */
  purposeCode: string;
  /** Полнотекстовое описание кода назначения */
  purposeDescription: string;
  /** Код товара (4-digit), напр. 2000 */
  goodsType?: string;
  /** Описание товара (свободный текст) */
  goodsDescription?: string;
  /** Доп. информация (напр. «Возврат долга по расписке от 12.01.2026») */
  additionalInfo?: string;
  /** Код филиала */
  branchCode: BranchCode;
  /** Полное название филиала */
  branchName: string;
  /** Приоритет комплаенс-обработки */
  priority: "low" | "medium" | "high";
  /** Комплаенс-статус как отдельное поле от status (status — общий лайфцикл) */
  complianceStatus: "Завершена" | "Обработана" | "Авто-отказ" | "Ожидание" | "Отклонена";
  geo?: { city: string; country: string };
}

export interface Alert {
  id: string;
  date: string;
  clientId: string;
  transactionId?: string;
  ruleId: string;
  ruleName: string;
  scenarioId?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  responsibleId: string;
}

export interface Case {
  id: string;
  type: string;
  clientId: string;
  status: CaseStatus;
  priority: CasePriority;
  responsibleId: string;
  openedAt: string;
  slaDueAt: string;
  description: string;
  linkedAlertIds: string[];
  linkedTransactionIds: string[];
  tags: string[];
  /** Кол-во комментариев в табе Активность */
  commentCount: number;
  /** Кол-во доказательств (evidence) */
  evidenceCount: number;
  /** Кол-во подзадач */
  subtaskCount: number;
  /** Метка авто-кейса (создан Compliance Officer AI) */
  autoCase?: boolean;
}

export type RuleOp = "eq" | "ne" | "gt" | "lt" | "in" | "nin" | "contains" | "between";

export interface RuleCondition {
  id: string;
  field: string;
  op: RuleOp;
  value: unknown;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  entity: RuleEntity;
  enabled: boolean;
  authorId: string;
  updatedAt: string;
  conditions: RuleCondition[];
}

export interface ComplianceScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  status: ScenarioStatus;
  lastRunAt?: string;
  triggerCount: number;
  authorId: string;
  ruleIds: string[];
  precision?: number;
  recall?: number;
  createdAt?: string;
  /** Pipeline шагов для workflow builder'а */
  pipeline?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  type: string;
  /** Кастомное название шага (опционально, дефолт — name из ACTIVITY_BY_TYPE) */
  name?: string;
  /** Конфиг — произвольные key→value */
  config: Record<string, string | boolean>;
}

export interface AgentRun {
  id: string;
  startedAt: string;
  durationMs: number;
  status: "success" | "failure" | "running";
  inputTokens: number;
  outputTokens: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  model: string;
  instructionsMd: string;
  tools: string[];
  lastRuns: AgentRun[];
}

export type AuditAction =
  | "Создание"
  | "Обновление"
  | "Удаление"
  | "Вход"
  | "Одобрение"
  | "Отправка"
  | "run"
  | "recalculate";

export type AuditResource =
  | "client"
  | "transaction"
  | "alert"
  | "case"
  | "rule"
  | "scenario"
  | "agent"
  | "settings"
  | "risk"
  | "risk-attributes"
  | "report";

export interface AuditEvent {
  id: string;
  timestamp: string;
  /** May be a regular user id (USR-X), `system`, or `compliance-officer-ai` */
  userId: string;
  action: AuditAction;
  entityType?: AuditResource;
  entityId?: string;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
}

/** Внутренние агенты, видимые в LLM-логах */
export type LLMAgentName =
  | "agent"
  | "chat_agent"
  | "compliance_agent"
  | "converter"
  | "edd_full"
  | "edd_short"
  | "monitoring_agent"
  | "search_agent";

/** Доступные модели (через Yandex Foundation Models) */
export type LLMModelName =
  | "deepseek-v32/latest"
  | "gpt-oss-120b/latest"
  | "qwen3-235b-a22b-fp8/latest"
  | "yandexgpt-5.1/latest"
  | "gemma-3-27b-it/latest";

export interface LLMUsageRequest {
  id: string;
  timestamp: string;
  userId: string;
  agentId?: string;
  /** Имя агента в логах LLM (не путать с UI-агентами в Агентах) */
  agentName: LLMAgentName;
  model: LLMModelName;
  inputTokens: number;
  outputTokens: number;
  /** Токены, потраченные на инструменты (web search, function calls) */
  toolTokens: number;
  /** Reasoning токены (для thinking-моделей) */
  reasoningTokens: number;
  /** Кэшированные токены (cache hit) */
  cacheTokens: number;
  /** Латентность запроса в миллисекундах */
  latencyMs: number;
  /** Статус выполнения */
  status: "Успешно" | "Ошибка";
  costUSD: number;
  promptPreview: string;
  responsePreview: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  category: "geo" | "product" | "client" | "behavior";
  weight: number;
}

export type MockState = "data" | "empty" | "loading" | "error";
export type ScenarioPreset = "normalDay" | "busyDay" | "emptyInbox" | "criticalAlert" | "killerFlow";
