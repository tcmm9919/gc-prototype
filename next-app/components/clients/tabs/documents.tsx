"use client";

import { FileText, FileImage, FileSpreadsheet, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Block } from "@/components/ext/block";

interface Doc {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  type: "pdf" | "image" | "spreadsheet";
}

const DOCS: Doc[] = [
  { id: "D1", name: "Паспорт_2024.pdf", category: "Удостоверение", size: "1.2 MB", uploadedAt: "12.04.2026", uploadedBy: "Жумабеков Е.К.", type: "pdf" },
  { id: "D2", name: "Справка_о_доходах_2025.pdf", category: "Доход", size: "340 KB", uploadedAt: "28.04.2026", uploadedBy: "Клиент (mobile)", type: "pdf" },
  { id: "D3", name: "Договор_аренды_001.pdf", category: "Доход", size: "780 KB", uploadedAt: "29.04.2026", uploadedBy: "Клиент (mobile)", type: "pdf" },
  { id: "D4", name: "Селфи_верификация.jpg", category: "KYC", size: "2.1 MB", uploadedAt: "12.04.2026", uploadedBy: "Клиент (mobile)", type: "image" },
  { id: "D5", name: "Структура_собственности.xlsx", category: "Юр. документы", size: "45 KB", uploadedAt: "01.05.2026", uploadedBy: "Касенов Т.А.", type: "spreadsheet" },
];

const ICON: Record<Doc["type"], React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: FileImage,
  spreadsheet: FileSpreadsheet,
};

const COLOR: Record<Doc["type"], string> = {
  pdf: "bg-risk-critical/15 text-risk-critical",
  image: "bg-primary/15 text-primary",
  spreadsheet: "bg-risk-low/15 text-risk-low",
};

export function ClientDocuments() {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <Block
        className="border border-border"
        title="Документы клиента"
        actions={
          <Button size="sm" variant="outline">
            <Upload className="size-3.5" />
            Загрузить
          </Button>
        }
      >
        <div className="grid gap-2 md:grid-cols-2">
          {DOCS.map((d) => {
            const Icon = ICON[d.type];
            return (
              <div
                key={d.id}
                className="flex items-start gap-3 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.03] px-3 py-2.5 hover:bg-foreground/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <div className={`size-10 shrink-0 rounded-lg flex items-center justify-center ${COLOR[d.type]}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm truncate">{d.name}</span>
                    <Button variant="ghost" size="icon" className="size-7 -mt-1 -mr-1" aria-label="Скачать">
                      <Download className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.category} · {d.size}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.uploadedAt} · {d.uploadedBy}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Block>
    </div>
  );
}
