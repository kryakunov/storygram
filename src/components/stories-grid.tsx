"use client";

import type { PublicStoryDto } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { interpolate, translateDemo } from "@/i18n";

export function StoriesGrid({
  stories,
  onOpen,
}: {
  stories: PublicStoryDto[];
  onOpen: (index: number) => void;
}) {
  const { t, locale } = useI18n();

  if (stories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        {t.stories.empty}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story, index) => {
        const caption = translateDemo(t, "captions", story.providerStoryId, story.caption);
        return (
          <li key={story.providerStoryId}>
            <button
              type="button"
              onClick={() => onOpen(index)}
              className="group w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-[9/16] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.thumbnailUrl ?? story.mediaUrl}
                  alt={caption || interpolate(t.stories.storyN, { n: index + 1 })}
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute top-3 left-3">
                  {story.mediaType === "video" ? t.stories.video : t.stories.image}
                </Badge>
              </div>
              <div className="space-y-1 p-4">
                <p className="line-clamp-2 text-sm font-medium">
                  {caption || t.stories.untitled}
                </p>
                <p className="text-xs text-muted-foreground">
                  {interpolate(t.stories.posted, {
                    time: formatRelative(story.createdAtRemote, locale),
                  })}{" "}
                  ·{" "}
                  {interpolate(t.stories.expires, {
                    time: formatRelative(story.expiresAtRemote, locale),
                  })}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
