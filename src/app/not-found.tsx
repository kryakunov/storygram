"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.errors.notFound}</h1>
      <p className="text-muted-foreground">{t.errors.notFoundBody}</p>
      <Link href="/" className="underline">
        {t.errors.backHome}
      </Link>
    </div>
  );
}
