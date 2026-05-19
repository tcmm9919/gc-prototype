import { Sparkles } from "lucide-react";
import { PageHeader } from "./page-header";
import { StateSwitch } from "./state-switch";

interface StubProps {
  title: string;
  description?: string;
  reference?: string;
  actions?: React.ReactNode;
  skeleton?: "table" | "list" | "detail";
  emptyTitle?: string;
  emptyDescription?: string;
  children?: React.ReactNode;
}

export function StubPage({
  title,
  description,
  reference,
  actions,
  skeleton = "table",
  emptyTitle,
  emptyDescription,
  children,
}: StubProps) {
  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <StateSwitch
        skeleton={skeleton}
        emptyTitle={emptyTitle ?? "Здесь пока пусто"}
        emptyDescription={emptyDescription ?? "Данные появятся по мере работы платформы."}
      >
        <div className="px-6 py-6">
          {children ?? (
            <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <Sparkles className="size-4 mt-0.5 text-primary" />
              <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground">Заглушка экрана</span>
                <span>Сценарии переключаются через ⌘K или DevToolbar внизу справа. Состояния — через `?state=` в URL.</span>
                {reference ? <span className="text-xs text-muted-foreground/80">См. {reference}</span> : null}
              </div>
            </div>
          )}
        </div>
      </StateSwitch>
    </>
  );
}
