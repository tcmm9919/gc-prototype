import { ModelDoc } from "@/components/ml/model-doc";

export default function Page() {
  return (
    <ModelDoc
      title="Bank Offline Feature Store"
      description="Офлайн-фичестор для построения признаков по банковским данным клиента и транзакций"
      status="production"
      owner="Команда Data Engineering"
      stack={["PostgreSQL", "TimescaleDB", "Kedro", "Airflow", "Python 3.11"]}
      sections={[
        {
          title: "Назначение",
          content: (
            <>
              <p>
                Centralized офлайн-store, который собирает данные банковской CRM, транзакционные потоки и внешние справочники
                в единое типизированное хранилище фичей для обучения и оффлайн-инференса ML-моделей CTSM и TSAD.
              </p>
              <p>Поддерживает point-in-time correctness — все фичи доступны на любую историческую дату.</p>
            </>
          ),
        },
        {
          title: "Архитектура",
          content: (
            <>
              <p><strong>Хранилище:</strong> PostgreSQL 15 + расширение TimescaleDB для управляемых hypertable по временным рядам транзакций.</p>
              <p><strong>Пайплайны:</strong> Kedro для DAG-описания feature-pipelines с автоматическим версионированием.</p>
              <p><strong>Оркестрация:</strong> Airflow с расписанием перерасчёта (ежедневно ночью + on-demand для backfill).</p>
            </>
          ),
        },
        {
          title: "Структура и схемы",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="font-mono text-xs">clients</code> — измерение клиентов (slowly changing dimension)</li>
              <li><code className="font-mono text-xs">transactions_hyper</code> — hypertable, партиционирование по дате</li>
              <li><code className="font-mono text-xs">features_client_d</code> — дневной снимок фичей клиента</li>
              <li><code className="font-mono text-xs">features_client_w</code> — недельные агрегаты</li>
              <li><code className="font-mono text-xs">counterparties_blacklist</code> — справочник высоких рисков</li>
            </ul>
          ),
        },
        {
          title: "Примеры фичей",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Сумма входящих/исходящих за 7/30/90 дней</li>
              <li>Количество уникальных контрагентов за 30 дней</li>
              <li>Доля трансгранов от общего оборота</li>
              <li>Volatility расходов (стандартное отклонение по дням)</li>
              <li>Z-score текущей суммы относительно профиля</li>
              <li>Velocity (количество операций в скользящем окне 1ч/24ч)</li>
            </ul>
          ),
        },
        {
          title: "Частота обновления",
          content: <p>Дневные снимки — каждую ночь в 02:00 Asia/Almaty. Real-time-фичи (velocity) — стримом через Kafka.</p>,
        },
      ]}
    />
  );
}
