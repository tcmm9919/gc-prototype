# План скаффолда GCP-прототипа

> Связанные документы: [CLAUDE.md](CLAUDE.md) — стек и конвенции, [context.md](context.md) — продуктовый контекст, [design.md](design.md) — UX-фреймворк.
>
> Этот файл — чек-лист реализации. После завершения каждой фазы — запись в [context.md](context.md) decisions log.

---

## 0. Принципы

- **Прототип, не production.** Mock-данные в памяти, без бэкенда и реальных API.
- **4 состояния каждого экрана** (см. design.md §D): `empty / loading / data / error`. Не дописываем happy path и идём дальше — это самая частая ошибка прототипа.
- **Состояния доступны через `?state=empty|loading|error|data`** на одной странице. Дизайнер переключает URL, не рисует отдельный роут под каждое состояние.
- **Breadth + Flagship.** Сначала clickable map всех маршрутов с заглушками (Phase 1), потом deep-dive одного flagship-модуля (Phase 2 — «Клиент»), который задаёт бар качества для остальных. Без флагмана прототип расползается на 100+ равно-серых заглушек.
- **Composition over props.** Reusable primitives, не копи-паст между экранами.
- **Стек уже зафиксирован.** Next.js 16 + shadcn `radix-mira` + framer-motion. Не пересматриваем.

---

## 1. Зависимости, которые надо доставить перед стартом

### 1.1 Доп. shadcn-компоненты (Phase 0)

```bash
cd next-app
npx shadcn@latest add sidebar breadcrumb data-table chart command calendar tooltip accordion alert-dialog progress hover-card scroll-area collapsible navigation-menu pagination
```

