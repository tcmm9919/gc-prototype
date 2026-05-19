# Designer's Brain — UX-фреймворк для прототипов

> Линза, через которую проходит каждое UX-решение. **Сам по себе документ не пишет код** — он формирует выбор: какой компонент взять, как сгруппировать, что показать первым, как назвать кнопку, какой стейт дорисовать.
>
> Project-specific правила и стек — в [CLAUDE.md](CLAUDE.md). Продуктовый контекст (что за GCP, какие модули и домен) — в [context.md](context.md). План скаффолда и фазы реализации — в [plan.md](plan.md). Этот файл — расширенная UX-справка для архитектурных решений и спорных случаев.

---

## A. Nielsen's 10 Usability Heuristics

| # | Принцип | Применение в прототипе |
|---|---|---|
| 1 | **Visibility of system status** | Loading-стейты, success-нотификации, прогресс-индикаторы. Никогда не оставляй пользователя в неведении после действия |
| 2 | **Match real world** | Иконки и термины из реального опыта пользователя. Не «entity» / «record» / «instance» |
| 3 | **User control & freedom** | Cancel / Back / Undo. Закрытие с dirty-формой → подтверждение, не молчание. Разрешать выйти из любого шага |
| 4 | **Consistency & standards** | Один и тот же паттерн для одной задачи. Save везде primary, Cancel везде default. Терминология одинаковая в табах/тултипах/инпутах |
| 5 | **Error prevention** | Не дать совершить ошибку: disable до выбора зависимостей, confirm до деструктивного, smart defaults вместо пустых полей |
| 6 | **Recognition over recall** | Покажи опции — не заставляй вспоминать. Dropdown / Cascader / Tree вместо free-text там, где список конечный |
| 7 | **Flexibility & efficiency** | Power-user shortcuts: bulk-actions, keyboard, saved filters, "Auto-translate" / "Generate SKU" — не в ущерб новичку |
| 8 | **Aesthetic & minimalist** | Каждый элемент зарабатывает своё место. Удаляй, не добавляй. Whitespace — друг |
| 9 | **Help recognize/diagnose/recover errors** | Plain language: «Add at least 3 characters» вместо «Validation error code 1042». Подскажи, как починить, в самой ошибке |
| 10 | **Help & documentation** | Inline tooltips, content helpers рядом с полем (collapsible). Документация — последний рубеж, не первый |

---

## B. Gestalt — визуальная группировка

| Принцип | Применение |
|---|---|
| **Proximity** | Связанные элементы — рядом. Лейбл прижат к инпуту. Action-кнопки в одной группе |
| **Similarity** | Одинаковая визуальная роль = одинаковый стиль. Все primary CTA выглядят одинаково |
| **Common Region** | Граница / фон создают группу. Card как контейнер связанной инфы |
| **Continuity** | Глаз следует по линии. Table-row alignment, form-flow сверху-вниз, шаги слева-направо |
| **Closure** | Глаз достраивает форму. Минимальные бордеры → не нужны полные обводки на каждом элементе |
| **Figure/Ground** | Передний план vs фон. Modal/Drawer создают чёткое разделение, overlay затемняет |
| **Common Fate** | Объекты, движущиеся вместе, воспринимаются группой. Анимируй связанные элементы синхронно |

---

## C. UX Laws — практические законы

