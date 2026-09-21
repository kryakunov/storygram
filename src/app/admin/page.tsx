"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { translateDemo } from "@/i18n";

interface AdminSnapshot {
  appEnv: string;
  nodeEnv: string;
  provider: {
    selected: string;
    registered: string[];
    health: { name: string; ok: boolean; message: string; checkedAt: string };
  };
  cache: { backend: string; keys: number | null };
  database: { ok: boolean };
  rateLimit: { max: number; windowMs: number };
  demoUsernames: Array<{ username: string; scenario: string; notes: string }>;
  fetchLogs: Array<{
    id: string;
    username: string;
    resultStatus: string;
    durationMs: number;
    createdAt: string;
  }>;
}

export default function AdminPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<AdminSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/status")
      .then(async (res) => {
        if (!res.ok) throw new Error(t.admin.unavailable);
        return res.json();
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [t.admin.unavailable]);

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }
  if (!data) {
    return <p className="text-muted-foreground">{t.admin.loading}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {t.admin.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{t.admin.subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.environment}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>APP_ENV: {data.appEnv}</p>
            <p>NODE_ENV: {data.nodeEnv}</p>
            <p>
              {t.admin.database}:{" "}
              <Badge variant={data.database.ok ? "success" : "danger"}>
                {data.database.ok ? t.admin.reachable : t.admin.unavailableDb}
              </Badge>
            </p>
            <p>
              {t.admin.cache}: {data.cache.backend}
              {data.cache.keys !== null ? ` · ${data.cache.keys} ${t.admin.keys}` : ""}
            </p>
            <p>
              {t.admin.rateLimit}: {data.rateLimit.max} / {data.rateLimit.windowMs}ms
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.provider}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {t.admin.selected}: {data.provider.selected}
            </p>
            <p>
              {t.admin.registered}: {data.provider.registered.join(", ")}
            </p>
            <p>
              {t.admin.health}:{" "}
              <Badge variant={data.provider.health.ok ? "success" : "danger"}>
                {data.provider.health.ok ? t.admin.ok : t.admin.down}
              </Badge>
            </p>
            <p>{data.provider.health.message}</p>
            <p className="text-muted-foreground">
              {t.admin.checked} {formatDateTime(data.provider.health.checkedAt, locale)}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.demoUsernames}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {data.demoUsernames.map((item) => (
            <Link
              key={item.username}
              href={`/search?u=${item.username}`}
              className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm hover:bg-muted/70"
            >
              <span>
                @{item.username} — {translateDemo(t, "notes", item.username, item.notes)}
              </span>
              <Badge variant="muted">
                {t.scenario[item.scenario as keyof typeof t.scenario] ?? item.scenario}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.fetchLogs}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data.fetchLogs.length === 0 ? (
            <p className="text-muted-foreground">{t.admin.noLogs}</p>
          ) : (
            data.fetchLogs.map((log) => (
              <div key={log.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-muted px-3 py-2">
                <span>
                  @{log.username} · {log.resultStatus} · {log.durationMs}ms
                </span>
                <span className="text-muted-foreground">
                  {formatDateTime(log.createdAt, locale)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
