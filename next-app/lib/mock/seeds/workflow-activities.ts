/**
 * Каталог типов активностей для workflow-pipeline builder'а.
 * Боевая админка имеет 15 типов. Конфигурации полей перенесены 1:1 с их сайта
 * (label / тип контрола / опции / дефолт / подсказка под полем).
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
  | "extract_income"
  // Групповые
  | "fetch_users"
  | "evaluate_rules"
  // Встроенные
  | "await_input"
  | "biometric_check"
  | "register_user"
  | "load_case_data"
  | "save_attachment"
  | "http_callback";

export interface WorkflowActivityMeta {
  type: WorkflowActivityType;
  name: string;
  description: string;
  /** Конфигурационные поля для шага */
  configFields: ActivityConfigField[];
}

/** Подсказка под полем (`hint`) — мелкий пояснительный текст, как на их сайте. */
export type ActivityConfigField =
  | { key: string; label: string; type: "text"; placeholder?: string; default?: string; hint?: string }
  | {
      key: string;
      label: string;
      type: "select";
      options: ReadonlyArray<{ value: string; label: string }>;
      default?: string;
      hint?: string;
    }
  | { key: string; label: string; type: "boolean"; default?: boolean; hint?: string };

// Поле «ID пользователей / клиента» — повторяется в большинстве активностей.
const AUTOFILL_PLACEHOLDER = "Оставьте пустым — подставится ID клиента при запуске";
const DATA_REF_HINT = "Ссылка на данные из предыдущего шага, напр. {{step_1.output}}";