| Закон | Что говорит | Применение |
|---|---|---|
| **Jakob's Law** | Юзеры проводят бóльшую часть времени на других сайтах — ждут знакомого поведения | Не изобретай велосипед. Catalog — как Shopify/Square. Product creation — как Amazon Seller Central |
| **Hick's Law** | Время решения ∝ log(вариантов) | Меньше выбора за раз. Progressive disclosure. Wizard вместо длинной формы |
| **Fitts's Law** | Время до цели зависит от расстояния и размера | Primary CTA — большой и близко. Destructive — мельче и подальше. Touch target ≥ 44px на мобиле |
| **Miller's Law** | 7±2 единицы в краткосрочной памяти | Группируй и chunк'ай. Не показывай 30 фильтров — раздели на «Stock», «Status», «Promo» |
| **Tesler's Law** (Conservation of Complexity) | Сложность сохраняется — если её не возьмёт система, возьмёт пользователь | Auto-translate, auto-generate SKU, auto-suggest category. Прячь сложность за умолчания |
| **Doherty Threshold** | Productivity падает при отклике > 400ms | Loading state, optimistic UI, skeleton — даже на mock'ах |
| **Goal-Gradient Effect** | Юзер ускоряется по мере приближения к цели | Прогресс-индикаторы (Steps, X/Y completed, %) — мотивируют дойти |
| **Aesthetic-Usability Effect** | Красивое воспринимается как более удобное | Не оправдание для bloat. Polish окупается на demos и first impressions |
| **Peak-End Rule** | Запоминаются пик и конец опыта | Success-экран после Submit — место для маленькой радости. Empty state — место для надежды |
| **Von Restorff Effect** | Выделяющийся элемент запоминается | Один primary CTA на экран. Не разбавляй — все красные кнопки = ни одной |
| **Serial Position Effect** | Первое и последнее запоминаются лучше | Важные действия — в начало или конец списка/меню/шагов |
| **Zeigarnik Effect** | Незавершённые задачи давят на память | Save Draft + видимый Drafts tab → юзер вернётся. Чек-лист с прогрессом эксплуатирует это |
| **Pareto Principle** | 80% юзеров используют 20% фич | Оптимизируй главные пути. Advanced — за expander'ом |
| **Postel's Law** | Будь либералом на входе, консерватором на выходе | Принимай разные форматы ввода (с пробелами/без, регистр), отдавай нормализованное |
| **Occam's Razor** | Самое простое решение побеждает | Если решается одним полем — не делай два. Drawer вместо modal-стека |

---

## D. State coverage — обязательные четыре

Каждый экран / компонент проектируется со всеми четырьмя состояниями:

1. **Empty** — нет данных. Объясни **почему** пусто, и дай **один** очевидный next-step (CTA)
2. **Loading** — skeleton (для контента) или spinner (для действия). Не «пустая страница»
3. **Data / Success** — happy path
4. **Error** — что случилось, что делать. Не код ошибки, а человеческая инструкция

«Сделал happy path — забыл остальное» — самая частая ошибка прототипа. Перед сдачей — пройдись по всем четырём.

> ⚠️ **Это правило живёт в CLAUDE.md как обязательное.** Здесь — пояснения и обоснование.

---

## E. Visual hierarchy — порядок прочтения

- **Размер** > **жирность** > **цвет** > **позиция** — в этом порядке управляй вниманием
- **F-pattern** для чтения текста и таблиц, **Z-pattern** для лендингов и hero-блоков
- **Whitespace** — структурный элемент, не «пустота». Грамотный воздух важнее лишнего разделителя
- **Контраст для акцента**: один primary CTA на экран, остальное — secondary/tertiary
- **Цвет — последняя линия**. Если всё понятно без цвета (для дальтоника) — добавляй цвет как усилитель, не как единственный сигнал

---

## F. Forms

- **Одна колонка** — выше completion rate, чем многоколоночные
- **Лейбл сверху** инпута — быстрее сканируется, чем лейбл слева (кроме узких inline-форм)
- **Required-маркер** — красная звёздочка возле лейбла, не «* required» в подсказке
- **Inline validation** — после blur, не на каждый keystroke. Не пугай пока пользователь печатает
- **Show requirements upfront** — «Min 10 characters» под полем сразу, не появляется только после ошибки
- **Smart defaults** — заполняй очевидное (currency = QAR, prep time = 15 min, status = active)
- **Группируй** связанные поля визуально (Card / Section / horizontal rule)

---

## G. Microcopy

- Кнопки = **глагол + объект**: «Add product», «Save changes», «Discard draft» — не «Submit», «OK»
- Confirmation описывает **последствие**: «Delete 5 products?» а не «Are you sure?»
- Error говорит **что и как**: «Title must be at least 10 characters» а не «Invalid input»
- Empty state — **педагогика + действие**: «No products yet» + «Add your first product →»
- Никакого dev-жаргона в UI: не «entity», «record», «payload», «instance», «null»

---

## H. Motion & feedback

