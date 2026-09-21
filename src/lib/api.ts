import { NextResponse } from "next/server";
import { z } from "zod";
import { usernameSchema } from "@/domain/username";
import {
  SEARCH_STATUSES,
  type PublicProfile,
  type PublicStoryDto,
  type SearchStatus,
} from "@/domain/types";

export const searchRequestSchema = z.object({
  username: usernameSchema(),
});

export const searchStatusSchema = z.enum(SEARCH_STATUSES);

export const publicProfileSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  isPublic: z.boolean(),
  followerLabel: z.string().nullable(),
});

export const publicStorySchema = z.object({
  providerStoryId: z.string(),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  caption: z.string().nullable(),
  createdAtRemote: z.string(),
  expiresAtRemote: z.string(),
});

export const searchResponseSchema = z.object({
  status: searchStatusSchema,
  username: z.string(),
  providerName: z.string(),
  fetchedAt: z.string(),
  cache: z.object({
    profile: z.enum(["hit", "miss", "skipped"]),
    stories: z.enum(["hit", "miss", "skipped"]),
  }),
  profile: publicProfileSchema.nullable(),
  stories: z.array(publicStorySchema),
  errorMessage: z.string().nullable(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  status: SearchStatus | "error",
  message: string,
  httpStatus: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    { status, errorMessage: message, ...extra },
    { status: httpStatus },
  );
}

export function httpStatusFor(status: SearchStatus): number {
  switch (status) {
    case "success":
    case "no_stories":
      return 200;
    case "not_found":
      return 404;
    case "private_profile":
      return 403;
    case "invalid_username":
      return 400;
    case "rate_limited":
      return 429;
    case "provider_unavailable":
      return 503;
    default:
      return 500;
  }
}

export type { PublicProfile, PublicStoryDto };
