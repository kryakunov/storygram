"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/components/i18n-provider";

export default function PricingPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
        {t.pricing.title}
      </h1>
      <p className="text-muted-foreground">{t.pricing.intro}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.pricing.publicTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t.pricing.publicSoon}</p>
            <p>{t.pricing.publicNote}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.pricing.teamsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t.pricing.teamsSoon}</p>
            <p>{t.pricing.teamsNote}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
