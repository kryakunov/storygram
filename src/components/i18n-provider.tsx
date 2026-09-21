"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_EVENT = "app-locale-change";

function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

function readStoredLocale(): Locale {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=(ru|en)`));
  if (isLocale(match?.[1])) return match[1];
  return DEFAULT_LOCALE;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  return () => window.removeEventListener(LOCALE_EVENT, onStoreChange);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readStoredLocale, () => DEFAULT_LOCALE);

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
