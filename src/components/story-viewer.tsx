"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicStoryDto } from "@/domain/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { interpolate, translateDemo } from "@/i18n";

const IMAGE_DURATION_MS = 5000;

export function StoryViewer({
  stories,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: {
  stories: PublicStoryDto[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}) {
  const { t } = useI18n();
  const story = stories[index];

  const go = useCallback(
    (next: number) => {
      if (stories.length === 0) return;
      onIndexChange((next + stories.length) % stories.length);
    },
    [onIndexChange, stories.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, open]);

  if (!story) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t.stories.close}>
        <StoryFrame
          key={story.providerStoryId}
          story={story}
          index={index}
          total={stories.length}
          stories={stories}
          go={go}
        />
      </DialogContent>
    </Dialog>
  );
}

function StoryFrame({
  story,
  index,
  total,
  stories,
  go,
}: {
  story: PublicStoryDto;
  index: number;
  total: number;
  stories: PublicStoryDto[];
  go: (next: number) => void;
}) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [mediaFailed, setMediaFailed] = useState(false);
  const caption = translateDemo(t, "captions", story.providerStoryId, story.caption);
  const mediaLabel = story.mediaType === "video" ? t.stories.video : t.stories.image;

  useEffect(() => {
    if (story.mediaType === "video") return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const pct = Math.min(((Date.now() - started) / IMAGE_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        go(index + 1);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [go, index, story.mediaType]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <DialogTitle className="sr-only">
        {interpolate(t.stories.viewerTitle, {
          current: index + 1,
          total,
          caption: caption || mediaLabel,
        })}
      </DialogTitle>
      <div className="flex gap-1" aria-hidden="true">
        {stories.map((item, itemIndex) => (
          <div
            key={item.providerStoryId}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
          >
            <div
              className="h-full bg-white"
              style={{
                width:
                  itemIndex < index
                    ? "100%"
                    : itemIndex === index
                      ? `${progress}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-black">
        {mediaFailed ? (
          <div className="flex aspect-[9/16] items-center justify-center p-6 text-center text-white">
            {t.stories.unavailable}
          </div>
        ) : story.mediaType === "video" ? (
          <video
            src={story.mediaUrl}
            poster={story.thumbnailUrl ?? undefined}
            className="aspect-[9/16] w-full object-cover"
            autoPlay
            playsInline
            controls
            onTimeUpdate={(event) => {
              const el = event.currentTarget;
              if (el.duration) setProgress((el.currentTime / el.duration) * 100);
            }}
            onEnded={() => go(index + 1)}
            onError={() => setMediaFailed(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.mediaUrl}
            alt={caption || interpolate(t.stories.storyN, { n: index + 1 })}
            className="aspect-[9/16] w-full object-cover"
            onError={() => setMediaFailed(true)}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <p className="text-sm font-medium">{caption}</p>
          <p className="text-xs opacity-80">
            {index + 1} / {total} · {mediaLabel}
          </p>
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => go(index - 1)} aria-label={t.stories.previous}>
          <ChevronLeft className="h-4 w-4" />
          {t.stories.previous}
        </Button>
        <Button onClick={() => go(index + 1)} aria-label={t.stories.next}>
          {t.stories.next}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