- **200–300ms** — золотой диапазон transitions для большинства UI-изменений
- **Ease-out** для входа (быстрый старт, мягкое замедление), **ease-in** для выхода
- Анимируй **изменения**, не присутствие. Loop'ы и постоянные движения отвлекают
- Feedback мгновенный (<100ms), результат — может позже, но прогресс виден
- **Reduce-motion preference** — уважай (`@media (prefers-reduced-motion: reduce)`)

---

## I. Touch & accessibility minimum

- Touch target ≥ 44×44px на мобиле, ≥ 32×32px на desktop
- Контраст текста ≥ 4.5:1 (WCAG AA), UI-элементов ≥ 3:1
- Focus-ring **видимый** (не отключай `outline` без замены)
- Каждое действие достижимо клавиатурой (Tab/Enter/Escape/стрелки)
- Никогда не передавай смысл **только цветом** — всегда дублируй (иконка / текст / паттерн)

---

## J. shadcn/ui — подход и философия

> Stack по умолчанию для всех UI в этом проекте. Применён preset **`b6AnWmJSSW`** (стиль `radix-mira`) — см. ниже что это значит на практике.

### Что такое shadcn (и чем НЕ является)

- **Это не библиотека компонентов**, которую `npm install`. Это коллекция исходников, которые ты копируешь в свой репо через CLI (`npx shadcn@latest add <component>`).
- Компоненты лежат в `components/ui/` твоего проекта — **ты владеешь кодом**, правишь его как угодно, не ждёшь PR в upstream.
- Под капотом: **Radix UI primitives** (поведение, accessibility, фокус-менеджмент) + **Tailwind CSS** (стили) + **CVA** (варианты) + **lucide-react** (иконки).
- Темизация — через CSS variables в `globals.css` (`--background`, `--foreground`, `--primary`, …) в OKLCH. Не хардкоди hex'ы в компонентах.

### Когда брать shadcn-компонент vs писать свой

| Ситуация | Решение |
|---|---|
| Нужен Button / Input / Dialog / Select / Tabs / Card / Sheet / Popover / Command | **Бери из shadcn**, не пиши руками |
| Нужна форма | `Form` (react-hook-form) + `zod` schema — стандартная связка shadcn |
| Нужна таблица | `Table` + `@tanstack/react-table` |
| Нужен Date Picker | `Calendar` + `Popover` (composed) |
| Нужен Toast / Notification | `Sonner` (shadcn рекомендует, заменил старый `toast`) |
| Кастомный виджет, которого нет | Сначала проверь shadcn Blocks (`shadcn.com/blocks`) и community registries. Пиши свой — только если нет |

### Правила работы

1. **Не редактируй `components/ui/*.tsx` без причины** — это base layer. Кастомизация — через `className`, варианты CVA, или композицию обёрткой в `components/`
2. **Один источник темы** — CSS variables в `globals.css`. Меняешь брендинг → меняешь там, а не в каждом компоненте
3. **Не миксуй UI-киты.** Shadcn + Tailwind — и точка. Не тащи MUI / Chakra / Mantine рядом
4. **Иконки — только `lucide-react`**. Размер по умолчанию `size-4` (16px), `size-5` для крупных кнопок, `size-3.5` для inline
5. **Варианты — через `cva`** в самом компоненте. Не плоди десять prop-флагов — заведи `variant="ghost|outline|destructive"`
6. **Composition over props**. `<Dialog>` → `<DialogTrigger>` + `<DialogContent>` — это фича, а не баг. Не оборачивай в монолитный `<MyDialog open=…/>`, ломая Radix
7. **Accessibility встроена в Radix** — не отключай её. `Dialog` сам ловит ESC, фокус-trap, `aria-*`. Не подменяй своим `div` с `onClick`

### Anti-patterns

- ❌ `npm install @radix-ui/...` напрямую вручную — иди через `npx shadcn add`
- ❌ Импорт из `node_modules/shadcn-ui` — таких импортов нет, компоненты у тебя в репо
- ❌ Inline-стили (`style={{ padding: 12 }}`) вместо Tailwind-классов
- ❌ `bg-[#5B6CFF]` в коде — заведи токен (`--primary`) и используй `bg-primary`
- ❌ Свой `Modal.tsx`, дублирующий `Dialog` — используй существующий
- ❌ Глобальный CSS-override для shadcn-компонента — лучше форкни сам компонент в `components/ui/`

