# GCP — Style Guide (design tokens)

> Источник истины — `next-app/app/globals.css` (`:root` + `.dark`, формат **OKLCH**).
> Этот файл — человекочитаемая выжимка для дизайн-ревью. При расхождении выигрывает `globals.css`.
> Эстетика: **Linear × Airbnb hybrid** — чистые белые поверхности на сером холсте, уверенная крупная типографика, плотные дата-таблицы, hover-lift карточки, Freedom-green как сдержанный акцент.

## Семантические токены (ОБЯЗАТЕЛЬНО)

Только семантические токены через Tailwind-классы. **Никаких** `bg-white` / `bg-zinc-900` / hex / inline-стилей.

| Класс | Назначение |
|---|---|
| `bg-background` | серый холст страницы (таблица-карточка «плавает» над ним) |
| `bg-surface` / `bg-card` | чисто-белые блоки (light), нейтрально-тёмные (dark) |
| `text-foreground` | основной текст (тёплый чёрный) |
| `text-muted-foreground` | вторичный текст |
| `text-subtle-foreground` | третичный/подписи |
| `bg-primary` `text-primary-foreground` | бренд-акцент (Freedom green) |
| `border-border` / `border-hairline` | разделители |
| `bg-sidebar` | белый сайдбар (88px tile) |

## Цвет

### Бренд — Freedom green
| Токен | Light | Dark |
|---|---|---|
| `--primary` | `oklch(0.52 0.14 152)` deep forest | `oklch(0.78 0.20 145)` bright mint |
| `--primary-soft` | `oklch(0.62 0.13 150)` | `oklch(0.82 0.18 145)` |
| `--primary-tint` | `oklch(0.96 0.03 150)` | `oklch(0.30 0.10 145)` |

### Surfaces
| Токен | Light | Dark |
|---|---|---|
| `--background` | `oklch(0.96 0.003 250)` серый холст | `oklch(0.11 0 0)` near-black |
| `--surface` / `--card` | `oklch(1 0 0)` чистый белый | `oklch(0.185 0.004 250)` |
| `--foreground` | `oklch(0.20 0.008 250)` тёплый чёрный | `oklch(0.96 0.005 250)` near-white |
| `--muted-foreground` | `oklch(0.48 0.008 250)` | `oklch(0.62 0.008 250)` |
| `--border` | `oklch(0.91 0.004 250)` | `oklch(1 0 0 / 0.08)` |

### Risk-шкала (НЕ web-2.0 red/yellow/green — органичная)
| Уровень | Light | Назначение |
|---|---|---|
| `--risk-low` | `oklch(0.60 0.10 150)` refined sage | низкий риск |
| `--risk-medium` | `oklch(0.72 0.13 75)` amber | средний |
| `--risk-high` | `oklch(0.65 0.16 35)` coral | высокий |
| `--risk-critical` | `oklch(0.55 0.18 25)` brick | критический |

`--destructive`: `oklch(0.55 0.18 25)` (light) — деструктивные действия.

### Charts
`--chart-1..5` — палитра графиков, ведущая от primary green через teal/amber к coral/brick (см. globals.css).

## Типографика
- Семейство: **Inter Variable** везде (body, headings, IDs/коды, mono) — `--font-sans` = `--font-heading` = `--font-mono`.
- Self-hosted через `@fontsource-variable/*` — ноль обращений к Google Fonts.
- Уверенная крупная display-типографика на главных экранах (Airbnb hero scale), плотный текст в таблицах (Linear).
- Line-height щедрый для body (1.5–1.7).

## Spacing, радиусы, тени
- **Радиус**: `--radius: 0.625rem` (10px) — между Linear и Airbnb. Варианты `rounded-sm/md/lg/xl`.
- **Spacing**: кратность Tailwind (база 4px); плотные таблицы, но щедрый white space на дашборде.
- **Sidebar**: `--sidebar-width: 5.5rem` (88px tile sidebar), белый фон.
- **Тени** (Airbnb-ramp, резче на hover):
  - `--shadow-card` = `--shadow-sm` (покой)
  - `--shadow-card-hover` = `--shadow-lg` (hover-lift карточек)
  - `--shadow-glow` — primary-свечение для акцентных элементов

## Тёмная тема
- Revolut-style: near-black холст `oklch(0.11 0 0)`, нейтрально-серые surfaces, punchier mint primary, alpha-бордеры (`oklch(1 0 0 / 0.08)`).
- Каждое визуальное изменение проверять в обоих темах.
