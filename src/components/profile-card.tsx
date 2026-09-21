"use client";

import type { PublicProfile } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/components/i18n-provider";
import { interpolate, translateDemo } from "@/i18n";

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const { t } = useI18n();
  const bio = translateDemo(t, "bios", profile.username, profile.bio);
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-6">
        <span className="story-ring inline-flex h-20 w-20 shrink-0 rounded-full p-[3px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl ?? "/demo/avatars/fallback.svg"}
            alt={interpolate(t.profile.avatarAlt, { name: profile.displayName })}
            className="h-full w-full rounded-full bg-background object-cover"
          />
        </span>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {profile.displayName}
            </h2>
            <Badge variant={profile.isPublic ? "success" : "danger"}>
              {profile.isPublic ? t.profile.public : t.profile.private}
            </Badge>
          </div>
          <p className="text-muted-foreground">@{profile.username}</p>
          {bio ? <p className="max-w-2xl text-sm">{bio}</p> : null}
          {profile.followerLabel ? (
            <p className="text-xs text-muted-foreground">
              {interpolate(t.profile.followers, { count: profile.followerLabel })}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
