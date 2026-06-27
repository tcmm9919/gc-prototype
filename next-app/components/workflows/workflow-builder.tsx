"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, GripVertical, Plus, Save, Search, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useMockData, type WorkflowStep, type ScenarioType } from "@/lib/mock"
import {
  ACTIVITY_BY_TYPE,
  ACTIVITIES_BY_SCENARIO,
  WORKFLOW_ACTIVITIES,
  type WorkflowActivityMeta,
  type WorkflowActivityType,
} from "@/lib/mock/seeds/workflow-activities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

function makeStep(type: WorkflowActivityType): WorkflowStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    config: {},
  }
}

export function WorkflowBuilder() {
  const router = useRouter()
  const params = useSearchParams()
  const editId = params.get("id")
  const data = useMockData()
  const existing = editId ? data.scenarios.find((s) => s.id === editId) : undefined

  const type = (existing?.type ?? params.get("type") ?? "client") as ScenarioType

  const [name, setName] = React.useState(existing?.name ?? "Новый сценарий")
  const [steps, setSteps] = React.useState<WorkflowStep[]>(existing?.pipeline ?? [])
  const [selectedStepId, setSelectedStepId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [saveOpen, setSaveOpen] = React.useState(false)
  // Мобильные bottom-sheet'ы: палитра активностей и настройка шага.
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [configOpen, setConfigOpen] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  // Палитра зависит от типа сценария (клиентский / групповой / встроенный).
  const available = React.useMemo(
    () =>
      (ACTIVITIES_BY_SCENARIO[type] ?? WORKFLOW_ACTIVITIES.map((a) => a.type))
        .map((t) => ACTIVITY_BY_TYPE[t])
        .filter(Boolean),
    [type]
  )
  const filteredActivities = React.useMemo(
    () =>
      available.filter((a) =>
        search ? a.name.toLowerCase().includes(search.toLowerCase()) : true
      ),
    [available, search]
  )

  const addStep = (t: WorkflowActivityType) => {
    const step = makeStep(t)
    setSteps((s) => [...s, step])
    setSelectedStepId(step.id)
    setPaletteOpen(false) // мобила: закрыть лист, шаг появился в пайплайне
  }

  const removeStep = (id: string) => {
    setSteps((s) => s.filter((x) => x.id !== id))
    if (selectedStepId === id) setSelectedStepId(null)
  }

  // Перемещение шага вверх/вниз (мобильная альтернатива drag-and-drop).
  const moveStep = (id: string, dir: -1 | 1) => {
    setSteps((items) => {
      const i = items.findIndex((x) => x.id === id)
      const j = i + dir
      if (i === -1 || j < 0 || j >= items.length) return items
      return arrayMove(items, i, j)
    })
  }

  // Тап по шагу на мобиле — открыть настройку листом.
  const openConfig = (id: string) => {
    setSelectedStepId(id)
    setConfigOpen(true)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSteps((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return items
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  const selectedStep = steps.find((s) => s.id === selectedStepId)
  const selectedMeta = selectedStep
    ? ACTIVITY_BY_TYPE[selectedStep.type as WorkflowActivityType]
    : null

  const updateConfig = (key: string, value: string | boolean) => {
    if (!selectedStep) return
    setSteps((all) =>
      all.map((s) =>
        s.id === selectedStep.id ? { ...s, config: { ...s.config, [key]: value } } : s
      )
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 pt-4">
      {/* ── Десктоп: 3 колонки ── */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="hidden min-h-0 flex-1 gap-4 md:grid md:grid-cols-12">
          {/* Палитра */}
          <Card className="col-span-3 flex min-h-0 flex-col overflow-hidden border-border py-0 gap-0">
            <div className="shrink-0 space-y-2 border-b border-border p-4">
              <h3 className="text-sm font-semibold">Доступные активности</h3>
              <PaletteSearch search={search} setSearch={setSearch} />
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
              {filteredActivities.map((a) => (
                <PaletteButton key={a.type} activity={a} onPick={() => addStep(a.type)} />
              ))}
            </div>
          </Card>

          {/* Пайплайн */}
          <Card className="col-span-6 flex min-h-0 flex-col overflow-hidden border-border py-0 gap-0">
            <div className="shrink-0 border-b border-border p-4">
              <h3 className="text-sm font-semibold">
                Пайплайн <span className="ml-1 text-muted-foreground">({steps.length} шагов)</span>
              </h3>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
              {steps.length === 0 ? (
                <EmptyPipeline />
              ) : (
                <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {steps.map((step, idx) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      index={idx}
                      selected={selectedStepId === step.id}
                      onSelect={() => setSelectedStepId(step.id)}
                      onRemove={() => removeStep(step.id)}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </Card>

          {/* Конфигурация */}
          <Card className="col-span-3 flex min-h-0 flex-col overflow-hidden border-border py-0 gap-0">
            <div className="shrink-0 border-b border-border p-4">
              <h3 className="text-sm font-semibold">Конфигурация</h3>
            </div>
            <CardContent className="min-h-0 flex-1 overflow-y-auto p-4">
              {selectedStep && selectedMeta ? (
                <StepConfig step={selectedStep} meta={selectedMeta} updateConfig={updateConfig} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Выберите шаг для настройки
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <DragOverlay />
      </DndContext>

      {/* ── Мобила: пайплайн-холст + bottom-sheet'ы ── */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 md:hidden">
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-border py-0 gap-0">
          <div className="shrink-0 border-b border-border p-4">
            <h3 className="text-sm font-semibold">
              Пайплайн <span className="ml-1 text-muted-foreground">({steps.length} шагов)</span>
            </h3>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
            {steps.length === 0 ? (
              <EmptyPipeline mobile />
            ) : (
              steps.map((step, idx) => (
                <MobileStep
                  key={step.id}
                  step={step}
                  index={idx}
                  total={steps.length}
                  onSelect={() => openConfig(step.id)}
                  onRemove={() => removeStep(step.id)}
                  onMove={(dir) => moveStep(step.id, dir)}
                />
              ))
            )}
          </div>
          <div className="shrink-0 border-t border-border p-3">
            <Button className="w-full" onClick={() => setPaletteOpen(true)}>
              <Plus className="size-4" />
              Добавить шаг
            </Button>
          </div>
        </Card>
      </div>

      {/* Нижняя фиксированная панель действий */}
      <div className="shrink-0 -mx-4 sm:-mx-8 flex items-center justify-end gap-2 border-t border-border bg-card px-4 sm:px-8 py-3">
        <Button variant="outline" asChild>
          <Link href="/workflows">Отмена</Link>
        </Button>
        <Button onClick={() => setSaveOpen(true)}>
          <Save className="size-4" />
          Сохранить
        </Button>
      </div>

      {/* Мобила: лист с активностями */}
      <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
        <SheetContent side="bottom" className="flex max-h-[80vh] flex-col gap-0 p-0">
          <SheetHeader className="shrink-0 border-b border-border p-4">
            <SheetTitle>Добавить шаг</SheetTitle>
            <PaletteSearch search={search} setSearch={setSearch} />
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
            {filteredActivities.map((a) => (
              <PaletteButton key={a.type} activity={a} withDescription onPick={() => addStep(a.type)} />
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Мобила: лист с настройкой шага */}
      <Sheet open={configOpen} onOpenChange={setConfigOpen}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 p-0">
          <SheetHeader className="shrink-0 border-b border-border p-4">
            <SheetTitle>{selectedMeta?.name ?? "Настройка шага"}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {selectedStep && selectedMeta ? (
              <StepConfig step={selectedStep} meta={selectedMeta} updateConfig={updateConfig} hideName />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сохранить сценарий</DialogTitle>
            <DialogDescription>Укажите название сценария перед сохранением.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Название</Label>
            <Input id="scenario-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => router.push("/workflows")}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─────────────────────────────────────────── shared bits ──

function PaletteSearch({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
    </div>
  )
}

function PaletteButton({
  activity,
  onPick,
  withDescription,
}: {
  activity: WorkflowActivityMeta
  onPick: () => void
  withDescription?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-start justify-between gap-2 rounded-md border border-border/60 px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-muted/40"
    >
      <span className="min-w-0">
        <span className="block">{activity.name}</span>
        {withDescription ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{activity.description}</span>
        ) : null}
      </span>
      <Plus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

function EmptyPipeline({ mobile }: { mobile?: boolean }) {
  return (
    <div className="rounded-md border border-dashed border-border px-3 py-12 text-center text-sm text-muted-foreground">
      {mobile
        ? "Пайплайн пуст — нажмите «Добавить шаг»."
        : "Перетащите активности из палитры слева или кликните по ним, чтобы добавить шаг."}
    </div>
  )
}

function StepConfig({
  step,
  meta,
  updateConfig,
  hideName,
}: {
  step: WorkflowStep
  meta: WorkflowActivityMeta
  updateConfig: (key: string, value: string | boolean) => void
  hideName?: boolean
}) {
  return (
    <div className="space-y-3">
      <div>
        {!hideName ? <p className="text-sm font-semibold">{meta.name}</p> : null}
        <p className={cn("text-xs text-muted-foreground", !hideName && "mt-1")}>{meta.description}</p>
      </div>
      <div className="space-y-3">
        {meta.configFields.length === 0 ? (
          <p className="text-xs text-muted-foreground">У этого шага нет параметров.</p>
        ) : (
          meta.configFields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              {f.type === "text" ? (
                <Input
                  value={(step.config[f.key] as string | undefined) ?? f.default ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => updateConfig(f.key, e.target.value)}
                />
              ) : null}
              {f.type === "select" ? (
                <Select
                  value={(step.config[f.key] as string | undefined) ?? f.default ?? ""}
                  onValueChange={(v) => updateConfig(f.key, v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите..." />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {f.type === "boolean" ? (
                <Switch
                  size="sm"
                  checked={Boolean(step.config[f.key] ?? f.default)}
                  onCheckedChange={(v) => updateConfig(f.key, v)}
                />
              ) : null}
              {f.hint ? (
                <p className="text-[10px] leading-snug text-muted-foreground">{f.hint}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────── desktop drag step ──

function SortableStep({
  step,
  index,
  selected,
  onSelect,
  onRemove,
}: {
  step: WorkflowStep
  index: number
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  })
  const meta = ACTIVITY_BY_TYPE[step.type as WorkflowActivityType]
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background px-3 py-2 transition",
        selected ? "border-primary ring-1 ring-primary/20" : "border-border/60"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Переместить"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">{index + 1}.</span>
      <button type="button" onClick={onSelect} className="flex-1 text-left text-sm hover:underline">
        {meta?.name ?? step.type}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground transition hover:text-destructive"
        aria-label="Удалить шаг"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────── mobile step (arrows) ──

function MobileStep({
  step,
  index,
  total,
  onSelect,
  onRemove,
  onMove,
}: {
  step: WorkflowStep
  index: number
  total: number
  onSelect: () => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const meta = ACTIVITY_BY_TYPE[step.type as WorkflowActivityType]
  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 bg-background pl-3">
      <span className="font-mono text-xs text-muted-foreground tabular-nums">{index + 1}.</span>
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate py-3 text-left text-sm">
        {meta?.name ?? step.type}
      </button>
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={index === 0}
        aria-label="Вверх"
        className="flex size-10 items-center justify-center text-muted-foreground disabled:opacity-25"
      >
        <ChevronUp className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        aria-label="Вниз"
        className="flex size-10 items-center justify-center text-muted-foreground disabled:opacity-25"
      >
        <ChevronDown className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Удалить шаг"
        className="flex size-10 items-center justify-center text-muted-foreground transition hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
