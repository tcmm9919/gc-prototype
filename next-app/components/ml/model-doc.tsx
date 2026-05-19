import { Database, FileText, GitBranch, Layers } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ext/status-badge";

interface Section {
  title: string;
  content: React.ReactNode;
}

interface ModelDocProps {
  title: string;
  description: string;
  status: "production" | "experimental" | "deprecated";
  owner: string;
  stack: string[];
  sections: Section[];
}

const STATUS_LABEL = {
  production: "В продакшене",
  experimental: "Экспериментальная",
  deprecated: "Устарела",
} as const;

const STATUS_TONE = {
  production: "success",
  experimental: "warning",
  deprecated: "muted",
} as const;

export function ModelDoc({ title, description, status, owner, stack, sections }: ModelDocProps) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<StatusBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</StatusBadge>}
      />
      <div className="grid gap-4 p-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          {sections.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed prose-zinc">
                {s.content}
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="size-4" />
                Метаданные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Field label="Владелец" value={owner} />
              <Field label="Стек">
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {stack.map((s) => (
                    <StatusBadge key={s} tone="muted">{s}</StatusBadge>
                  ))}
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitBranch className="size-4" />
                Связано
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Database className="size-3.5 text-muted-foreground" />
                <span>Bank Offline FS</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground" />
                <span>Сценарии: 4 использования</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="text-xs text-muted-foreground space-y-1 pt-4">
              <p>Раздел = knowledge base без UI запуска/мониторинга (стикер 6).</p>
              <p>Если потребуется ML-Ops функциональность — расширяем отдельной фазой.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {value !== undefined ? <span className="font-medium">{value}</span> : children}
    </div>
  );
}