### Структура проекта (ожидаемая)

```
src/
├── app/                 # Next.js app router (или pages/)
├── components/
│   ├── ui/              # shadcn base (button.tsx, dialog.tsx, …) — не трогаем без нужды
│   └── <feature>/       # Бизнес-компоненты, собранные из ui/
├── lib/
│   └── utils.ts         # cn() helper (clsx + tailwind-merge)
├── hooks/
└── styles/
    └── globals.css      # CSS variables, Tailwind layers
```

### Темизация (быстрый чек)

- Палитра живёт в `:root` и `.dark` в `globals.css` — формат OKLCH (новый дефолт shadcn)
- Используй семантические токены: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `bg-destructive`. Не `bg-white` / `bg-zinc-900`
- Радиусы — через `--radius` (один источник, варианты через `rounded-sm/md/lg/xl`)
- Тёмная тема — через класс `.dark` на `<html>` (next-themes), не через media query напрямую

### Applied preset — `radix-mira` (b6AnWmJSSW)

Что preset реально сделал:
- Подтянул **Tailwind v4** через `@tailwindcss/postcss`
- Прописал палитру в `app/globals.css` (OKLCH) с **зелёно-лаймовым primary** (`oklch(0.841 0.238 128.85)`)
- Добавил тёмную тему (`.dark`) с зеркальными токенами
- Подключил шрифты через `@fontsource-variable/*` (self-hosted, ноль Google CDN): **Inter Variable** (sans) и **Manrope Variable** (heading) — `@import` в `app/globals.css`, переменные `--font-sans` / `--font-heading` в `:root`
- Поставил deps: `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`, `next-themes`
- Создал `lib/utils.ts` с `cn()` хелпером
- Завёл `components/theme-provider.tsx` и `components.json` с алиасами

Команды, которые нужны на практике:

```bash
# Применить preset заново (если переподнимаем проект)
npx shadcn@latest init --preset b6AnWmJSSW

# Поверх инициализированного проекта
npx shadcn@latest apply --preset b6AnWmJSSW

# Добавить компонент
npx shadcn@latest add <name>           # button, card, dialog, …
npx shadcn@latest add accordion command calendar progress tooltip breadcrumb
```

Уже установлено (19 компонентов в `components/ui/`):
`button, card, input, label, badge, separator, dropdown-menu, popover, tabs, skeleton, sonner, select, checkbox, switch, textarea, avatar, alert, dialog, sheet`

Стоит докинуть при первой нужде: `form` (нужен `react-hook-form` — уже стоит, но обёртка ставится отдельно), `table` + `data-table`, `calendar` + `date-picker`, `tooltip`, `command`, `progress`, `accordion`, `breadcrumb`, `pagination`.

### Брендинг — где менять

Один источник правды для темы — `app/globals.css`. Меняй:
- `--primary` / `--primary-foreground` — основной цвет акцента
- `--background` / `--foreground` — фон/текст
- `--radius` — базовый радиус (sm/md/lg/xl производные)
- Palette целиком в `:root` и `.dark`

Не правь компоненты в `components/ui/*.tsx` ради цвета — это всегда токен.

---

## K. Workflow для нового экрана

1. **Определи задачу пользователя** — что он пришёл сделать (одно предложение)
2. **Найди референс** (Jakob's Law) — как это делают в Shopify / Linear / Stripe / Vercel
3. **Скетч в голове** — empty / loading / data / error (раздел D)
4. **Подбери shadcn-компоненты** под каждый блок (раздел J) — что есть готового, что собрать композицией
5. **Иерархия** — что важно (размер/жирность/цвет/позиция, раздел E), один primary CTA
6. **Microcopy** — глагол+объект на кнопках, человеческие ошибки (раздел G)
7. **Состояния** — пройдись по всем четырём ещё раз перед финалом
8. **A11y чек** — фокус, контраст, клавиатура (раздел I)
