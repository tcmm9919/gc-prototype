"use client";

import * as React from "react";
import { Check, Circle, Clock, Download, FileText, Play, X } from "lucide-react";
import { motion } from "framer-motion";
import { Block } from "@/components/ext/block";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedProgress } from "@/components/ext/animated-progress";
import { cn } from "@/lib/utils";

interface ReportSection {
  num: number;
  title: string;
  body: React.ReactNode;
}

const REPORT_SECTIONS: ReportSection[] = [
  {
    num: 1,
    title: "Краткая сводка",
    body: (
      <p>
        <strong>Risk Score: 75/100.</strong> Клиент имеет обширный позитивный медиа-профиль как эксперт по цифровизации
        и финтеху. Ключевой риск связан с вовлечённостью в уголовное дело о незаконной выдаче ИИН гражданам России через
        аффилированные сервисы. Также присутствуют негативные отзывы сотрудников о практике управления.
      </p>
    ),
  },
  {
    num: 2,
    title: "Идентификация субъекта",
    body: (
      <ul className="space-y-0.5">
        <li><strong>ФИО:</strong> подтверждено в реестре</li>
        <li><strong>ИИН:</strong> предоставлен</li>
        <li><strong>Дата рождения:</strong> подтверждена</li>
        <li><strong>Юрисдикция:</strong> Казахстан</li>
        <li><strong>Роли:</strong> Директор и сооснователь IT-холдинга; основатель благотворительного фонда; советник правления банка</li>
        <li><strong>Альтернативное написание:</strong> Латиница из официальных реестров</li>
      </ul>
    ),
  },
  {
    num: 3,
    title: "Корпоративная структура",
    body: (
      <ul className="space-y-0.5">
        <li><strong>Основная компания:</strong> ЧАСТНАЯ КОМПАНИЯ. БИН зарегистрирован 26.02.2021</li>
        <li><strong>ОКЭД:</strong> 64200 «Деятельность холдинговых компаний»</li>
        <li><strong>Юр. адрес:</strong> г. Астана</li>
        <li><strong>Бенефициарный владелец:</strong> сам клиент</li>
        <li><strong>Аффилированные структуры:</strong> IT-услуги Freedom Bank, проекты в KZ/KG/UZ/RU/DE/UA/AE</li>
      </ul>
    ),
  },
  {
    num: 4,
    title: "Бизнес-активность",
    body: (
      <ul className="space-y-0.5">
        <li><strong>Отрасль:</strong> ИТ, финтех, цифровизация финуслуг, e-commerce</li>
        <li><strong>Продукты:</strong> кредитные конвейеры, скоринг, цифровая ипотека, AI Compliance</li>
        <li><strong>Партнёры:</strong> Freedom Bank, Halyk Bank, Kcell, Hamkorbank, Sky Bank и др.</li>
        <li><strong>Финансы:</strong> налоги уплачены, задолженностей нет</li>
        <li><strong>Масштаб:</strong> ~350 разработчиков, 130+ крупных проектов</li>
      </ul>
    ),
  },
  {
    num: 5,
    title: "Регуляторная и судебная история",
    body: (
      <div className="rounded-md border border-risk-medium/40 bg-risk-medium/5 p-3 space-y-1 text-xs">
        <p><strong>Дело:</strong> Уголовное дело о незаконной выдаче ИИН</p>
        <p><strong>Источник:</strong> КазТАГ, 09.04.2025</p>
        <p><strong>Статус:</strong> возбуждено, ведётся расследование</p>
        <p>МВД РК подтвердило факт аннулирования незаконно выданных ИИН.</p>
      </div>
    ),
  },
  {
    num: 6,
    title: "Медиа-обзор",
    body: (
      <ul className="space-y-1 text-xs">
        <li>• Forbes Kazakhstan — позитивная (экспертная)</li>
        <li>• Tatler Asia — позитивная</li>
        <li>• Bluescreen — позитивная</li>
        <li>• Manshuq — позитивная</li>
      </ul>
    ),
  },
  {
    num: 7,
    title: "Негативные медиа",
    body: (
      <div className="space-y-2 text-xs">
        <div className="rounded-md border border-risk-critical/40 bg-risk-critical/5 p-2">
          <p className="font-semibold">КазТАГ, 09.04.2025</p>
          <p>Возбуждение уголовного дела о незаконной выдаче ИИН через сервисы processiin.info и process.pronumber.net.</p>
        </div>
        <div className="rounded-md border border-risk-medium/40 bg-risk-medium/5 p-2">
          <p className="font-semibold">2ГИС — отзывы сотрудников</p>
          <p>Жалобы на стиль управления, переработки, текучку кадров.</p>
        </div>
      </div>
    ),
  },
  {
    num: 8,
    title: "Санкции и списки наблюдения",
    body: (
      <p className="text-xs">
        Проверка основана на открытых медиа-источниках. Прямой доступ к OFAC, EU, UN не осуществлялся. Информация о
        включении в санкционные списки не найдена.
      </p>
    ),
  },
  {
    num: 9,
    title: "Цифровой след",
    body: (
      <ul className="space-y-0.5 text-xs">
        <li>• Официальный сайт компании</li>
        <li>• Профиль автора Forbes Kazakhstan</li>
        <li>• Соцсети компании (Instagram)</li>
        <li>• 2ГИС-профиль</li>
        <li>• Видео-выступления (Rutube)</li>
        <li className="text-muted-foreground">Оценка: Medium</li>
      </ul>
    ),
  },
  {
    num: 10,
    title: "Оценка рисков",
    body: (
      <div className="space-y-2 text-xs">
        <div>
          <p className="font-semibold text-risk-low">Положительные находки:</p>
          <ul className="pl-4 space-y-0.5">
            <li>• Признанный эксперт в финтехе</li>
            <li>• Социально значимый благотворительный фонд</li>
            <li>• Активное позитивное освещение в авторитетных изданиях</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-risk-critical">Красные флаги:</p>
          <ul className="pl-4 space-y-0.5">
            <li>• Фигурант уголовного дела</li>
            <li>• Связи с проблемным банком</li>
            <li>• Негативные отзывы сотрудников</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Рекомендация:</p>
          <p>Присвоить высокий уровень риска. Любые транзакции требуют усиленной проверки (Enhanced Due Diligence).</p>
        </div>
      </div>
    ),
  },
];

