import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelative(
  iso: string | Date,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = Date.now() - date.getTime();
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (minutes < 1) return getDictionary(locale).relative.justNow;
  if (minutes < 60) return rtf.format(diffMs > 0 ? -minutes : minutes, "minute");
  if (hours < 24) return rtf.format(diffMs > 0 ? -hours : hours, "hour");
  const days = Math.round(abs / 86_400_000);
  return rtf.format(diffMs > 0 ? -days : days, "day");
}

export function formatDateTime(
  iso: string | Date,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
