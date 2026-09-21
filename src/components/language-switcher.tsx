"use client";

import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const options: Array<{ id: Locale; label: string }> = [
    { id: "ru", label: "RU" },
    { id: "en", label: "EN" },
  ];

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className="flex rounded-full border border-border p-0.5 text-xs font-medium"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setLocale(option.id)}
          className={cn(
            "rounded-full px-2.5 py-1",
            locale === option.id
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={locale === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