type StepStatus = "requested" | "received" | "verified" | "rejected" | "pending";

interface Step {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  hint?: string;
}

const STEPS: Step[] = [
  { id: "1", title: "Удостоверение личности", description: "Скан паспорта / удостоверения", status: "verified", hint: "Загружено 12.04.2026 · подтверждено офицером" },
  { id: "2", title: "Подтверждение адреса", description: "Справка с места жительства, не старше 3 мес.", status: "verified", hint: "ЦОН, 15.04.2026" },
  { id: "3", title: "Источник средств", description: "Справка о доходах за последние 12 месяцев", status: "received", hint: "Получено, ожидает проверки" },
  { id: "4", title: "Бенефициарные владельцы", description: "Структура собственности (для юр. лиц)", status: "requested", hint: "Запрошено 02.05.2026, ответ ожидается до 09.05" },
  { id: "5", title: "Цель отношений", description: "Опросник по цели открытия счёта", status: "pending" },
  { id: "6", title: "Дополнительные документы", description: "По запросу комплаенс-офицера", status: "rejected", hint: "Отклонено: документ не читается" },
];

const STATUS_META: Record<StepStatus, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string; ring: string }> = {
  pending: { label: "Не запрошено", icon: Circle, tone: "text-muted-foreground", ring: "ring-border" },
  requested: { label: "Запрошено", icon: Clock, tone: "text-risk-medium", ring: "ring-risk-medium/30" },
  received: { label: "Получено", icon: Clock, tone: "text-primary", ring: "ring-primary/30" },
  verified: { label: "Подтверждено", icon: Check, tone: "text-risk-low", ring: "ring-risk-low/30" },
  rejected: { label: "Отклонено", icon: X, tone: "text-risk-critical", ring: "ring-risk-critical/30" },
};

export function ClientEDD() {
  const done = STEPS.filter((s) => s.status === "verified").length;
  const progress = (done / STEPS.length) * 100;

  return (
    <div className="flex flex-col gap-4 px-6 pb-6">
      <Block
        title="Расширенная проверка (EDD)"
        actions={
          <>
            <Button size="sm" variant="outline">Поднять риск</Button>
            <Button size="sm">Отправить в кейс</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground -mt-2 mb-3">{done} из {STEPS.length} шагов подтверждены</p>
        <AnimatedProgress value={progress} className="h-2" />
      </Block>

      <div className="relative pl-6">
        <div className="pointer-events-none absolute left-[1.4rem] top-3 bottom-3 w-px bg-border" aria-hidden />
        <ol className="space-y-2">
          {STEPS.map((step, idx) => {
            const meta = STATUS_META[step.status];
            const Icon = meta.icon;
            return (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22, ease: "easeOut" }}
              >
                <div className="ml-2 rounded-xl bg-white dark:bg-white/[0.04] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "relative -ml-9 mt-0.5 size-7 shrink-0 rounded-full bg-background ring-2 flex items-center justify-center",
                        meta.tone,
                        meta.ring,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{step.title}</span>
                        <span className={cn("text-xs font-medium", meta.tone)}>{meta.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.hint ? <p className="text-xs text-muted-foreground/80 mt-1">{step.hint}</p> : null}
                    </div>
                    <Button variant="ghost" size="sm" className="shrink-0">Открыть</Button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>

      <Block title="Комментарий офицера">
        <p className="text-xs text-muted-foreground -mt-2 mb-3">Контекст, который увидят коллеги при дальнейшем разборе</p>
        <Textarea rows={3} placeholder="Добавьте контекст о проверке клиента..." />
        <div className="flex justify-end mt-3">
          <Button size="sm">Сохранить</Button>
        </div>
      </Block>

      {/* Enhanced Due Diligence — 10-section structured report */}
      <Block
        title={
          <span className="inline-flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Enhanced Due Diligence
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <Play className="size-3.5" />
              Запустить EDD
            </Button>
            <Button size="sm">
              <Download className="size-3.5" />
              Скачать PDF
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground -mt-2 mb-4">10-секционный отчёт, сгенерирован EDD-агентом</p>
        <div className="space-y-4">
          {REPORT_SECTIONS.map((s) => (
            <section key={s.num} className="space-y-1">
              <h4 className="text-sm font-semibold inline-flex items-baseline gap-2">
                <span className="text-muted-foreground tabular-nums">{s.num}.</span>
                {s.title}
              </h4>
              <div className="text-sm text-muted-foreground pl-5 [&_strong]:text-foreground">
                {s.body}
              </div>
            </section>
          ))}
          <p className="border-t border-foreground/[0.06] dark:border-white/[0.06] pt-3 mt-4 text-xs text-muted-foreground">
            Дисклеймер: Отчёт на основе открытых источников. Не является юридической консультацией.
          </p>
        </div>
      </Block>
    </div>
  );
}
