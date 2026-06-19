# SPACING-BASELINE.md — эталон /cases

Извлечено из эталонных файлов (ночной прогон). Это **единственная мера ровности**.
Все целевые страницы (rules, workflows, ai, settings) чинятся строго по этому файлу.

Источники эталона:
- `app/(app)/cases/page.tsx` — список
- `app/(app)/cases/[id]/page.tsx` — detail
- `components/cases/cases-table.tsx` — таблица списка
- `components/cases/case-detail.tsx` — detail-лейаут (рейл + табы + секции)
- `components/cases/case-identity.tsx` — пассапорт (левый рейл)
- `components/ext/state-switch.tsx` — 4 состояния через `?state=`
- `components/ext/{empty-state,error-state,skeletons}.tsx` — примитивы состояний
- `components/ext/data-table.tsx` — универсальная таблица

---

## 1. Spacing scale — РАЗРЕШЁННЫЙ НАБОР

Любой класс отступа вне этого набора — подозрительный. Привести к ближайшему или обосновать TODO.

**gap-*** (flex/grid): `gap-0` `gap-1` `gap-1.5` `gap-2` `gap-2.5` `gap-3` `gap-4` `gap-6`
**space-y-*** (вертикальные стэки): `space-y-0.5` `space-y-1` `space-y-1.5` `space-y-2` `space-y-3` `space-y-4` `space-y-6`
**padding карточек/блоков**: `p-4` `p-5` `p-6` · `px-3 py-2` · `px-3 py-2.5` · `px-4 py-2.5` (таб) · `px-6 py-20` (состояния)
**margin заголовков**: `mb-3` `mb-4` `mb-5` · `mt-1.5` `mt-2` `mt-3` · `pt-0.5`
**обёртка страницы (detail)**: `pb-6 pt-5`

Базовая «единица» — 4px шаг Tailwind. Полушаги (`.5`) встречаются только как `1.5 / 2.5`.
НЕ использовать: `gap-5`, `gap-7`, `gap-8`, `space-y-5`, `p-3`, `p-7`, `p-8`, произвольные `[Npx]` отступы.

---

## 2. Структура СПИСКА (как /cases)

`app/(app)/<route>/page.tsx` — тонкий серверный/клиентский враппер:

```tsx
import { StateSwitch } from "@/components/ext/state-switch";
import { XxxTable } from "@/components/<feature>/xxx-table";

export default function Page() {
  return (
    <StateSwitch
      skeleton="table"
      emptyTitle="<глагол/факт>"
      emptyDescription="<что делать>"
    >
      <XxxTable />
    </StateSwitch>
  );
}
```

- НЕТ отдельного PageHeader/FilterBar в page.tsx — заголовок даёт глобальная шапка,
  панель управления (views + поиск + filters + toolbar CTA) живёт ВНУТРИ `<DataTable>`.
- `XxxTable` рендерит **только** `<DataTable>` с props:
  `data, views, columns, globalFilterPlaceholder, onRowClick, renderExpanded,
   pageSize={20}, globalFilterFn, filters, toolbar, emptyAction`.
- `toolbar` / `emptyAction` CTA: `<Button asChild size="xl">` (toolbar) / `size="sm" variant="outline"` (empty),
  иконка `<Plus className="size-4" />` + «глагол + объект» («Новый кейс»).
- `filters`: `<Button variant="outline" size="xl">` + `<Filter className="size-4" />`.
- Колонки: `ColumnDef[]`, ширины через `meta: { width: "minmax(0, 1.8fr)" }`.
- ОДИН primary CTA на экран (toolbar). Остальное — outline/ghost.

---

## 3. Структура DETAIL (как /cases/[id])

`page.tsx`: `<StateSwitch skeleton="detail" emptyTitle="<Сущность> не найден"> <XxxDetail id={id}/> </StateSwitch>`
(+ `generateStaticParams` из `getAll<Xxx>Ids()`).

Лейаут `XxxDetail` (точная разметка):

```tsx
<div className="pb-6 pt-5">
  <div className="grid items-start gap-6 lg:grid-cols-[336px_minmax(0,1fr)]">
    {/* ЛЕВЫЙ РЕЙЛ — пассапорт, sticky */}
    <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <XxxIdentity .../>
    </aside>

    {/* ПРАВО — табы + карточка контента */}
    <div className="min-w-0">
      <Tabs value={tab} onValueChange={setTab} className="gap-0">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0 group-data-horizontal/tabs:h-auto">
          {TABS.map(t => (
            <TabsTrigger key={t.value} value={t.value}
              className="-mb-px h-auto flex-none whitespace-nowrap rounded-t-lg rounded-b-none border border-transparent bg-transparent px-4 py-2.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus:outline-none focus-visible:ring-0 data-[state=active]:border-border data-[state=active]:border-b-card data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none group-data-[variant=default]/tabs-list:data-active:shadow-none">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="client-shell rounded-b-2xl rounded-tr-2xl border border-t-0 border-border bg-card p-4 md:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.18,ease:"easeOut"}}>
              <h3 className="mb-5 font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">{activeLabel}</h3>
              {/* секции таба */}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  </div>
</div>
```

Ключевое:
- рейл фиксированный **336px**, контент `minmax(0,1fr)`, между ними `gap-6`.
- табы: контейнер `gap-0`; список `gap-1 p-0 border-b`; триггер `px-4 py-2.5 text-[13px]`, активный = карточка-вкладка (`border` + `border-b-card` + `bg-card`).
- карточка контента: `p-4 md:p-5`, `rounded-b-2xl rounded-tr-2xl border border-t-0`.
- заголовок таба h3: `mb-5 ... text-[22px] font-bold`.
- контент таба завёрнут в `motion.div` (framer-motion, 0.18s).

