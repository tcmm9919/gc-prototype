# CLAUDE.md

Инструкции для Claude Code при работе с этим репозиторием.

## Project Overview

**GC Project** — прототипный воркспейс для **Freedom AI Compliance (GCP — Globerce Compliance Platform)**, внутренней AML/KYC-платформы Freedom Bank Kazakhstan. Сетап заточен под быстрое прокликивание экранов, состояний, моушена и интеракций. Не production-кодбаза.

Пользователь — дизайнер, не разработчик. Все технические решения принимаются за него, кроме случаев, где затрагивается визуал/UX/контент.

## Архитектурные правила (строго)

> ⚠️ **GitHub ownership**: репозиторий **GC Project всегда принадлежит аккаунту `tcmm9919`**. Любые операции `gh repo create / fork / transfer` для этого проекта — **только** под учёткой `tcmm9919`. Перед операциями всегда проверять `gh auth status` — активный должен быть `tcmm9919`, не `tcmms` или другой.
>
> **Remote**: `origin → https://github.com/tcmm9919/gc-compliance-prototype` (public, hosted via GitHub Pages).

## Документация воркспейса

| Файл | О чём |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Этот файл — стек, команды, конвенции, заметки для Claude |
| [context.md](context.md) | Продуктовый контекст GCP — модули, домен, TODO/стикеры, роли |
| [design.md](design.md) | Designer's Brain — UX-фреймворк (Nielsen, Gestalt, UX laws) + shadcn-подход + applied preset |
| [plan.md](plan.md) | План скаффолда — фазы, route map, primitives, mock-data, открытые решения |
| [next-app/README.md](next-app/README.md) | Boilerplate Next.js — как добавлять shadcn-компоненты |

## Структура

```
GC Project/
├── CLAUDE.md         # этот файл
├── context.md        # рабочий контекст, decisions, todo
├── design.md         # UX-фреймворк + shadcn-философия (Designer's Brain)
└── next-app/         # сам прототип (Next.js + shadcn)
    ├── app/          # экраны (file-based routing)
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css   # CSS-переменные темы (OKLCH)
    ├── components/
    │   ├── ui/       # shadcn-компоненты (19 шт.) — не редактируем без нужды
    │   └── theme-provider.tsx
    ├── lib/utils.ts  # cn() helper
    ├── hooks/
    └── components.json
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (`@theme inline`, OKLCH-токены)
- **shadcn/ui** — стиль `radix-mira` (применён через preset `b6AnWmJSSW`)
- **Radix UI** primitives (через shadcn)
- **lucide-react** — иконки
- **next-themes** — тёмная тема
- **framer-motion** — анимации и интеракции
- **react-hook-form + zod** — формы (готовы к использованию, обёртку `<Form />` добавить через `npx shadcn add form` при необходимости)

## Commands

Все команды запускаются из `next-app/`:

```bash
cd next-app
npm run dev         # старт dev-сервера (Turbopack)
npm run build       # production-сборка
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run format      # prettier write
```

Добавить shadcn-компонент: `npx shadcn@latest add <name>` (примеры: `accordion`, `command`, `calendar`, `data-table`, `progress`, `tooltip`, `breadcrumb`).

## Conventions

### Дизайн-решения
- Все UX-решения проходят через линзу [design.md](design.md) — открой при сомнениях
- 4 обязательных состояния каждого экрана: **Empty / Loading / Data / Error** (design.md §D)
- Один primary CTA на экран
- Microcopy = глагол + объект («Add product», не «Submit»)

### Стиль кода
- **Только Tailwind-классы**, никаких inline-стилей
- **Семантические токены**: `bg-background`, `text-foreground`, `bg-primary`, `border-border` — не `bg-white` / `bg-zinc-900`
- **Иконки**: только `lucide-react`, размер `size-4` по умолчанию
- **Компоненты ui/**: не редактируем, кастомизация через `className` или композицию обёрткой
- **Composition over props** — `<Dialog>` + `<DialogTrigger>` + `<DialogContent>`, не один монолитный `<MyDialog open=…/>`

### Тема
- Палитра в `app/globals.css` — `:root` + `.dark`, формат **OKLCH**
- Primary — зелёно-лаймовый (`oklch(0.841 0.238 128.85)`) — это бренд-цвет preset'а
- Радиусы — через `--radius`, варианты `rounded-sm/md/lg/xl/2xl`
- Шрифты: **Inter Variable** (sans), **Manrope Variable** (heading) — через `@fontsource-variable/*` (self-hosted из node_modules, ноль обращений к Google), подключены через `@import` в `app/globals.css`. Переменные `--font-sans` / `--font-heading` заданы в `:root`

### Моушен
- Использовать `framer-motion` для интеракций: `motion.div`, `AnimatePresence`
- 200–300ms — золотой диапазон (design.md §H)
- Уважать `prefers-reduced-motion`

### Файлы и роутинг
- Каждый экран — отдельная папка в `app/`: `app/<screen>/page.tsx`
- Состояния (loading / error / not-found) — соседние файлы: `loading.tsx`, `error.tsx`, `not-found.tsx`
- Общие куски — в `components/<feature>/`

## Notes for Claude

- Перед задачей открой [design.md](design.md) и [context.md](context.md)
- Не пиши свои Modal/Button/Input — всё уже есть в `next-app/components/ui/`
- Если нужного компонента нет — ставь через `npx shadcn add`, не пиши с нуля
- После любого визуала прогоняй чек: empty / loading / data / error
- Пользователь — дизайнер: показывай результат в браузере (запусти dev и убедись), не отчитывайся только typecheck'ом
- Меняешь брендинг — меняешь CSS-переменные в `globals.css`, а не в каждом компоненте
