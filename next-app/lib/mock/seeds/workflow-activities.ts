/**
 * Каталог типов активностей для workflow-pipeline builder'а.
 * Боевая админка имеет 15 типов.
 */

export type WorkflowActivityType =
  | "sanction_check"
  | "behavior_scoring"
  | "ocr_document"
  | "block_client"
  | "send_email"
  | "generate_report"
  | "news_search"
  | "edd_investigation"
  | "run_agent"
  | "generate_str_report"
  | "calculate_risk"
  | "update_kyc_status"
  | "create_case"
  | "create_alert"
  | "extract_income";

export interface WorkflowActivityMeta {
  type: WorkflowActivityType;
  name: string;
  description: string;
  /** Конфигурационные поля для шага */
  configFields: ActivityConfigField[];
}

export type ActivityConfigField =
  | { key: string; label: string; type: "text"; placeholder?: string; default?: string }
  | { key: string; label: string; type: "select"; options: ReadonlyArray<{ value: string; label: string }>; default?: string }
  | { key: string; label: string; type: "boolean"; default?: boolean };

export const WORKFLOW_ACTIVITIES: WorkflowActivityMeta[] = [
  {
    type: "sanction_check",
    name: "Санкционная проверка",
    description: "Проверяет клиентов по санкционным спискам OFAC, EU, UN, PEP и базам нежелательных СМИ",
    configFields: [
      {
        key: "lists",
        label: "Списки",
        type: "select",
        options: [
          { value: "all", label: "Все (OFAC + EU + UN + PEP)" },
          { value: "ofac", label: "Только OFAC" },
          { value: "eu", label: "Только EU" },
        ],
        default: "all",
      },
    ],
  },
  {
    type: "behavior_scoring",
    name: "Поведенческий скоринг",
    description: "Пересчитывает поведенческий профиль клиента на основе истории операций",
    configFields: [{ key: "window_days", label: "Окно (дней)", type: "text", default: "90" }],
  },
  {
    type: "ocr_document",
    name: "OCR документа",
    description: "Извлекает структурированные данные из PDF/изображений (income proof, паспорт и т.п.)",
    configFields: [
      {
        key: "doc_tag",
        label: "Тег документа",
        type: "select",
        options: [
          { value: "income_proof", label: "Подтверждение дохода" },
          { value: "passport", label: "Паспорт" },
          { value: "employment_letter", label: "Справка с работы" },
        ],
      },
    ],
  },
  {
    type: "block_client",
    name: "Заблокировать клиента",
    description: "Устанавливает флаг is_blocked у пользователя, запрещая дальнейшую активность",
    configFields: [{ key: "reason", label: "Причина", type: "text", placeholder: "Подозрение в отмывании" }],
  },
  {
    type: "send_email",
    name: "Отправить email",
    description: "Отправляет письмо клиенту или менеджеру с шаблоном",
    configFields: [
      {
        key: "to",
        label: "Получатель",
        type: "select",
        options: [
          { value: "client", label: "Клиент" },
          { value: "manager", label: "Менеджер" },
        ],
      },
      { key: "subject", label: "Тема", type: "text" },
      { key: "template", label: "Шаблон", type: "text" },
    ],
  },
  {
    type: "generate_report",
    name: "Сформировать отчёт",
    description: "Генерирует PDF-отчёт по клиенту/кейсу с типизированным шаблоном",
    configFields: [
      {
        key: "template",
        label: "Шаблон",
        type: "select",
        options: [
          { value: "compliance_brief", label: "Краткий комплаенс-отчёт" },
          { value: "full_due_diligence", label: "Полный DD-отчёт" },
        ],
      },
    ],
  },
  {
    type: "news_search",
    name: "Поиск в новостных источниках",
    description: "Запускает monitoring_agent для adverse media по клиенту",
    configFields: [
      { key: "max_results", label: "Макс. результатов", type: "text", default: "10" },
    ],
  },
  {
    type: "edd_investigation",
    name: "EDD-расследование",
    description: "Полный 10-секционный EDD-отчёт через edd_full агента",
    configFields: [],
  },
  {
    type: "run_agent",
    name: "Запуск агента",
    description: "Запускает AI-агента с пользовательской инструкцией на данных из предыдущих шагов",
    configFields: [
      {
        key: "agent_id",
        label: "Агент",
        type: "select",
        options: [
          { value: "income_verification", label: "Агент по верификации источников дохода" },
          { value: "brief_report", label: "Агент кратких отчётов" },
          { value: "risk_description", label: "Агент по описанию рисков" },
        ],
      },
      { key: "extra_prompt", label: "Доп. инструкция", type: "text" },
    ],
  },
  {
    type: "generate_str_report",
    name: "Сформировать STR-отчёт",
    description: "Формирует Suspicious Transaction Report для регулятора",
    configFields: [],
  },
  {
    type: "calculate_risk",
    name: "Расчёт риска",
    description: "Пересчитывает взвешенный балл риска для пользователей с учётом PEP, географии, KYC, транзакций и негативных СМИ",
    configFields: [],
  },
  {
    type: "update_kyc_status",
    name: "Обновить статус KYC",
    description: "Обновляет статус KYC клиента",
    configFields: [
      {
        key: "status",
        label: "Статус",
        type: "select",
        options: [
          { value: "PENDING", label: "PENDING" },
          { value: "IN_REVIEW", label: "IN_REVIEW" },
          { value: "APPROVED", label: "APPROVED" },
          { value: "ESCALATED", label: "ESCALATED" },
          { value: "REJECTED", label: "REJECTED" },
        ],
      },
    ],
  },
  {
    type: "create_case",
    name: "Создать кейс",
    description: "Создаёт кейс с заданным типом и привязкой к алерту/клиенту",
    configFields: [
      { key: "case_type", label: "Тип кейса", type: "text", placeholder: "Авто-кейс: ..." },
    ],
  },
  {
    type: "create_alert",
    name: "Создать оповещение",
    description: "Создаёт оповещение комплаенс для клиента (напр. при срабатывании правила или попадании в санкционный список)",
    configFields: [
      {
        key: "severity",
        label: "Важность",
        type: "select",
        options: [
          { value: "low", label: "Низкая" },
          { value: "medium", label: "Средняя" },
          { value: "high", label: "Высокая" },
          { value: "critical", label: "Критическая" },
        ],
      },
    ],
  },
  {
    type: "extract_income",
    name: "Извлечь задекларированный доход",
    description: "Парсит документы клиента и записывает declared_monthly_income",
    configFields: [],
  },
];

export const ACTIVITY_BY_TYPE: Record<WorkflowActivityType, WorkflowActivityMeta> = Object.fromEntries(
  WORKFLOW_ACTIVITIES.map((a) => [a.type, a]),
) as Record<WorkflowActivityType, WorkflowActivityMeta>;