Зачем:
- `sidebar` — левая навигация (4 группы, иконки, collapse, mobile drawer)
- `breadcrumb` — верх каждой страницы
- `data-table` — все списки (клиенты, транзакции, алерты, кейсы, ...) через TanStack Table
- `chart` — Dashboard и LLM usage, обёртка над recharts
- `command` — глобальный поиск ⌘K (Jakob's Law)
- `calendar` — фильтры по датам, EDD-чек-листы
- `tooltip` / `hover-card` — пояснения у иконок и preview-карточки
- `accordion` / `collapsible` — раскрываемые блоки (advanced-фильтры, история)
- `alert-dialog` — подтверждения деструктивных действий (design.md §G)
- `progress` — WARM-статус, EDD-прогресс, шаги визарда
- `scroll-area` — диалоги в чате, длинные таблицы
- `navigation-menu` — верхняя шапка модулей внутри карточки
- `pagination` — таблицы

### 1.2 Доп. npm-пакеты

```bash
npm install zustand date-fns
```

- `zustand` — глобальный стейт (current user, sidebar collapsed, выбранный mock-сценарий)
- `date-fns` — форматирование дат, Asia/Almaty
- `recharts`, `@tanstack/react-table`, `cmdk` — придут как peer-deps shadcn-компонентов

### 1.3 Risk-токены в `globals.css`

OKLCH-preset даёт `primary/secondary/destructive`, но для AML/KYC нужны 4 уровня риска (см. context.md §2.2). Добавить в `:root` и `.dark`:

```css
--risk-low: oklch(0.75 0.18 145);        /* зелёный, ОТЛИЧНЫЙ от primary-lime */
--risk-low-foreground: oklch(0.25 0.05 145);
--risk-medium: oklch(0.82 0.17 85);      /* янтарь */
--risk-medium-foreground: oklch(0.25 0.05 85);
--risk-high: oklch(0.72 0.18 45);        /* оранжевый */
--risk-high-foreground: oklch(0.98 0.02 45);
--risk-critical: oklch(0.58 0.22 25);    /* красный, ОТЛИЧНЫЙ от --destructive */
--risk-critical-foreground: oklch(0.98 0.02 25);
```

В `@theme inline` пробросить как `--color-risk-low`, `--color-risk-medium`, ... Использовать через Tailwind: `bg-risk-low`, `text-risk-critical-foreground`. Точные значения подберём при первом RiskBadge.

### 1.4 Mock-data слой (`lib/mock/`)

Типизированные фабрики + именованные сценарии. Designer-friendly: переключение сценария → меняется выборка во всех таблицах синхронно.

```
next-app/lib/mock/
├── types.ts             # Client, Transaction, Alert, Case, Rule, Scenario, Agent, AuditEvent, ...
├── factories.ts         # makeClient({risk,pep,segment}), makeTransaction({amount,channel,country}), ...
├── scenarios.ts         # busyDay, emptyInbox, criticalAlert, normalDay, edgeCases
├── store.ts             # zustand: { scenario, setScenario, mockState: 'data'|'loading'|... }
├── seeds/
│   ├── clients.ts
│   ├── transactions.ts
│   ├── alerts.ts
│   ├── cases.ts
│   ├── rules.ts
│   ├── compliance-scenarios.ts
│   ├── agents.ts
│   ├── audit.ts
│   └── users.ts
└── index.ts             # барель — useMockClients(), useMockTransaction(id), ...
```

Хуки возвращают данные с задержкой при `?state=loading`, бросают error при `?state=error`, пустой массив при `?state=empty`.

---

## 2. Архитектура приложения

### 2.1 Route map

```
app/
├── (auth)/                          # без сайдбара, центрированная карточка
│   ├── layout.tsx
│   ├── login/page.tsx               # стикер 1
│   ├── 2fa/page.tsx                 # стикер 1
│   ├── forgot-password/page.tsx     # стикер 1
│   └── reset-password/page.tsx
│
├── (app)/                           # AppShell: sidebar + topbar + global AssistantTrigger
│   ├── layout.tsx
│   │
│   ├── dashboard/page.tsx           # context.md §2.1 — 6 KPI + 2 панели
│   │
│   ├── clients/
│   │   ├── page.tsx                 # список — §2.2
│   │   └── [id]/
│   │       ├── page.tsx             # обзор (default tab) — Канал уведомлений, 15 флагов, AI-генерация, Избранные сценарии, превью документов
│   │       ├── scoring/page.tsx     # Профиль рисков с подскорами от агентов
│   │       ├── transactions/page.tsx
│   │       ├── alerts/page.tsx
│   │       ├── cases/page.tsx
│   │       ├── edd/page.tsx         # чек-лист + 10-секционный EDD-отчёт + Скачать PDF
│   │       ├── news/page.tsx        # Adverse media — таб «Новости» (новое)
│   │       ├── history/page.tsx
│   │       └── documents/page.tsx
│   │
│   ├── transactions/
│   │   ├── page.tsx                 # §2.3 — колонки Назначение/В тенге/Филиал
│   │   └── [id]/page.tsx            # 4 верхние карточки + Банковская инфо
│   │
│   ├── chat/page.tsx                # §2.4 — top-level AI-чат, НЕ в сайдбаре
│   │
│   ├── rules/
│   │   ├── page.tsx                 # §3.1 — категории, версионирование
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   │
│   ├── alerts/
│   │   ├── page.tsx                 # §3.2
│   │   └── [id]/page.tsx
│   │
│   ├── cases/
│   │   ├── page.tsx                 # §3.3 + стикер 3 — CASE-YYYYMMDD-XXXX
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx            # 4 таба активности (Комментарии/Доказательства/Подзадачи/Хронология)
│   │
│   ├── workflows/                   # was /scenarios — переименовано под боевую
│   │   ├── page.tsx                 # 3 таба (Клиентский active, Групповой/Встроенный disabled)
│   │   ├── builder/page.tsx         # drag-and-drop pipeline из 15 активностей
│   │   ├── [id]/page.tsx            # План + Запуск + История
│   │   └── [id]/warm/page.tsx       # стикер 2
│   │
│   ├── ai/page.tsx                  # §5 — лендинг с 3 тайлами (Чат / Агенты / Комплаенс-агент)
│   │
│   ├── agents/                      # был /ai/agents, перенесён на top-level
│   │   ├── page.tsx                 # список агентов
│   │   ├── [id]/page.tsx            # карточка агента
│   │   └── compliance-officer/page.tsx  # §5.3 — Compliance Officer AI
│   │
│   ├── instructions/                # was /ml — переименовано под боевую
│   │   ├── page.tsx                 # каталог (3 модели, версии и даты)
│   │   ├── bank-offline-fs/page.tsx
│   │   ├── tsad/page.tsx
│   │   └── ctsm/page.tsx            # Compliance Tabular Supervised Model (Pied Piper)
│   │
│   ├── llm-usage/
│   │   ├── page.tsx                 # §7.1 — 6 summary cards + таблица 12 колонок
│   │   └── [requestId]/page.tsx
│   │
│   ├── audit/page.tsx               # §7.2 + стикер 5 — фильтр по ресурсу
│   │
│   ├── settings/
│   │   ├── users/page.tsx           # +Compliance Officer AI (ai_agent)
│   │   ├── system/page.tsx          # JSON config table
│   │   └── risk-factors/page.tsx    # Динамические факторы (Название/Тип/Источник/Корзины/Вес)
│   │
│   └── profile/page.tsx             # стикер 7 — лимиты текущего юзера (переехало из llm-usage)
│
├── layout.tsx                       # root: fonts, theme, toaster (sonner)
└── page.tsx                         # → redirect /dashboard или /login
```

### 2.2 Reusable primitives

Кладу в `components/shell/` (хром приложения) и `components/ext/` (расширения над shadcn).

**Shell:**
- `AppSidebar` — 4 группы из context.md §1.1, иконки lucide, активный пункт, collapse, mobile-drawer
- `AppHeader` — breadcrumbs + ⌘K-search-trigger + profile-menu + theme-toggle
- `CommandPalette` — ⌘K, переходы к клиенту/транзакции/кейсу + переключение mock-сценария (dev-only)
- `DevToolbar` — нижний правый угол, переключает `?state=` и mock-сценарий

**Расширения над ui/:**
- `PageHeader` — title + description + actions (правый угол)
- `DataTable` — обёртка над shadcn data-table: sort, column-visibility, filter-chips, bulk-actions, density, экспорт CSV
- `FilterBar` — chips активных фильтров + popover «Добавить фильтр»
- `EmptyState` — иконка + почему пусто + один CTA (design.md §G)
- `ErrorState` — что случилось + retry + ссылка на support
- `Skeletons` — `TableSkeleton`, `CardSkeleton`, `DetailSkeleton`, `ListSkeleton`
- `AssistantPanel` — правый Sheet с быстрыми промптами и стримом ответа
- `RiskBadge` — `low|medium|high|critical` через `--risk-*` токены
- `StatusBadge` — generic с props.tone
- `EntityHeader` — для карточек клиент/транз/кейс/сценарий: имя + ID + статус + риск + actions
- `MoneyKZT` — форматирование с конвертацией (Postel's Law — принимает разные форматы)
- `RelativeTime` — «5 минут назад», с tooltip полной даты Asia/Almaty
- `KbdHint` — отображение шорткатов (⌘K и т.п.)

### 2.3 State coverage через search params

Каждый list и detail page:

```tsx
type Props = { searchParams: { state?: "empty"|"loading"|"error"|"data" }};

export default function Page({ searchParams }: Props) {
  const state = searchParams.state ?? "data";
  if (state === "loading") return <TableSkeleton />;
  if (state === "empty") return <EmptyState ... />;
  if (state === "error") return <ErrorState onRetry={...} />;
  return <ActualContent data={useMockClients()} />;
}
```

DevToolbar переключает на лету: 4 кнопки `E / L / D / R`, обновляет URL без перезагрузки.

### 2.4 Convention: AI Assistant Panel

В карточках (клиент, транзакция, кейс, сценарий) — правый `Sheet`-выезжатель с контекстом сущности:
- Header: «Ассистент / контекст: ИвановИИ.С., risk=high»
- Quick prompts (chips): «Объясни риск», «Сравни с похожими», «Черновик отчёта»
- Текст-ответ со стримингом (typewriter framer-motion)
- «Перенести в основной чат» → `/chat` с этим диалогом
- Триггер открытия — кнопка в EntityHeader или ⌘. (Cmd-period)

---

## 3. Фазы

### Phase 0 — Foundation
- [ ] Доставить shadcn-компоненты (§1.1)
- [ ] Доставить npm-пакеты (§1.2)
- [ ] Risk-токены в `globals.css` (§1.3) + RiskBadge primitive
- [ ] Mock-data слой: types, factories, scenarios, store, seeds (§1.4)
- [ ] Route groups `(auth)`, `(app)` + root `page.tsx` redirect → `/dashboard`
- [ ] Reusable primitives (§2.2): Shell + Расширения
- [ ] AppShell layout: AppSidebar + AppHeader + контент-слот
- [ ] DevToolbar и CommandPalette с переключением `?state=` и сценария

**Definition of Done:** запустить `npm run dev`, открыть `/dashboard`, увидеть пустой каркас с сайдбаром на 4 группы и шапкой; DevToolbar внизу справа переключает состояния; ⌘K открывает палитру.

### Phase 1 — Карта маршрутов (breadth)
- [ ] Заглушки для всех URL из §2.1: PageHeader + «TODO: <модуль>» + 4 состояния через `?state=`
- [ ] Все пункты сайдбара ведут на свои URL
- [ ] Breadcrumbs автоматически из path-сегментов
- [ ] CommandPalette индексирует все маршруты

**Definition of Done:** designer может пройти по сайдбару во все разделы и подразделы, видит «TODO» с осмысленным placeholder-content и переключает состояния.

### Phase 2 — Flagship: Клиенты (depth, bar-setter)
- [ ] `/clients` — DataTable с колонками из context.md §2.2, фильтры (тип/риск/статус/сегмент/гео/даты), bulk-actions, экспорт
- [ ] `/clients/[id]` — EntityHeader + 8 табов (Обзор, Скоринг, Транзакции, Оповещения, Кейсы, EDD, История, Документы)
- [ ] Каждый таб — полноценный layout с реальным mock-данным и 4 состояниями
- [ ] AI AssistantPanel с быстрыми промптами и стримом
- [ ] EDD-флоу: чек-листы документов, статусы шагов, комментарий офицера, кнопка «Поднять риск / в кейс»

**Definition of Done:** этот модуль — эталон. Открывая любую карточку клиента, видим, как должны выглядеть остальные сущности. Прошлись по чек-листу design.md (Microcopy, A11y, Motion).

### Phase 3 — Мониторинг
- [ ] Dashboard: 6 KPI-карточек + 2 панели снизу (Оповещения по важности / Обзор кейсов). Соответствует боевой.
- [ ] Транзакции — список с колонками `Назначение / В тенге / Филиал` + карточка из 4 верхних секций (Информация / Клиент / Назначение / Участники) + Банковская информация + Риск-флаги.
- [ ] Чат (`/chat`, **top-level, не в сайдбаре**) — левый список диалогов, правое поле общения, прикрепления.

### Phase 4 — Расследования
- [ ] Правила — список с колонками `Категория / Важность / Статус / Версия` + редактор (16 полей, 8 операторов, режим «Значение vs Поле», AND-only). Поддержка `v2`, `v3`.
- [ ] Оповещения — список с колонкой `Кейс` + фильтр по серьёзности и статусу.
- [ ] Кейсы — формат `CASE-YYYYMMDD-XXXX`, исполнитель может быть `Compliance Officer AI`, 4 таба активности в карточке (Комментарии/Доказательства/Подзадачи/Хронология).
- [ ] Архитектура «тип кейса = workflow» (стикер 3): первый кастомный тип — `Авто-кейс: Транзакционная аномалия` + workflow `Income Proof Remediation`.

### Phase 5 — Автоматизация и AI
- [ ] Workflows (`/workflows`, не `/scenarios`) — 3 таба (Клиентский active, Групповой/Встроенный disabled с tooltip «В разработке»).
- [ ] **Workflow builder — drag-and-drop pipeline** (`/workflows/builder`): 3 колонки — Палитра 15 активностей · Пайплайн · Конфигурация. Стек: `@dnd-kit/core` + `@dnd-kit/sortable`.
- [ ] WARM-status экран (`/workflows/[id]/warm`) с прогрессом длительного процесса (стикер 2).
- [ ] AI-инструменты — лендинг (`/ai`) из 3 тайлов: Чат (→`/chat`), Агенты (→`/agents`), Комплаенс-агент (→`/agents/compliance-officer`).
- [ ] Карточки агентов (`/agents/[id]`) с Markdown-инструкциями и логом запусков.
- [ ] **Compliance Officer AI** (`/agents/compliance-officer`): Принцип работы 6 шагов + Email менеджера + 4 чекбокса + таблица активности.
- [ ] ML (`/instructions`) — каталог-knowledge-base из 3 моделей с версиями (BankFS v1.4, TSAD v1.2, CTSM v2.0 «Pied Piper»). Стикер 6.

### Phase 6 — Система
- [ ] LLM usage (`/llm-usage`): аналитика — 6 KPI-карточек (вызовы / токены / стоимость) + фильтры (модель/агент/статус) + таблица 12 колонок (с латентностью, кэшем, рассуждением) + пагинация.
- [ ] Карточка LLM-запроса: токены, стоимость, промпт/ответ.
- [ ] Журнал аудита (`/audit`) — таблица 5 колонок + фильтр по ресурсу (Клиент/Транзакция/Алерт/Кейс/Отчёт/Правило/Сценарий) + экспорт CSV (стикер 5). Авто-юзер `system` + `Compliance Officer AI` в записях.
- [ ] Audit отражается в карточке клиента → таб «История» (стикер 5).
- [ ] Settings: Пользователи (+`Compliance Officer AI` как `ai_agent`) / Система (JSON-config table с `compliance_agent_config`, `risk_thresholds`, `sla_*_hours`, `default_timezone`, `default_currency`) / Риск-факторы (Динамические факторы — Название/Тип/Источник/Корзины/Вес/Активен).
- [ ] Profile с собственными лимитами LLM (стикер 7) — переехало из старого `/llm-usage`.

### Phase 7 — Авторизация (стикер 1)
- [ ] `/login` — email + password
- [ ] `/2fa` — 6-значный код
- [ ] `/forgot-password`, `/reset-password`
- [ ] Mock-auth: localStorage флаг, без реального JWT
- [ ] Middleware: редирект `(app)/*` → `/login` если флага нет

### Phase 8 — Killer flow storyboard (новая)
- [ ] Mock-сценарий `killer-flow-demo` в `lib/mock/scenarios/`: преднастроенный набор (клиент Дягилев, транзакция 1.5M, alert, case `CASE-20260506-7F6A3D24`, workflow `Income Proof Remediation`, 10 LLM-вызовов, цепочка audit events).
- [ ] DevToolbar — шорткат «Открыть killer flow» с диплинком на карточку клиента.
- [ ] README прототипа: короткая инструкция «Как посмотреть killer flow».
- [ ] Verification: цикл из §14 context.md прослеживается на 6+ экранах одновременно.

---

## 4. Открытые решения (предлагаю; скажи если не так)

| Решение | Предлагаю | Почему |
|---|---|---|
| Charts | `recharts` через shadcn chart | дефолт shadcn, не изобретаем |
| Таблицы | `@tanstack/react-table` через shadcn data-table | стандарт, sort/filter/virtualize из коробки |
| Global state | `zustand` | минимально, без бойлерплейта Redux |
| Mock auth | localStorage флаг | прототип не должен симулировать JWT |
| ⌘K | shadcn command | Jakob's Law, юзер ждёт |
| Даты | date-fns + `Asia/Almaty` | формат `dd.MM.yyyy HH:mm` |
| Тёмная тема | с первой фазы | already wired через next-themes |
| i18n | без библиотеки, всё на русском | прототип; перевод нужно — добавим i18next позже |
| Mock-сценарии в URL | `?scenario=busyDay` + dev-toolbar | designer переключает быстро |

---

## 5. Out of scope (намеренно НЕ делаем)

- Реальная аутентификация (JWT, OAuth, SSO, 2FA через TOTP) — только UI-болванка
- Реальные API-вызовы — только mock-хуки
- Реальные ML-модели — только UI каталога
- WCAG-аудит и compliance-сертификация — базовая a11y из shadcn-компонентов есть, формальный аудит нет
- Unit / E2E тесты
- CI / CD / Vercel-деплой
- Локализация (RTL, английская версия, форматы валют других стран)
- Бэкенд (Node API, БД)

---

## 6. Definition of Done для каждой фазы

- [ ] Все экраны фазы кликабельны из сайдбара и breadcrumbs
- [ ] 4 состояния (empty/loading/data/error) есть и переключаются через `?state=`
- [ ] Mock-данные подключены, переключаются сценариями
- [ ] Прошлись по чек-листу design.md: Microcopy, A11y minimum, Motion
- [ ] `npm run typecheck` чист
- [ ] `npm run dev` стартует, прошлись по всем экранам фазы в браузере
- [ ] Запись в [context.md](context.md) decisions log

---

## 7. Что после плана

1. Согласовать §4 (открытые решения) и §5 (out of scope).
2. Стартуем Phase 0 — день-два работы.
3. После Phase 0 — короткое демо в браузере: «вот каркас, вот переключатели».
4. Phase 1 — пара дней на breadth.
5. Phase 2 (Клиенты) — самая большая, 3–5 дней. Тут устанавливается весь UX-стандарт.
6. Phases 3–7 идут быстрее, копируя паттерны.