export const WORKFLOW_ACTIVITIES: WorkflowActivityMeta[] = [
  {
    type: "sanction_check",
    name: "Санкционная проверка",
    description: "Проверяет клиентов по санкционным спискам OFAC, EU, UN, PEP и базам нежелательных СМИ",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Используйте {{step_id.output}} для передачи ID из предыдущего шага (напр. fetch_users)",
      },
    ],
  },
  {
    type: "behavior_scoring",
    name: "Поведенческий скоринг",
    description: "Рассчитывает поведенческий балл риска (0–100) для каждого пользователя",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Используйте {{step_id.output}} для передачи ID из предыдущего шага (напр. fetch_users)",
      },
    ],
  },
  {
    type: "ocr_document",
    name: "OCR документа",
    description: "Извлекает текст и структурированные данные из загруженного документа по типу и пользователю",
    configFields: [
      {
        key: "doc_type",
        label: "Тип документа",
        type: "select",
        default: "passport",
        hint: "Тип документа для поиска и обработки",
        options: [
          { value: "passport", label: "passport" },
          { value: "id_card", label: "id_card" },
          { value: "driver_license", label: "driver_license" },
          { value: "proof_of_address", label: "proof_of_address" },
          { value: "income_proof", label: "income_proof" },
          { value: "bank_statement", label: "bank_statement" },
          { value: "tax_return", label: "tax_return" },
          { value: "employment_letter", label: "employment_letter" },
          { value: "utility_bill", label: "utility_bill" },
          { value: "contract", label: "contract" },
          { value: "other", label: "other" },
        ],
      },
      {
        key: "user_id",
        label: "ID пользователя",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Пользователь, чей документ обрабатывать — заполняется автоматически для клиентских воркфлоу",
      },
      {
        key: "save_data",
        label: "Сохранить данные",
        type: "text",
        hint: "Сохранить извлечённые поля обратно в запись документа",
      },
    ],
  },
  {
    type: "block_client",
    name: "Заблокировать клиента",
    description: "Устанавливает флаг is_blocked у пользователя, запрещая дальнейшую активность",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Используйте {{step_id.output}} для передачи ID из предыдущего шага (напр. fetch_users)",
      },
    ],
  },
  {
    type: "send_email",
    name: "Отправить email",
    description: "Отправляет email-уведомление с опциональным вложением данных",
    configFields: [
      { key: "to_email", label: "Email получателя", type: "text", hint: "Адрес электронной почты получателя" },
      { key: "subject", label: "Тема", type: "text", hint: "Тема письма" },
      { key: "body", label: "Текст письма", type: "text", hint: "Текст письма" },
      { key: "data_ref", label: "Ссылка на данные", type: "text", hint: DATA_REF_HINT },
    ],
  },
  {
    type: "generate_report",
    name: "Сформировать отчёт",
    description: "Формирует HTML-отчёт и возвращает ссылку для скачивания. Может быть прикреплён к письму.",
    configFields: [
      { key: "report_subject", label: "Тема отчёта", type: "text", hint: "Заголовок / тема сформированного отчёта" },
      { key: "report_body", label: "Текст отчёта", type: "text", hint: "Основной текст отчёта" },
      { key: "data_ref", label: "Ссылка на данные", type: "text", hint: DATA_REF_HINT },
    ],
  },
  {
    type: "news_search",
    name: "Поиск в новостных источниках",
    description: "Ищет негативные публикации о пользователях в сети и сохраняет отчёты мониторинга с оценкой риска",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Используйте {{step_id.output}} для передачи ID из предыдущего шага (напр. fetch_users)",
      },
    ],
  },
  {
    type: "edd_investigation",
    name: "EDD-расследование",
    description: "Проводит полное EDD-расследование (углублённая проверка) и формирует детальный HTML-отчёт",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "ID пользователей для расследования — для клиентского типа используйте client_id",
      },
    ],
  },
  {
    type: "run_agent",
    name: "Запуск агента",
    description:
      "Запускает AI-агента с пользовательской инструкцией на данных из предыдущих шагов (результаты OCR, отчёты и т.д.)",
    configFields: [
      {
        key: "agent_id",
        label: "Агент",
        type: "select",
        default: "any",
        hint: "Выберите агента для запуска",
        options: [
          { value: "any", label: "— выберите агента —" },
          { value: "compliance_officer", label: "Compliance Officer" },
          { value: "source_of_funds", label: "Source-of-funds verification agent" },
          { value: "compliance_summary", label: "Compliance-summary agent" },
          { value: "risk_description", label: "Risk-description agent" },
        ],
      },
      { key: "data_ref", label: "Ссылка на данные", type: "text", hint: DATA_REF_HINT },
    ],
  },
  {
    type: "generate_str_report",
    name: "Сформировать STR-отчёт",
    description: "Формирует отчёт о подозрительных операциях (STR/SAR) для клиента и сохраняет в базу данных",
    configFields: [
      {
        key: "client_id",
        label: "ID клиента",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "ID клиента (используйте client_id для клиентского типа)",
      },
      {
        key: "template",
        label: "Шаблон отчёта",
        type: "select",
        default: "str_kz_afrd",
        hint: "Тип STR/SAR отчёта",
        options: [
          { value: "str_kz_afrd", label: "str_kz_afrd" },
          { value: "str_eu_eba", label: "str_eu_eba" },
          { value: "sar_us_fincen", label: "sar_us_fincen" },
        ],
      },
      { key: "report_name", label: "Название отчёта", type: "text", hint: "Заголовок (формируется автоматически, если пусто)" },
      { key: "notes", label: "Примечания", type: "text", hint: "Дополнительные примечания к отчёту" },
      {
        key: "data_ref",
        label: "Ссылка на данные",
        type: "text",
        hint: "Ссылка на результаты предыдущего шага (напр. результаты проверки)",
      },
    ],
  },
  {
    type: "calculate_risk",
    name: "Расчёт риска",
    description:
      "Пересчитывает взвешенный балл риска для пользователей с учётом PEP, географии, KYC, транзакций и негативных СМИ",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Используйте {{step_id.output}} для передачи ID из предыдущего шага или укажите один ID",
      },
    ],
  },
  {
    type: "update_kyc_status",
    name: "Обновить статус KYC",
    description: "Обновляет статус KYC клиента (PENDING, IN_REVIEW, APPROVED, ESCALATED, REJECTED)",
    configFields: [
      {
        key: "client_id",
        label: "ID клиента",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "ID клиента (используйте client_id из метаданных)",
      },
      {
        key: "status",
        label: "Новый статус KYC",
        type: "select",
        default: "PENDING",
        hint: "Целевой статус KYC",
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
    description: "Создаёт кейс расследования для клиента (напр. после эскалации оповещения или ручного запуска)",
    configFields: [
      {
        key: "client_id",
        label: "ID клиента",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "ID клиента (используйте client_id из метаданных)",
      },
      { key: "case_name", label: "Название кейса", type: "text", hint: "Название расследования" },
      {
        key: "priority",
        label: "Приоритет",
        type: "select",
        default: "critical",
        hint: "Уровень приоритета кейса",
        options: [
          { value: "critical", label: "critical" },
          { value: "high", label: "high" },
          { value: "medium", label: "medium" },
          { value: "low", label: "low" },
        ],
      },
      { key: "description", label: "Описание", type: "text", hint: "Описание кейса или заметки расследования" },
      { key: "data_ref", label: "Ссылка на данные", type: "text", hint: "Ссылка на результаты предыдущего шага" },
    ],
  },
  {
    type: "create_alert",
    name: "Создать оповещение",
    description:
      "Создаёт оповещение комплаенс для клиента (напр. при срабатывании правила или попадании в санкционный список)",
    configFields: [
      {
        key: "client_id",
        label: "ID клиента",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint:
          "ID клиента. Для типа «клиентский» используйте client_id; для типа «групповой» — {{step_id.output}} из предыдущего шага",
      },
      {
        key: "alert_type",
        label: "Тип оповещения",
        type: "select",
        default: "rule_match",
        hint: "Тип оповещения",
        options: [
          { value: "rule_match", label: "rule_match" },
          { value: "screening_hit", label: "screening_hit" },
          { value: "suspicious_activity", label: "suspicious_activity" },
          { value: "manual", label: "manual" },
        ],
      },
      {
        key: "severity",
        label: "Важность",
        type: "select",
        default: "critical",
        hint: "Уровень важности оповещения",
        options: [
          { value: "critical", label: "critical" },
          { value: "high", label: "high" },
          { value: "medium", label: "medium" },
          { value: "low", label: "low" },
        ],
      },
      { key: "description", label: "Описание", type: "text", hint: "Описание оповещения или причина" },
      {
        key: "data_ref",
        label: "Ссылка на данные",
        type: "text",
        hint: "Ссылка на результаты предыдущего шага (напр. результаты проверки)",
      },
    ],
  },
  {
    type: "extract_income",
    name: "Извлечь задекларированный доход",
    description:
      "Использует LLM для извлечения ежемесячного дохода из текста OCR и записывает значение в declared_monthly_income клиента.",
    configFields: [
      {
        key: "ocr_text",
        label: "Текст OCR",
        type: "text",
        hint: "Используйте {{step_id.output.extracted_fields.text}} из предыдущего шага ocr_document",
      },
      {
        key: "client_id",
        label: "ID клиента",
        type: "text",
        placeholder: AUTOFILL_PLACEHOLDER,
        hint: "Клиент, чей declared_monthly_income обновить",
      },
      { key: "document_id", label: "ID документа", type: "text", hint: "Исходный документ (для аудита). Необязательно." },
      {
        key: "case_id",
        label: "ID кейса",
        type: "text",
        hint: "Необязательно. Если указан, записывает сумму в хронологию кейса.",
      },
    ],
  },

  // ───────────────────────────── Групповые активности ─────────────────────────────
  {
    type: "fetch_users",
    name: "Получить пользователей",
    description: "Запрашивает базу данных и возвращает список ID пользователей по заданным фильтрам",
    configFields: [
      {
        key: "kyc_status",
        label: "Фильтр статуса KYC",
        type: "select",
        default: "any",
        hint: "Только пользователи с этим статусом KYC (оставьте пустым для всех)",
        options: [
          { value: "any", label: "— не выбрано —" },
          { value: "PENDING", label: "PENDING" },
          { value: "APPROVED", label: "APPROVED" },
          { value: "REJECTED", label: "REJECTED" },
        ],
      },
      { key: "min_risk", label: "Мин. балл риска", type: "text", hint: "Минимальный балл риска (включительно)" },
      { key: "max_risk", label: "Макс. балл риска", type: "text", hint: "Максимальный балл риска (включительно)" },
      { key: "created_after", label: "Создан после", type: "text", hint: "Только пользователи, созданные с этой даты (ГГГГ-ММ-ДД)" },
      { key: "created_before", label: "Создан до", type: "text", hint: "Только пользователи, созданные до этой даты (ГГГГ-ММ-ДД)" },
      {
        key: "customer_type",
        label: "Тип клиента",
        type: "select",
        default: "any",
        hint: "Фильтр по типу клиента (оставьте пустым для всех)",
        options: [
          { value: "any", label: "— не выбрано —" },
          { value: "individual", label: "individual" },
          { value: "corporate", label: "corporate" },
        ],
      },
      {
        key: "segment",
        label: "Сегмент",
        type: "select",
        default: "any",
        hint: "Фильтр по сегменту клиента (оставьте пустым для всех)",
        options: [
          { value: "any", label: "— не выбрано —" },
          { value: "retail", label: "retail" },
          { value: "sme", label: "sme" },
          { value: "hnwi", label: "hnwi" },
          { value: "corporate", label: "corporate" },
        ],
      },
      {
        key: "pep_only",
        label: "Только PEP",
        type: "select",
        default: "any",
        hint: "Фильтр по статусу PEP (оставьте пустым для всех)",
        options: [
          { value: "any", label: "— не выбрано —" },
          { value: "true", label: "true" },
          { value: "false", label: "false" },
        ],
      },
    ],
  },
  {
    type: "evaluate_rules",
    name: "Оценить правила",
    description:
      "Оценивает все активные правила комплаенса для набора пользователей и возвращает сработавшие правила по каждому",
    configFields: [
      {
        key: "user_ids",
        label: "ID пользователей / Ссылка",
        type: "text",
        hint: "Используйте {{step_id.output}} для передачи ID из предыдущего шага (напр. fetch_users)",
      },
    ],
  },

  // ──────────────────────────── Встроенные активности ────────────────────────────
  {
    type: "await_input",
    name: "Ожидание ввода",
    description: "Приостанавливает воркфлоу и ожидает отправки данных от пользователя (документ, биометрия и т.д.)",
    configFields: [
      {
        key: "input_type",
        label: "Тип ввода",
        type: "select",
        default: "document_upload",
        hint: "Тип данных для сбора (info — информационная страница; case_info — предзагружает данные кейса, клиента и транзакции)",
        options: [
          { value: "document_upload", label: "document_upload" },
          { value: "biometry", label: "biometry" },
          { value: "register_user", label: "register_user" },
          { value: "info", label: "info" },
          { value: "case_info", label: "case_info" },
        ],
      },
      { key: "prompt_text", label: "Текст подсказки", type: "text", hint: "Инструкция, отображаемая пользователю" },
      {
        key: "user_id",
        label: "ID пользователя",
        type: "text",
        hint: "Прикрепить загрузки к этому пользователю — напр. {{step_2.output.user_id}} из шага register_user",
      },
      { key: "timeout_hours", label: "Таймаут (часы)", type: "text", hint: "Максимальное время ожидания до истечения шага" },
    ],
  },
  {
    type: "biometric_check",
    name: "Биометрическая проверка",
    description: "Сравнивает фото селфи с фото в документе для верификации личности",
    configFields: [
      { key: "photo_ref", label: "Ссылка на фото", type: "text", hint: "Ссылка на фото селфи (обычно из предыдущего шага)" },
      {
        key: "match_threshold",
        label: "Порог совпадения",
        type: "text",
        hint: "Минимальный балл уверенности (1–100) для подтверждения совпадения",
      },
    ],
  },
  {
    type: "register_user",
    name: "Регистрация пользователя",
    description:
      "Создаёт новую запись пользователя на основе данных регистрационной формы, собранных на предыдущем шаге wait_for_input",
    configFields: [
      { key: "name", label: "Имя", type: "text", hint: "Используйте {{step_id.output.name}} из шага ввода register_user" },
      { key: "email", label: "Email", type: "text", hint: "Используйте {{step_id.output.email}} из шага ввода register_user" },
    ],
  },
  {
    type: "load_case_data",
    name: "Загрузить данные кейса",
    description:
      "Загружает данные кейса, клиента и инициирующей транзакции. Используйте как первый шаг встроенного воркфлоу обработки инцидента.",
    configFields: [
      { key: "case_id", label: "ID кейса", type: "text", hint: "Передаётся из input_params.case_id при запуске со страницы кейса" },
    ],
  },
  {
    type: "save_attachment",
    name: "Сохранить вложение",
    description: "Прикрепляет загруженный документ к кейсу в качестве доказательства и добавляет системный комментарий в хронологию.",
    configFields: [
      {
        key: "document_id",
        label: "ID документа",
        type: "text",
        hint: "Используйте {{step_id.output.doc_id}} из предыдущего шага wait_for_input(document_upload)",
      },
      { key: "case_id", label: "ID кейса", type: "text", hint: "Кейс, к которому прикрепляется доказательство" },
      { key: "label", label: "Метка", type: "text", hint: "Краткая метка (напр. «Подтверждение дохода»)" },
    ],
  },
  {
    type: "http_callback",
    name: "HTTP-колбэк",
    description: "Отправляет результаты воркфлоу на внешний URL через POST-запрос",
    configFields: [
      { key: "callback_url", label: "URL колбэка", type: "text", hint: "Внешний эндпоинт для получения результатов воркфлоу" },
    ],
  },
];

/**
 * Набор доступных активностей зависит от типа сценария (как на их сайте):
 * Клиентский — полный набор; Групповой — групповые операции; Встроенный — шаги
 * внутри другого процесса (ожидание ввода, биометрия, колбэки). Порядок важен.
 */
export const ACTIVITIES_BY_SCENARIO: Record<"client" | "group" | "embedded", WorkflowActivityType[]> = {
  client: [
    "sanction_check",
    "behavior_scoring",
    "ocr_document",
    "block_client",
    "send_email",
    "generate_report",
    "news_search",
    "edd_investigation",
    "run_agent",
    "generate_str_report",
    "calculate_risk",
    "update_kyc_status",
    "create_case",
    "create_alert",
    "extract_income",
  ],
  group: [
    "sanction_check",
    "behavior_scoring",
    "block_client",
    "fetch_users",
    "send_email",
    "generate_report",
    "news_search",
    "evaluate_rules",
    "generate_str_report",
    "calculate_risk",
    "create_alert",
  ],
  embedded: [
    "await_input",
    "sanction_check",
    "ocr_document",
    "biometric_check",
    "register_user",
    "send_email",
    "load_case_data",
    "save_attachment",
    "extract_income",
    "http_callback",
  ],
};

export const ACTIVITY_BY_TYPE: Record<WorkflowActivityType, WorkflowActivityMeta> = Object.fromEntries(
  WORKFLOW_ACTIVITIES.map((a) => [a.type, a]),
) as Record<WorkflowActivityType, WorkflowActivityMeta>;
