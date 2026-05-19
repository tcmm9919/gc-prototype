import { ModelDoc } from "@/components/ml/model-doc";

export default function Page() {
  return (
    <ModelDoc
      title="TSAD — Time Series Anomaly Detection"
      description="Детекция аномалий во временных рядах транзакций клиента"
      status="production"
      owner="Команда ML Risk"
      stack={["Python", "Statsmodels", "Prophet", "scikit-learn"]}
      sections={[
        {
          title: "Назначение",
          content: (
            <p>
              Выявление аномалий в поведении клиента по сравнению с его собственной историей: всплески оборотов, изменение
              частоты операций, нетипичные суммы. Выдаёт <code className="font-mono text-xs">anomaly_score</code> от 0 до 1,
              который подаётся в сценарии и правила как фактор риска.
            </p>
          ),
        },
        {
          title: "Алгоритм",
          content: (
            <>
              <p>
                Ансамбль из нескольких методов: ARIMA для линейных трендов, Prophet для сезонностей, Isolation Forest для
                многомерных выбросов. Финальный score — взвешенная сумма с весами, настроенными на исторической разметке.
              </p>
              <p>Окно анализа — последние 90 дней клиента. Минимальная история для применения — 30 дней.</p>
            </>
          ),
        },
        {
          title: "Входы и выходы",
          content: (
            <>
              <p><strong>Входы:</strong> Дневные фичи из Bank Offline FS — суммы, количество, медианы, volatility.</p>
              <p><strong>Выход:</strong> <code className="font-mono text-xs">anomaly_score ∈ [0, 1]</code> + breakdown по факторам (какой метод дал вклад).</p>
            </>
          ),
        },
        {
          title: "Метрики качества",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Precision на исторической разметке: 0.74</li>
              <li>Recall: 0.68</li>
              <li>F1: 0.71</li>
              <li>Median inference latency: 280 ms на клиента</li>
            </ul>
          ),
        },
        {
          title: "Использование",
          content: (
            <p>
              Подключается в сценариях через действие <code className="font-mono text-xs">call_ml_model("tsad")</code>.
              При <code className="font-mono text-xs">anomaly_score &gt; 0.7</code> рекомендуется автоматическое создание
              оповещения с серьёзностью High.
            </p>
          ),
        },
      ]}
    />
  );
}
