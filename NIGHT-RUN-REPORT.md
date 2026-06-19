# NIGHT-RUN-REPORT.md — выравнивание по эталону /cases

Прогон выполнен автономно. Эталон извлечён в [SPACING-BASELINE.md](SPACING-BASELINE.md).
Проверка по схеме: эталон /cases снят через Playwright (`next-app/scripts/shot.mjs`, fullPage,
тёмная тема, 1440×900), целевые страницы — во всех 4 состояниях `?state=`, сравнение глазами.

## Итог: 6 / 6 страниц доведены

| # | Страница | Коммит | typecheck | lint¹ | build | Итераций² |
|---|---|---|---|---|---|---|
| — | baseline + shot-скрипт | `cca72f1` | — | — | — | — |
| 1 | `rules/[id]` | `61393c2` | ✓ | ✓ | ✓ | 1 |
| 2 | `workflows/[id]` | `f7c75fd` | ✓ | ✓ | ✓ | 1 |
| 3 | `workflows` (список) | `474ac2c` | ✓ | ✓ | ✓ | 1 |
| 4 | `ai` | `b9ca89a` | ✓ | ✓ | ✓ | 1 |
| 5 | `settings` (system/users) | `835182b` | ✓ | ✓ | ✓ | 1 |
| 6 | `risk-factors` | `1812d3e` | ✓ | ✓ | ✓ | 1 |

¹ **lint**: в моих файлах — ноль проблем. В репозитории есть **13 предсуществующих lint-ошибок**
в файлах, которые трогать запрещено (`components/dashboard/*`, `components/chat/chat-screen.tsx`,
`components/ext/data-table.tsx`, `components/ui/carousel.tsx`, `hooks/use-mobile.ts`,
`components/shell/auth-guard.tsx`, `lib/mock/index.ts`, `app/(app)/settings/instructions/tsad/page.tsx`).
Гейт «lint → ноль» не достижим без правки чужих файлов → интерпретирован как «ноль НОВЫХ ошибок от моих
изменений». `next build` на них не падает (`next.config: eslint.ignoreDuringBuilds: true`).

² **Итераций**: расхождения с эталоном находил при чтении кода ДО первого скриншота, поэтому
первый же снимок выходил выровненным. По каждой странице выполнен полный цикл «исправил → снял →
посмотрел глазами (data + empty/loading/error) → подтвердил». Повторных правок после снимка не
потребовалось ни на одной странице.

---

## Что сделано по страницам

### 1. `rules/[id]` — `rule-builder.tsx`
Detail-обёртка, пассапорт (`rule-identity`) и 4 состояния уже совпадали с эталоном.
Расхождение — секции билдера: `rounded-xl p-4` без `bg-card` → приведены к эталонной секции-карточке
`rounded-2xl border border-border bg-card p-5` (×3). Soft-rows (условия/действия) `rounded-lg` →
`rounded-xl` + `bg-foreground/[0.03]`.
Визуал: gap между секциями `gap-4`, padding `p-5`, заголовки `h4 mb-4` — совпали с /cases.

### 2. `workflows/[id]` — `workflow-detail.tsx` + новый `workflow-identity.tsx`
**Единственная detail-страница, оставшаяся на старом лейауте** (`DetailHeader` + сетка `lg:grid-cols-3`),
тогда как client/case/alert/transaction/rule уже унифицированы на пассапорт-рейл. Переведена на эталон:
новый `WorkflowIdentity` (левый рейл) + контент-секции План/Запуск/История в паттерне `rounded-2xl
bg-card p-5`. Попутно убран **баг двойного паддинга** (`px-6` поверх layout `px-8`); outer → `pb-6 pt-5`.
Логика (pipeline, выбор клиента, тогл истории) сохранена.

### 3. `workflows` (список) — `page.tsx` + `workflows-table.tsx`
Был вне эталона: `page.tsx` без `StateSwitch`, кастомная `Card`+grid-таблица. Переведён на эталонный
паттерн списка: `StateSwitch skeleton="table"` + общий `<DataTable>` (views/columns/toolbar/emptyAction,
сортировка, поиск) — как `cases-table`. Views по типам сценария (Клиентский/Групповой).

