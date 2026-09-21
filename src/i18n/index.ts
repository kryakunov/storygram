import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { en } from "@/i18n/en";
import { ru, type Dictionary } from "@/i18n/ru";

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function translateDemo(
  dictionary: Dictionary,
  kind: "notes" | "bios" | "captions",
  key: string,
  fallback?: string | null,
): string {
  const table = dictionary.demo[kind] as Record<string, string>;
  return table[key] ?? fallback ?? key;
}

export type { Dictionary };
export type { Locale };
