export const SEARCH_STATUSES = [
  "success",
  "no_stories",
  "not_found",
  "private_profile",
  "provider_unavailable",
  "invalid_username",
  "rate_limited",
] as const;

export type SearchStatus = (typeof SEARCH_STATUSES)[number];

export type MediaType = "image" | "video";

export interface PublicProfile {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  followerLabel: string | null;
}

export interface PublicStory {
  providerStoryId: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  createdAtRemote: Date;
  expiresAtRemote: Date;
}

export interface ProviderHealth {
  name: string;
  ok: boolean;
  message: string;
  checkedAt: Date;
}

export type ProfileLookup =
  | { status: "found"; profile: PublicProfile }
  | { status: "not_found" }
  | { status: "private_profile"; profile: PublicProfile }
  | { status: "provider_unavailable"; message: string };

export type StoriesLookup =
  | { status: "found"; stories: PublicStory[] }
  | { status: "no_stories" }
  | { status: "not_found" }
  | { status: "private_profile" }
  | { status: "provider_unavailable"; message: string };

export interface SearchResult {
  status: SearchStatus;
  username: string;
  providerName: string;
  fetchedAt: string;
  cache: {
    profile: "hit" | "miss" | "skipped";
    stories: "hit" | "miss" | "skipped";
  };
  profile: PublicProfile | null;
  stories: PublicStoryDto[];
  errorMessage: string | null;
}

export interface PublicStoryDto {
  providerStoryId: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  createdAtRemote: string;
  expiresAtRemote: string;
}

export function toStoryDto(story: PublicStory): PublicStoryDto {
  return {
    providerStoryId: story.providerStoryId,
    mediaType: story.mediaType,
    mediaUrl: story.mediaUrl,
    thumbnailUrl: story.thumbnailUrl,
    caption: story.caption,
    createdAtRemote: story.createdAtRemote.toISOString(),
    expiresAtRemote: story.expiresAtRemote.toISOString(),
  };
}

export const STATUS_COPY: Record<
  SearchStatus,
  { title: string; description: string }
> = {
  success: {
    title: "Active public stories",
    description: "These items are currently available from a public profile.",
  },
  no_stories: {
    title: "No active stories",
    description: "This public profile has no currently available stories.",
  },
  not_found: {
    title: "Profile not found",
    description: "The provider does not have a public profile for this username.",
  },
  private_profile: {
    title: "Private profile",
    description:
      "This app only supports public profiles. Private accounts are never fetched.",
  },
  provider_unavailable: {
    title: "Provider unavailable",
    description:
      "The configured story source is down or timed out. Try again shortly.",
  },
  invalid_username: {
    title: "Invalid username",
    description: "Use 1–30 characters: letters, numbers, periods, or underscores.",
  },
  rate_limited: {
    title: "Too many requests",
    description: "Please wait a minute before searching again.",
  },
};
