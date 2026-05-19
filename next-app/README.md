# Next.js template

This is a Next.js template with shadcn/ui.

> Воркспейс-документация в корне репо: [../CLAUDE.md](../CLAUDE.md) — стек и конвенции, [../context.md](../context.md) — продуктовый контекст GCP, [../design.md](../design.md) — UX-фреймворк, [../plan.md](../plan.md) — план скаффолда.

## Killer flow — центральный нарратив продукта

Сквозной демо-сценарий по клиенту Дягилев Михаил (см. context.md §14) показывает автоматическую обработку алерта через **Compliance Officer AI**: транзакция → правило → алерт → авто-кейс → workflow `Income Proof Remediation` → документ → перепроверка правил → закрытие кейса.

Шаги демо:
1. Открыть `/clients` и кликнуть на «Дягилев Михаил Владимирович».
2. Посмотреть карточку клиента: вкладки «Оповещения» и «Кейсы».
3. Перейти на `/cases` — найти `CASE-YYYYMMDD-...` с исполнителем `Compliance Officer AI`.
4. Открыть кейс → вкладка «Хронология» — видна вся цепочка от Compliance Officer AI.
5. `/agents/compliance-officer` — таблица «Активность агента» с теми же шагами.
6. `/audit` — фильтр «Кейс» показывает audit-цепочку.
7. `/llm-usage` — фильтр `compliance_agent` показывает LLM-вызовы за этот кейс.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