---

## 4. Паттерн КАРТОЧКИ-СЕКЦИИ (внутри таба)

```tsx
<div className="flex flex-col gap-4">                          {/* стэк секций: gap-4 */}
  <div className="grid gap-4 md:grid-cols-2"> ... </div>        {/* 2 колонки: gap-4 */}

  <div className="rounded-2xl border border-border bg-card p-5">   {/* секция: p-5 (Хронология — p-6) */}
    <h4 className="mb-4 font-heading text-[15px] font-semibold">Заголовок
      <span className="ml-1 font-normal text-muted-foreground">{count}</span>     {/* счётчик опц. */}
    </h4>
    <div className="space-y-3"> ... </div>                       {/* контент: space-y-3 / space-y-4 */}
  </div>
</div>
```

- секция-карточка: `rounded-2xl border border-border bg-card p-5` (или `p-6`).
- заголовок секции: `h4` `mb-4 font-heading text-[15px] font-semibold` (иногда `mb-3` если ниже сразу инпут).
- field-строка: `grid grid-cols-[130px_1fr] gap-2 text-sm`, лейбл `text-xs text-muted-foreground`.
- мини-строки в списках (alerts/tx/checklist): `rounded-xl bg-foreground/[0.03] px-3 py-2.5` (или `py-2`),
  список `space-y-2`, тёмная тема `dark:bg-white/[0.03]`.

### Пассапорт (левый рейл, XxxIdentity)
```tsx
<div className="flex flex-col gap-4">
  <Block>                                       {/* = rounded-2xl border bg-card p-6 */}
    <div className="flex flex-col gap-6">        {/* секции пассапорта: gap-6 */}
      <div className="flex flex-col items-start gap-2"> {/* шапка: ID + бейджи + тип */}
        <h2 className="font-heading text-[18px] font-bold tracking-[-0.02em] tabular-nums">{id}</h2>
        <div className="flex flex-wrap gap-1.5"><StatusBadge/>...</div>
      </div>
      {/* мини-карточка связи: rounded-xl bg-foreground/[0.03] px-3 py-2.5 */}
      <div className="flex flex-col gap-2.5"> {/* кнопки действий: size="lg" w-full justify-center */} </div>
    </div>
  </Block>
</div>
```

---

## 5. Четыре состояния через `?state=` (паттерн plan.md §2.3)

Универсальный `<StateSwitch>` оборачивает контент. Управляется URL-параметром `?state=`:
- `?state=data` (или без параметра) → дети (нормальный контент)
- `?state=loading` → скелетон (`skeleton="table"|"list"|"detail"|"dashboard"`)
- `?state=empty` → `<EmptyState title=emptyTitle description=emptyDescription action=emptyAction/>`
- `?state=error` → `<ErrorState/>`

→ **Любая** целевая страница ОБЯЗАНА оборачиваться в `<StateSwitch>` (как /cases),
  иначе 4 состояния не снять. Подключить ДО скриншотов.
- detail → `skeleton="detail"`; список → `skeleton="table"`; нестандартная (ai/settings) → `skeleton="list"` или `"detail"` по компоновке.
- если состояния делегируются табу — `delegateToTabParam`.

---

## 6. Примитивы состояний (НЕ редактировать, юзать как есть)

- **EmptyState** `{icon?, title, description?, action?}` — центрированный блок `px-6 py-20`, иконка в `size-16 rounded-2xl`, `<Inbox/>` по умолчанию.
- **ErrorState** `{title?, description?, onRetry?}` — то же, иконка `<AlertCircle/>` в риск-критическом тоне.
- **Skeletons**: `TableSkeleton({rows,cols})`, `ListSkeleton({rows})`, `DetailSkeleton()`, `CardSkeleton()` — все на `<Skeleton/>` из ui, паддинг `p-6`, `space-y-3/6`.

---

## Токены и правила (из CLAUDE.md — соблюдать)
- Только семантические токены: `bg-background bg-card text-foreground text-muted-foreground bg-primary border-border`. НЕ `bg-white`/`bg-zinc-*`/хардкод.
  (Исключение, уже в эталоне: `bg-foreground/[0.03]` + `dark:bg-white/[0.03]` для мягких подложек, `text-red-400` в bulk-actions — копировать как есть, не изобретать новое.)
- Иконки только `lucide-react`, `size-4` по умолчанию (`size-3.5` в плотных местах).
- `components/ui/*` не редактируем — кастом через `className`.
- Один primary CTA на экран; microcopy = глагол + объект.
- Никаких inline-стилей (искл. `style={{gridTemplateColumns}}` для динамических колонок — есть в эталоне).

## Сомнительные места эталона (НЕ трогал, фиксирую)
- `case-detail.tsx:89` — «Обновлено» показывает `cs.openedAt` (то же, что «Создано») — вероятно баг данных, но это эталон.
- Секция «Хронология» использует `p-6`, остальные секции `p-5` — лёгкий рассинхрон паддинга секций внутри одного таба.
- Block в light-теме имеет `border-transparent` (border только в dark), тогда как секции-карточки всегда `border-border` — пассапорт и секции в light-теме имеют разную видимость рамки.
- Хардкод дат/текста в Хронологии и комментариях (не из mock) — демо-заглушки.
