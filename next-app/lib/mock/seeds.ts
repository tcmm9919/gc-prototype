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
export const seedClients: Client[] = [...storyClients, ...many(makeClient, 80)];
export const seedTransactions: Transaction[] = [...storyTransactions, ...many(makeTransaction, 300)];
export const seedAlerts: Alert[] = [...storyAlerts, ...many(makeAlert, 60)];
export const seedCases: Case[] = [...storyCases, ...many(makeCase, 35)];
export const seedRules: Rule[] = many(makeRule, 12);
export const seedScenarios: ComplianceScenario[] = many(makeScenario, 18);
export const seedAgents: Agent[] = [
  makeAgent({ id: "AG-1", name: "Агент по верификации источников дохода" }),
  makeAgent({ id: "AG-2", name: "Агент по проверке контрагентов" }),
  makeAgent({ id: "AG-3", name: "Агент по анализу транзакционных паттернов" }),
];
export const seedAudit: AuditEvent[] = many(makeAuditEvent, 200);
export const seedLLMUsage: LLMUsageRequest[] = many(makeLLMUsage, 162);
export const seedRiskFactors: RiskFactor[] = many(makeRiskFactor, 14);

export const currentUser: User = seedUsers[2];
