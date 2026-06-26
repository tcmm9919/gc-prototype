import {
  ModelDoc,
  DocP,
  DocTable,
  DocDefs,
  DocPipeline,
  DocCode,
  DocCallout,
  DocLabel,
} from "@/components/ml/model-doc";

export default function Page() {
  return (
    <ModelDoc
      eyebrow="Документация · CTSM"
      title="Compliance Tabular Supervised Model"
      version="v2.0"
      updated="27 апр 2026"
      tagline="Скоринг фрода по подтверждённым кейсам · Pied Piper"
      description="Продакшен ML-система для выявления и предсказания сложных мошеннических активностей. CatBoost-ансамбль обучается исключительно на исторически подтверждённых кейсах от комплаенс-офицеров и ежедневно скорит активную популяцию клиентов. Внутреннее имя — Pied Piper."
      status="production"
      owner="Data Science"
      stack={["CatBoost", "imbalanced-learn", "Kedro 1.2", "Optuna", "Python 3.13"]}
      stats={[
        { value: "270+", label: "Признаков" },
        { value: "Daily", label: "Predict-пайплайн" },
        { value: "Optuna", label: "Bayesian search" },
      ]}
      sections={[
        {
          id: "overview",
          num: "01",
          title: "Обзор",
          body: (
            <>
              <DocP>
                CTSM анализирует высокоразмерные профили клиентов — комбинируя социально-демографические атрибуты с богатой мультигоризонтной
                поведенческой активностью — и присваивает каждому клиенту дневной балл вероятности мошеннической активности.
              </DocP>
              <DocP>
                Модель обучается исключительно на исторически подтверждённых случаях мошенничества, рассмотренных комплаенс-офицерами. Это гарантирует,
                что выученные паттерны отражают реальное мошенничество, а не статистические аномалии или ложные срабатывания.
              </DocP>
            </>
          ),
        },
        {
          id: "architecture",
          num: "02",
          title: "Архитектура",
          body: (
            <>
              <DocP>Система построена на MLOps-фреймворке Kedro и разделена на четыре независимых пайплайна.</DocP>
              <DocDefs
                items={[
                  { term: "data", type: "DATA", desc: "Принимает сырые размеченные данные из БД, применяет временное train/test разбиение." },
                  { term: "opt", type: "OPT", desc: "Байесовская оптимизация гиперпараметров через Optuna." },
                  { term: "train", type: "TRAIN", desc: "Полное обучение модели и оценка на отложенной тестовой выборке." },
                  { term: "predict", type: "DAILY", desc: "Ежедневный скоринг активных клиентов; на выходе — балл риска по каждому клиенту." },
                ]}
              />
              <DocLabel>Pied Piper · ML-пайплайн</DocLabel>
              <DocPipeline
                stages={["RandomUnderSampler", "DatetimeFeatures", "DropConstantFeatures", "SimpleImputer", "CatBoostClassifier"]}
              />
            </>
          ),
        },
        {
          id: "features",
          num: "03",
          title: "Признаки",
          body: (
            <>
              <DocLabel>Социально-демографические</DocLabel>
              <DocDefs
                items={[
                  { term: "age", desc: "Возраст клиента" },
                  { term: "gender_id", desc: "Пол" },
                  { term: "is_residency", desc: "Резидентство" },
                  { term: "is_vip", desc: "VIP-флаг" },
                  { term: "city_id / region_id", desc: "Геолокация" },
                  { term: "is_ip", desc: "Индивидуальный предприниматель" },
                  { term: "cnt_closed_accs", desc: "Закрытые счета" },
                  { term: "cnt_blocked_cards", desc: "Заблокированные карты" },
                  { term: "cnt_premium_cards", desc: "Премиум-карты" },
                  { term: "cnt_actual_loans", desc: "Активные займы" },
                  { term: "cnt_overdue_days", desc: "Дни просрочки по кредитам" },
                ]}
              />
              <DocLabel>Транзакционные</DocLabel>
              <DocP>
                Агрегируются по 8 временным окнам (1d, 3d, 7d, 14d, 30d, 90d, 180d, 365d), охватывают входящие и исходящие потоки по 8 каналам:
                ff, acc, p2p, smp, myself, atm, kassa, int. Для каждой комбинации направления × канала × окна — суммарный объём (amt) и
                количество (cnt): <span className="font-medium text-foreground">~256 транзакционных признаков</span>.
              </DocP>
            </>
          ),
        },
        {
          id: "training",
          num: "04",
          title: "Методология обучения",
          body: (
            <>
              <DocLabel>Хронологическое разбиение</DocLabel>
              <DocP>
                Данные разбиваются хронологически, а не случайно — чтобы исключить утечку таргета. Тестовая выборка состоит из последних N дней
                наблюдений (параметр <code className="font-mono text-xs text-foreground">test_days</code>), имитируя продакшен-условия.
              </DocP>
              <DocLabel>Дисбаланс классов</DocLabel>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-xs">
                <li>RandomUnderSampling мажоритарного класса; коэффициент сэмплинга — гиперпараметр, настраиваемый в оптимизации.</li>
                <li><code className="font-mono text-foreground">scale_pos_weight</code> в CatBoost — штрафует ложноотрицательные сильнее.</li>
              </ul>
              <DocLabel>Пространство гиперпараметров</DocLabel>
              <DocTable
                head={["Параметр", "Диапазон / варианты"]}
                rows={[
                  [<code className="font-mono text-xs text-foreground">grow_policy</code>, "SymmetricTree, Depthwise, Lossguide"],
                  [<code className="font-mono text-xs text-foreground">learning_rate</code>, "лог-равномерно [0.005, 0.5]"],
                  [<code className="font-mono text-xs text-foreground">iterations</code>, "[100, 2500]"],
                  [<code className="font-mono text-xs text-foreground">depth</code>, "[1, 16]"],
                  [<code className="font-mono text-xs text-foreground">l2_leaf_reg</code>, "лог-равномерно [0.001, 100]"],
                  [<code className="font-mono text-xs text-foreground">random_strength</code>, "лог-равномерно [0.001, 20]"],
                  [<code className="font-mono text-xs text-foreground">rsm</code>, "столбцовый сэмплинг [0.5, 1.0]"],
                  [<code className="font-mono text-xs text-foreground">bootstrap_type</code>, "Bayesian, Bernoulli, MVS"],
                  [<code className="font-mono text-xs text-foreground">scale_pos_weight</code>, "пропорционально обратной доле undersampling"],
                ]}
              />
            </>
          ),
        },
        {
          id: "metrics",
          num: "05",
          title: "Метрики оценки",
          body: (
            <>
              <DocTable
                head={["Метрика", "Описание"]}
                rows={[
                  ["ROC-AUC", "Способность к различению по всем порогам"],
                  ["Average Precision (AP)", "Площадь под precision-recall кривой; устойчива к дисбалансу"],
                  ["Precision@K", "Доля истинных случаев фрода в топ-K по баллу"],
                  ["Recall@K", "Доля всех случаев фрода, попавших в топ-K"],
                  ["F-beta (β=0.1)", "Гармоническое среднее с уклоном в precision — минимизирует FP"],
                  ["FPR", "Доля ложно помеченных легитимных клиентов"],
                ]}
              />
              <DocP>
                Кросс-валидация — стратифицированная K-fold (по умолчанию k=5), все метрики усредняются по фолдам. Целевая метрика оптимизации
                настраивается (например, <code className="font-mono text-xs text-foreground">average_precision</code>).
              </DocP>
            </>
          ),
        },
        {
          id: "pipelines",
          num: "06",
          title: "Запуск пайплайнов",
          body: (
            <>
              <DocCode>{`# 1. Подготовка данных
uv run kedro run --pipeline=data --async

# 2. Оптимизация гиперпараметров (Bayesian search)
uv run kedro run --pipeline=opt --async

# 3. Обучение финальной модели и оценка
uv run kedro run --pipeline=train --async

# 4. Прогноз
uv run kedro run --pipeline=predict --async`}</DocCode>
              <DocCallout title="Расписание">
                Predict-пайплайн запускается автоматически по дневному расписанию. Каждый день он подгружает текущую активную популяцию клиентов из
                feature store, загружает последний артефакт <code className="font-mono">cstm_pied_piper.joblib</code>, применяет те же преобразования,
                что и при обучении, и записывает балл риска для каждого клиента.
              </DocCallout>
            </>
          ),
        },
      ]}
    />
  );
}
