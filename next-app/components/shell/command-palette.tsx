"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_GROUPS } from "./nav-config";
import { SETTINGS_NAV_ITEMS } from "@/components/settings/settings-nav";
import { useMockStore } from "@/lib/mock/store";
import { scenarioLabels, scenarioPresets } from "@/lib/mock/scenarios";
import type { ScenarioPreset } from "@/lib/mock/types";

interface Ctx {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = React.createContext<Ctx | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette outside provider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const setScenario = useMockStore((s) => s.setScenario);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  const go = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const switchScenario = (s: ScenarioPreset) => {
    setScenario(s);
    setIsOpen(false);
  };

  return (
    <CommandPaletteContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Куда перейти, что найти..." />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>
          {NAV_GROUPS.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem key={item.href} value={`${group.label} ${item.label}`} onSelect={() => go(item.href)}>
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
          <CommandGroup heading="Настройки">
            {SETTINGS_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.href} value={`Настройки ${item.label}`} onSelect={() => go(item.href)}>
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Mock-сценарий">
            {(Object.keys(scenarioPresets) as ScenarioPreset[]).map((s) => (
              <CommandItem key={s} value={`scenario ${scenarioLabels[s]}`} onSelect={() => switchScenario(s)}>
                <span>{scenarioLabels[s]}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandPaletteContext.Provider>
  );
}
