"use client";

import { useI18n } from "@/components/i18n-provider";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/8 p-8">
      <h1 className="text-2xl font-semibold">{t.errors.somethingWrong}</h1>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
      >
        {t.errors.tryAgain}
      </button>
    </div>
  );
}