### 4. `ai` — `page.tsx`
Обёрнут в `StateSwitch skeleton="list"`. Убран `p-6` у сетки тайлов (двойной паддинг → рассинхрон с
шапкой; теперь сетка и `PageHeader` выровнены по `px-8` layout). Самодельный CTA-«якорь»
(`bg-primary px-3 py-2`) → `<Button asChild>`. Классы тайла → набор (`flex flex-col gap-3 p-5`).
`PageHeader`-hero оставлен (намеренный паттерн лендинга-хаба).

### 5. `settings` (system/users)
`settings/users` уже на `DataTable`+`StateSwitch` — не трогал. `settings/system`: подключён
`StateSwitch skeleton="table"`, убран лишний `pb-12` (паддинг даёт settings-остров). Settings-«остров»
(рейл 220px + контент) — намеренный hub-дизайн, не /cases-паттерн; не перестраивал, только состояния.

### 6. `risk-factors`
Был вынесен из `settings` на верхний уровень (реорг прошлой сессии) — спека §7.3 указывала
`settings/risk-factors`. Колонки (Название/Тип/Источник/Корзины/Вес/Активен) и empty-state уже на месте;
таблица-карточка визуально совпадает с эталоном (`rounded-2xl border bg-card` + shadow). Пробел — не было
4 состояний → обёрнут список в `StateSwitch skeleton="table"`. Кастомный билдер (inline-форма + мини-
визуализации корзин/веса) сохранён как намеренный дизайн.

---

## TODO[ночной-прогон]

1. **`components/workflows/workflows-table.tsx`** — спека §4.1–4.2 хочет 3 таба со статусами
   *Групповой/Встроенный disabled + tooltip*. Модель `ScenarioType` знает только `"client" | "group"`
   (нет `"embedded"`/Встроенный), а `DataTableView` не поддерживает `disabled`/`tooltip`. Реализованы
   обычные views по существующим типам. Чтобы сделать «как в спеке» — нужно расширить модель и
   `DataTableView` (правка `components/ext/data-table.tsx` — вне объёма ночного прогона).
2. **`workflow-identity` / `workflow-detail`** — `sequentialId` = `id.replace(/^SC-?/,"").replace(/^0+/,"")`
   на id вида `SC-00ll` даёт `#ll` (id не чисто числовой). Это существующая бизнес-логика, не менял.
   Стоит пересмотреть формат коротких ID сценариев.

## Места, где сам эталон /cases выглядел сомнительно (НЕ трогал, фиксирую)
- `case-detail.tsx:89` — «Обновлено» рендерит `cs.openedAt` (то же значение, что «Создано») — вероятно
  баг данных.
- Внутри одного таба секции в основном `p-5`, а «Хронология» — `p-6` (лёгкий рассинхрон паддинга).
- `Block` (пассапорт) в light-теме имеет `border-transparent` (рамка только в dark), а секции-карточки
  всегда `border-border` — в светлой теме рамки пассапорта и секций видны по-разному.
- Хронология и часть комментариев в `case-detail` — хардкод дат/текста (демо-заглушки, не из mock).

## Инфраструктура (коммит `cca72f1`, не трогает прод-код)
- `SPACING-BASELINE.md` — чек-лист эталона.
- `next-app/scripts/shot.mjs` — fullPage-скриншоты (`node scripts/shot.mjs "<path>" <name>`).
- `playwright` как devDependency; `.night-shots/` в `.gitignore` (скриншоты не коммитятся).

## Не отступал от правил
Не трогал: `/cases`, mock-data слой, `globals.css` (токены), `components/ui/*`. Только семантические
токены. Иконки — lucide. `git push` не делал (только локальные коммиты). Все коммиты — под активной
учёткой `tcmm9919` (переключена ранее в сессии).
