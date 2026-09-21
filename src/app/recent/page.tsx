"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-banner";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { SearchStatus } from "@/domain/types";
import { useI18n } from "@/components/i18n-provider";

interface RecentItem {
  id: string;
  username: string;
  status: SearchStatus;
  searchedAt: string;
  providerName: string;
}

interface SavedItem {
  username: string;
  createdAt: string;
}

export default function RecentPage() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetch("/api/recent-searches").then((res) => res.json()),
      fetch("/api/saved-searches").then((res) => res.json()),
    ]).then(([recent, savedRes]) => {
      setItems(recent.items ?? []);
      setSaved(savedRes.items ?? []);
      setEmpty((recent.items ?? []).length === 0);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {t.recent.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{t.recent.subtitle}</p>
      </div>
      {saved.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t.recent.saved}</h2>
          <div className="flex flex-wrap gap-2">
            {saved.map((item) => (
              <Link
                key={item.username}
                href={`/search?u=${item.username}`}
                className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/70"
              >
                @{item.username}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {empty ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t.recent.empty}{" "}
          <Link className="underline" href="/search?u=luna.travels">
            luna.travels
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/search?u=${item.username}`} className="font-medium hover:underline">
                  @{item.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(item.searchedAt, locale)} · {item.providerName}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
