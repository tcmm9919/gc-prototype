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
import { GripVertical, Save, Search, Trash2 } from "lucide-react"

import { useMockData, type WorkflowStep } from "@/lib/mock"
import {
  ACTIVITY_BY_TYPE,
  WORKFLOW_ACTIVITIES,
  type WorkflowActivityType,
} from "@/lib/mock/seeds/workflow-activities"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
  const existing = editId
    ? data.scenarios.find((s) => s.id === editId)
    : undefined

  const [name, setName] = React.useState(existing?.name ?? "Новый сценарий")
  const [steps, setSteps] = React.useState<WorkflowStep[]>(
    existing?.pipeline ?? []
  )
  const [selectedStepId, setSelectedStepId] = React.useState<string | null>(
    null
  )
  const [search, setSearch] = React.useState("")
  const [saveOpen, setSaveOpen] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const filteredActivities = React.useMemo(
    () =>
      WORKFLOW_ACTIVITIES.filter((a) =>
        search ? a.name.toLowerCase().includes(search.toLowerCase()) : true
      ),
    [search]
  )

  const addStep = (type: WorkflowActivityType) => {
    const step = makeStep(type)
    setSteps((s) => [...s, step])
    setSelectedStepId(step.id)
  }

  const removeStep = (id: string) => {
    setSteps((s) => s.filter((x) => x.id !== id))
    if (selectedStepId === id) setSelectedStepId(null)
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
        s.id === selectedStep.id
          ? { ...s, config: { ...s.config, [key]: value } }
          : s
      )
    )
  }

  return (
    <div className="space-y-4 pt-7 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/workflows">Сценарии</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {existing ? "Редактирование" : "Новый сценарий"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button onClick={() => setSaveOpen(true)}>
          <Save className="size-4" />
          Сохранить
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid min-h-[500px] grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Палитра */}
          <Card className="col-span-1 overflow-hidden lg:col-span-3">
            <div className="space-y-2 border-b border-border p-4">
              <h3 className="text-sm font-semibold">Доступные активности</h3>
              <div className="relative">
                <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="max-h-[600px] space-y-1 overflow-y-auto p-3">
              {filteredActivities.map((a) => (
                <button
                  key={a.type}
                  type="button"
                  onClick={() => addStep(a.type)}
                  className="flex w-full items-center justify-between rounded-md border border-border/60 px-3 py-2 text-left text-sm transition hover:border-primary/40 hover:bg-muted/40"
                >
                  <span>{a.name}</span>
                  <span className="text-lg leading-none text-muted-foreground">
                    +
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Пайплайн */}
          <Card className="col-span-1 overflow-hidden lg:col-span-6">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-semibold">
                Пайплайн{" "}
                <span className="ml-1 text-muted-foreground">
                  ({steps.length} шагов)
                </span>
              </h3>
            </div>
            <div className="min-h-[400px] space-y-2 p-4">
              {steps.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-12 text-center text-sm text-muted-foreground">
                  Перетащите активности из палитры слева или кликните по ним,
                  чтобы добавить шаг.
                </div>
              ) : (
                <SortableContext
                  items={steps.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
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
          <Card className="col-span-1 overflow-hidden lg:col-span-3">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-semibold">Конфигурация</h3>
            </div>
            <CardContent className="p-4">
              {!selectedStep || !selectedMeta ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Выберите шаг для настройки
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold">{selectedMeta.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedMeta.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {selectedMeta.configFields.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        У этого шага нет параметров.
                      </p>
                    ) : (
                      selectedMeta.configFields.map((f) => (
                        <div key={f.key} className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            {f.label}
                          </label>
                          {f.type === "text" ? (
                            <Input
                              value={
                                (selectedStep.config[f.key] as
                                  | string
                                  | undefined) ??
                                f.default ??
                                ""
                              }
                              placeholder={f.placeholder}
                              onChange={(e) =>
                                updateConfig(f.key, e.target.value)
                              }
                            />
                          ) : null}
                          {f.type === "select" ? (
                            <Select
                              value={
                                (selectedStep.config[f.key] as
                                  | string
                                  | undefined) ??
                                f.default ??
                                ""
                              }
                              onValueChange={(v) => updateConfig(f.key, v)}
                            >
                              <SelectTrigger>
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
                              checked={Boolean(
                                selectedStep.config[f.key] ?? f.default
                              )}
                              onCheckedChange={(v) =>
                                updateConfig(f.key, v)
                              }
                            />
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DragOverlay />
      </DndContext>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сохранить сценарий</DialogTitle>
            <DialogDescription>
              Укажите название сценария перед сохранением.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Название</Label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => router.push("/workflows")}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })
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
      className={`flex items-center gap-2 rounded-md border bg-background px-3 py-2 transition ${
        selected ? "border-primary ring-1 ring-primary/20" : "border-border/60"
      }`}
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
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {index + 1}.
      </span>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left text-sm hover:underline"
      >
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
