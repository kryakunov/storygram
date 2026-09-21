"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/i18n-provider";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  return (
    <Card className="border-amber-500/30 bg-amber-500/8">
      <CardContent className={compact ? "flex gap-3 p-4" : "flex gap-3 p-5"}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">{t.disclaimer.title}</p>
          <p className="text-muted-foreground">{t.disclaimer.body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
