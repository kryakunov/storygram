"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { SearchResult } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { ProfileCard } from "@/components/profile-card";
import { SearchForm } from "@/components/search-form";
import { SearchResultsSkeleton } from "@/components/search-skeleton";
import { StatusBanner } from "@/components/status-banner";
import { StoriesGrid } from "@/components/stories-grid";
import { StoryViewer } from "@/components/story-viewer";
import { formatDateTime } from "@/lib/utils";
import { interpolate } from "@/i18n";
import { useI18n } from "@/components/i18n-provider";

export function SearchExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const username = params.get("u") ?? "";
  const [result, setResult] = useState<SearchResult | null>(null);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const queryKey = useMemo(() => username.trim().toLowerCase(), [username]);
  const loading = Boolean(queryKey) && fetchedKey !== queryKey;

  useEffect(() => {
    if (!queryKey) {
      return;
    }
    const controller = new AbortController();
    fetch("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: queryKey }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as SearchResult;
        setResult(data);
        setFetchedKey(queryKey);
        if (!response.ok && data.status !== "no_stories") {
          toast.error(t.status[data.status]?.title ?? t.search.searchFailed);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error(t.search.apiUnreachable);
        setFetchedKey(queryKey);
      });
    return () => controller.abort();
  }, [queryKey, refreshNonce, t]);

  const cacheLabel = {
    hit: t.search.cacheHit,
    miss: t.search.cacheMiss,
    skipped: t.search.cacheSkipped,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {t.search.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t.search.subtitle}</p>
        <SearchForm key={username} initialUsername={username} size="md" />
      </div>
      <DisclaimerBanner compact />

      {!queryKey ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {t.search.emptyPrompt}
        </div>
      ) : loading ? (
        <SearchResultsSkeleton />
      ) : result ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {t.search.lastChecked} {formatDateTime(result.fetchedAt, locale)} ·{" "}
              {t.search.provider} {result.providerName} · {t.search.profileCache}{" "}
              {cacheLabel[result.cache.profile]} · {t.search.storiesCache}{" "}
              {cacheLabel[result.cache.stories]}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFetchedKey(null);
                  setRefreshNonce((value) => value + 1);
                }}
              >
                <RefreshCw className="h-4 w-4" />
                {t.search.refresh}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success(t.search.copied);
                }}
              >
                <Link2 className="h-4 w-4" />
                {t.search.copyLink}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const response = await fetch("/api/saved-searches", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ username: queryKey }),
                  });
                  if (response.ok) {
                    toast.success(interpolate(t.search.saved, { username: queryKey }));
                  } else toast.error(t.search.saveFailed);
                }}
              >
                <Bookmark className="h-4 w-4" />
                {t.search.save}
              </Button>
            </div>
          </div>
          <StatusBanner status={result.status} />
          {result.profile ? <ProfileCard profile={result.profile} /> : null}
          {result.status === "success" || result.stories.length > 0 ? (
            <>
              <StoriesGrid
                stories={result.stories}
                onOpen={(index) => {
                  setViewerIndex(index);
                  setViewerOpen(true);
                }}
              />
              <StoryViewer
                stories={result.stories}
                index={viewerIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
                onIndexChange={setViewerIndex}
              />
            </>
          ) : null}
          {result.status === "not_found" ? (
            <Button
              variant="secondary"
              onClick={() => router.push("/search?u=luna.travels")}
            >
              {t.search.tryDemo}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          {interpolate(t.search.loadFailed, { username: queryKey })}
        </div>
      )}
    </div>
  );
}
