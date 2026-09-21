"use client";

import type { SearchStatus } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

const badgeVariant: Record<
  SearchStatus,
  "success" | "warning" | "danger" | "muted" | "default"
> = {
  success: "success",
  no_stories: "warning",
  not_found: "muted",
  private_profile: "danger",
  provider_unavailable: "danger",
  invalid_username: "warning",
  rate_limited: "warning",
};

export function StatusBadge({ status }: { status: SearchStatus }) {
  const { t } = useI18n();
  return <Badge variant={badgeVariant[status]}>{t.status[status].label}</Badge>;
}

export function StatusBanner({ status }: { status: SearchStatus }) {
  const { t } = useI18n();
  const copy = t.status[status];
  const tone =
    status === "success"
      ? "border-emerald-500/30 bg-emerald-500/8"
      : status === "no_stories"
        ? "border-amber-500/30 bg-amber-500/8"
        : "border-destructive/30 bg-destructive/8";
  return (
    <div className={cn("rounded-2xl border p-4", tone)}>
      <p className="font-medium">{copy.title}</p>
      <p className="text-sm text-muted-foreground">{copy.description}</p>
    </div>
  );
}
