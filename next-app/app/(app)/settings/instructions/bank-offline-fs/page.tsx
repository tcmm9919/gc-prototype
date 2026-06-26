import {
  ModelDoc,
  DocP,
  DocTable,
  DocSteps,
  DocChips,
  DocCode,
  DocCallout,
  DocLabel,
} from "@/components/ml/model-doc";

export default function Page() {
  return (
    <ModelDoc
      eyebrow="Документация · Feature Store"
      title="Bank Offline Feature Store"
      version="v1.4"
      updated="29 апр 2026"
      tagline="Витрина признаков платформы"
      description="Централизованный пайплайн ежедневной подготовки признаков на PostgreSQL + TimescaleDB, оркестрируемый Apache Airflow. Превращает сырые данные DWH в две ML-готовые таблицы — фундамент всех остальных моделей."
      status="production"
      owner="Data Engineering"
      stack={["PostgreSQL", "TimescaleDB", "Airflow", "Jinja2"]}
      stats={[
        { value: "2", label: "Таблицы признаков" },
        { value: "463", label: "Колонки" },
        { value: "8", label: "Временных окон" },
      ]}
      sections={[
        {
          id: "overview",
          num: "01",
          title: "Обзор",
          body: (
            <>
              <DocP>
                Витрина преобразует сырые данные из корпоративного хранилища (схема <code className="font-mono text-xs text-foreground">fs_data</code>) в
                две структурированные ML-готовые таблицы признаков, используемых для кредитного скоринга, оценки поведенческих рисков и сегментации
                клиентов.
              </DocP>
              <DocP>
                Все вычисления партиционированы по бизнес-дате (<code className="font-mono text-xs text-foreground">ds</code>) и шаблонизированы Jinja2,
                что обеспечивает детерминированное извлечение признаков на момент времени. Airflow <code className="font-mono text-xs text-foreground">SQLExecuteQueryOperator</code> запускает
                каждый SQL-файл в порядке зависимостей с автоматической логикой повторных попыток при сбое.
              </DocP>
            </>
          ),
        },
        {
          id: "architecture",
          num: "02",
          title: "Архитектура",
          kicker: "Схемы",
          body: (
            <>
              <DocTable
                head={["Схема", "Роль"]}
                rows={[
                  [<code className="font-mono text-xs text-foreground">fs_data</code>, "Источник правды — сырые таблицы DWH"],
                  [<code className="font-mono text-xs text-foreground">dict</code>, "Справочные словари (например, курсы валют)"],
                  [<code className="font-mono text-xs text-foreground">fs_aggregates</code>, "TimescaleDB continuous aggregates для быстрых сверток"],
                  [<code className="font-mono text-xs text-foreground">tmp</code>, "Промежуточные таблицы с датой в суффиксе, удаляемые после сборки"],
                  [<code className="font-mono text-xs text-foreground">fs_features</code>, "Финальные партиционированные по дате таблицы признаков для ML-моделей"],
                ]}
              />
              <DocLabel>Поток данных</DocLabel>
              <DocCode>{`fs_data.*  ──►  tmp.fs_isd_*_YYYYMMDD  ──►  fs_features.fs_isd_YYYYMMDD
               (7 запросов признаков,        (сборка через 7-way LEFT JOIN)
                параллельно в Airflow)

fs_data.*  ──►  fs_aggregates.*  ──►  tmp.fs_txn_*_YYYYMMDD  ──►  fs_features.fs_txn_YYYYMMDD
               (3 обновления          (6 запросов признаков,       (сборка через 8-way LEFT JOIN)
                continuous aggregates) параллельно в Airflow)`}</DocCode>
            </>
          ),
        },
        {
          id: "airflow",
          num: "03",
          title: "Оркестрация Airflow",
          body: (
            <>
              <DocLabel>DAG: FS_ISD · ежедневно 06:30 UTC</DocLabel>
              <DocTable
                head={["Параметр", "Значение"]}
                rows={[
                  ["Расписание", <code className="font-mono text-xs text-foreground">30 6 * * *</code>],
                  ["Дата старта", "2025-02-28"],
                  ["Catchup", "Включён"],
                  ["Max active runs", "8 (поддержка параллельного исторического бэкфилла)"],
                  ["Retries", "3, с задержкой 15 минут"],
                  ["Tags", "feature_store, socdem"],
                ]}
              />
              <DocP>
                <span className="font-medium text-foreground">DAG: FS_TXN · ежедневно 06:00 UTC.</span> Запускается на 30 минут раньше, чем fs_isd.
                Max active runs = 1 — последовательно, чтобы защитить обновление TimescaleDB от конкурентных записей.
              </DocP>
              <DocCallout title="Подключение">
                Все задачи подключаются к продакшен-БД через Airflow connection <code className="font-mono">fs_prod_conn</code>. SQL-шаблоны
                разрешаются движком Jinja2 — подставляются <code className="font-mono">{`{{ ds }}`}</code> и <code className="font-mono">{`{{ next_ds_nodash }}`}</code>.
              </DocCallout>
            </>
          ),
        },
        {
          id: "fs-isd",
          num: "04",
          title: "Набор 1 — fs_features.fs_isd",
          body: (
            <>
              <DocP>
                Гранулярность: одна строка на <code className="font-mono text-xs text-foreground">client_id</code> на{" "}
                <code className="font-mono text-xs text-foreground">ds</code> (ежедневно). Описывает демографическое, географическое и продуктовое
                состояние индивидуальных клиентов банка на момент времени. Всего колонок: <span className="font-medium text-foreground">30</span>.
              </DocP>
              <DocLabel>Пайплайн — 7 промежуточных временных таблиц</DocLabel>
              <DocSteps
                steps={[
                  { n: "1", title: "fs_isd_ref_client_priv", desc: "Базовая запись клиента: возраст, пол, резидентство, VIP-флаг, стаж в днях" },
                  { n: "2", title: "fs_isd_ref_address", desc: "Последние ID города и региона (география Казахстана: 25 городов / 20 регионов)" },
                  { n: "3", title: "fs_isd_ref_account", desc: "Количество закрытых счетов на клиента" },
                  { n: "4", title: "fs_isd_dm_cards", desc: "Счётчики заблокированных, закрытых, премиум-карт; число брокерских счетов" },
                  { n: "5", title: "fs_isd_dm_credit", desc: "Активные/закрытые ипотеки и займы; общее число дней просрочки" },
                  { n: "6", title: "fs_isd_ref_client_corp", desc: "Список частных клиентов с корпоративными связями (ИП)" },
                  { n: "✓", title: "fs_isd_assemble", desc: "7-way LEFT JOIN по client_id и запись в fs_features.fs_isd_YYYYMMDD" },
                ]}
              />
              <DocLabel>Фильтры качества данных</DocLabel>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-xs">
                <li>ИИН только числовой, не нулевой и не из одинаковых цифр</li>
                <li>Состояние клиента = «Открыта», роль содержит «Клиент-Действующий»</li>
                <li>SCD Type 2 активный диапазон: clprv$start_date ≤ ds &lt; clprv$end_date</li>
                <li>Окно надёжных данных: clprv$end_date &gt; 2024-05-09</li>
                <li>Кредит: client_type = &apos;Individual&apos;, report_date = ds, loan_start_date ≤ ds</li>
              </ul>
            </>
          ),
        },
        {
          id: "fs-txn",
          num: "05",
          title: "Набор 2 — fs_features.fs_txn",
          body: (
            <>
              <DocP>
                Гранулярность: одна строка на <code className="font-mono text-xs text-foreground">acc_id</code> на{" "}
                <code className="font-mono text-xs text-foreground">ds</code>. Характеризует поведение по транзакциям на уровне счёта по нескольким
                временным горизонтам. Всего колонок: <span className="font-medium text-foreground">433</span>.
              </DocP>
              <DocLabel>Временные окна</DocLabel>
              <DocChips items={["1d", "3d", "7d", "14d", "30d", "90d", "180d", "365d"]} />
              <DocP>Окна для уникальных счётчиков: 1d, 7d, 30d.</DocP>
              <DocLabel>Классификация типов транзакций</DocLabel>
              <DocTable
                head={["Код", "Название", "Логика"]}
                rows={[
                  [<code className="font-mono text-xs text-foreground">ff</code>, "Freedom Transfer", "Внутри банка (Freedom Bank BIC), KNP=119, разные ИИН клиентов"],
                  [<code className="font-mono text-xs text-foreground">acc</code>, "Внутренние / Реквизиты", "Иностранный KZ-банк (другой BIC), не QR/мобильный перевод"],
                  [<code className="font-mono text-xs text-foreground">p2p</code>, "P2P", "Код операции 08403 (исх) / 602204 (вх)"],
                  [<code className="font-mono text-xs text-foreground">smp</code>, "SMP Mobile", "QR-код или мобильный перевод"],
                  [<code className="font-mono text-xs text-foreground">myself</code>, "Перевод себе", "Тот же ИИН клиента, любой код счёта"],
                  [<code className="font-mono text-xs text-foreground">atm</code>, "ATM", "Коды операции 08213, 08519 / 602205"],
                  [<code className="font-mono text-xs text-foreground">kassa</code>, "Касса", "08214, 08210 / 01031–01036, CO1004, CO1006"],
                  [<code className="font-mono text-xs text-foreground">int</code>, "Международный", "0201141, 0201142 / международные коды"],
                ]}
              />
              <DocLabel>Структура колонок результата</DocLabel>
              <DocTable
                head={["Группа", "Кол-во", "Шаблон"]}
                rows={[
                  ["Метки времени и ключи", "5", "—"],
                  ["Входящие документарные платежи", "128", <code className="font-mono text-xs text-foreground">txn_in_{`{type}`}_{`{amt|cnt}`}_{`{window}`}</code>],
                  ["Исходящие документарные платежи", "128", <code className="font-mono text-xs text-foreground">txn_out_{`{type}`}_{`{amt|cnt}`}_{`{window}`}</code>],
                  ["Уникальные входящие банки", "3", <code className="font-mono text-xs text-foreground">txn_in_cnt_uniq_bank_accs_{`{window}`}</code>],
                  ["Уникальные исходящие банки", "3", <code className="font-mono text-xs text-foreground">txn_out_cnt_uniq_bank_accs_{`{window}`}</code>],
                  ["Уникальные ATM (вх / исх)", "6", <code className="font-mono text-xs text-foreground">txn_{`{in|out}`}_cnt_uniq_atm_{`{window}`}</code>],
                  ["Карточные расходы по MCC", "144", <code className="font-mono text-xs text-foreground">txn_out_{`{mcc}`}_{`{amt|cnt}`}_{`{window}`}</code>],
                  [<span className="font-medium text-foreground">Итого</span>, <span className="font-medium text-foreground">433</span>, "—"],
                ]}
              />
            </>
          ),
        },
      ]}
    />
  );
}
