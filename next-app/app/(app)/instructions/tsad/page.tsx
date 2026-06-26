import {
  ModelDoc,
  DocP,
  DocTable,
  DocDefs,
  DocSteps,
  DocCode,
  DocCallout,
  DocLabel,
} from "@/components/ml/model-doc";

export default function Page() {
  return (
    <ModelDoc
      eyebrow="Документация · TSAD"
      title="Time Series Anomaly Detection"
      version="v1.2"
      updated="24 апр 2026"
      tagline="Детекция аномалий во временных рядах"
      description="Анализирует исторические клиентские временные ряды (дневные объёмы и количества транзакций) и выдаёт признак аномальности. Комбинирует робастные статистические тесты и алгоритмы сегментации для проактивных оповещений комплаенс-офицеров."
      status="production"
      owner="Иван Новосельцев"
      stack={["Kedro", "PELT / ruptures", "Z-score", "Poisson", "Optuna"]}
      stats={[
        { value: "4", label: "Детектора" },
        { value: "3", label: "Канала: AMT · CNT · AVG" },
        { value: "PELT", label: "Changepoint engine" },
      ]}
      sections={[
        {
          id: "overview",
          num: "01",
          title: "Обзор",
          body: (
            <>
              <DocP>
                TSAD анализирует исторические клиентские временные ряды (дневные объёмы и количества транзакций), поступающие из Feature Store, и
                выдаёт ясный признак аномальности на клиента вместе с проанализированным диапазоном дат и пиковыми объёмами.
              </DocP>
              <DocP>
                Подход сочетает робастные статистические алгоритмы и алгоритмы сегментации для выявления поведения, существенно отклоняющегося от
                собственного базового уровня клиента или норм его пир-группы.
              </DocP>
            </>
          ),
        },
        {
          id: "io",
          num: "02",
          title: "Входы и выходы",
          body: (
            <>
              <DocLabel>Входные поля</DocLabel>
              <DocDefs
                items={[
                  { term: "id (iin)", type: "int · ключ временного ряда", desc: "Идентификатор клиента" },
                  { term: "city_id", type: "int · город клиента", desc: "Геопривязка для пир-групп" },
                  { term: "ds", type: "date · шаг временного ряда", desc: "Бизнес-дата наблюдения" },
                  { term: "amt", type: "float · общий объём транзакций", desc: "Дневной объём" },
                  { term: "cnt", type: "int · число транзакций", desc: "Дневное количество" },
                ]}
              />
              <DocLabel>Выходные поля (TSAD.DETECT_OUTPUT)</DocLabel>
              <DocTable
                head={["Поле", "Тип", "Описание"]}
                rows={[
                  [<code className="font-mono text-xs text-foreground">created_at</code>, "timestamp", "Время детекции"],
                  [<code className="font-mono text-xs text-foreground">iin</code>, "int", "Идентификатор временного ряда"],
                  [<code className="font-mono text-xs text-foreground">ds_start / ds_end</code>, "date", "Границы проанализированного периода"],
                  [<code className="font-mono text-xs text-foreground">ds</code>, "date", "Дата аномалии, если определена; иначе null"],
                  [<code className="font-mono text-xs text-foreground">amt</code>, "real", "Объём в день аномалии или максимум за период"],
                  [<code className="font-mono text-xs text-foreground">model</code>, "text", "Название модели"],
                  [<code className="font-mono text-xs text-foreground">is_anomaly</code>, "int", "−1 недостаточно данных · 0 нет аномалии · 1 аномалия"],
                ]}
              />
            </>
          ),
        },
        {
          id: "setup",
          num: "03",
          title: "Настройка",
          body: (
            <>
              <DocLabel>Переменные окружения</DocLabel>
              <DocCode>{`KEDRO_DISABLE_TELEMETRY=true
LOC_PG_CON=postgresql://postgres:{PASSWORD}@localhost:5432/postgres
DB_HOST=host.docker.internal   # при подключении из Docker`}</DocCode>
              <DocLabel>Конфигурация</DocLabel>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-xs">
                <li>IO (датасеты): <code className="font-mono text-foreground">conf/base/catalog.yml</code></li>
                <li>Параметры процесса: <code className="font-mono text-foreground">conf/base/parameters.yml</code></li>
                <li>Параметры детекторов: <code className="font-mono text-foreground">conf/base/parameters_detectors.yml</code></li>
                <li>Параметры оптимизации: <code className="font-mono text-foreground">conf/base/parameters_opt.yml</code></li>
              </ul>
              <DocLabel>Docker</DocLabel>
              <DocCode>{`# Сборка образа
docker build -t tsad:latest .

# Запуск пайплайна детекции PELT
docker run --network host -v $(pwd)/data:/data --env-file .env tsad:latest \\
  uv run kedro run --pipeline=detect_pelt --async`}</DocCode>
            </>
          ),
        },
        {
          id: "normalization",
          num: "04",
          title: "Архитектура",
          kicker: "Group Normalization",
          body: (
            <>
              <DocP>
                Центральный шаг предобработки — удаление систематических движений на уровне группы (сезонность, тренды, акции), чтобы аномалия могла
                объясняться только поведением конкретного клиента.
              </DocP>
              <DocSteps
                steps={[
                  { n: "1", title: "Биннинг", desc: "Каждому ряду присваивается amt_bin и cnt_bin (0–9) по среднему лог-объёму и лог-количеству, в разрезе города. 10 × 10 × N городов даёт до N × 100 групп." },
                  { n: "2", title: "Опорный ряд", desc: "Для каждой группы — дневное среднее amt_log и cnt_log по всем участникам. Это представительный ряд группы." },
                  { n: "✓", title: "Остаток", desc: "Из индивидуального ряда вычитается опорный, получается amt_log_res и cnt_log_res — именно их анализируют детекторы." },
                ]}
              />
              <DocCallout title="Почему логарифм?">
                Объёмы транзакций распределены логнормально, а не нормально. Логарифмирование приближает распределение к гауссовскому до применения
                статистических тестов.
              </DocCallout>
            </>
          ),
        },
        {
          id: "models",
          num: "05",
          title: "Модели",
          body: (
            <DocDefs
              items={[
                { term: "skipped", type: "SKIPPED", desc: "Помечает ряды как is_anomaly = −1 при недостатке данных (нерегулярные или слишком короткие)." },
                { term: "z_score_amt", type: "AMOUNT", desc: "Точечные аномалии в дневном объёме через z-тест: значения за последние 7 дней, превышающие среднее истории на 3+ σ." },
                { term: "poisson_cnt", type: "COUNT", desc: "Поток дневных счётчиков моделируется пуассоновским процессом по истории; флагуются дни с вероятностью ниже порога (1e-3)." },
                { term: "pelt", type: "CHANGEPOINT", desc: "Структурные точки разрыва одновременно по amt, cnt, avg через PELT (библиотека ruptures). Сигнал — структурная смена режима поведения." },
              ]}
            />
          ),
        },
        {
          id: "commands",
          num: "06",
          title: "Команды пайплайна",
          body: (
            <>
              <DocLabel>Подготовка данных</DocLabel>
              <DocCode>{`# Загрузить и дописать новые данные, отсечь старые
uv run kedro run --pipeline=get_data

# Вычислить границы бинов и групповые опорные ряды
uv run kedro run --pipeline=process_data_train

# Подготовить свежие данные к детекции
uv run kedro run --pipeline=process_data_detect`}</DocCode>
              <DocLabel>Детекция</DocLabel>
              <DocCode>{`uv run kedro run --pipeline=detect_skipped       # короткие/нерегулярные ряды → −1
uv run kedro run --pipeline=detect_z_score_amt   # z-score по amt
uv run kedro run --pipeline=detect_poisson_cnt   # Poisson по cnt
uv run kedro run --pipeline=detect_pelt          # PELT по amt, cnt, avg`}</DocCode>
              <DocLabel>Оптимизация гиперпараметров (Optuna)</DocLabel>
              <DocCode>{`uv run kedro run --pipeline=optimize_hyperparams # все детекторы
uv run kedro run --pipeline=opt_z_score_amt
uv run kedro run --pipeline=opt_poisson_cnt
uv run kedro run --pipeline=opt_pelt`}</DocCode>
            </>
          ),
        },
      ]}
    />
  );
}
