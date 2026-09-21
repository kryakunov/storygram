import type { MediaType, PublicProfile, PublicStory } from "@/domain/types";

export type DemoScenario =
  | "stories"
  | "no_stories"
  | "private"
  | "unavailable";

export interface DemoStorySeed {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  caption: string;
  createdHoursAgo: number;
  expiresInHours: number;
}

export interface DemoProfileSeed {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  isPublic: boolean;
  followerLabel: string;
  scenario: DemoScenario;
  stories: DemoStorySeed[];
  notes: string;
}

export const DEMO_PROFILES: DemoProfileSeed[] = [
  {
    username: "luna.travels",
    displayName: "Luna Travels",
    avatarUrl: "/demo/avatars/luna.svg",
    bio: "Public travel diary. Coastal light, trains, and late markets.",
    isPublic: true,
    followerLabel: "128k",
    scenario: "stories",
    notes: "Public profile with mixed image and video stories.",
    stories: [
      {
        id: "luna-sunrise",
        mediaType: "image",
        mediaUrl: "/demo/stories/luna-sunrise.svg",
        thumbnailUrl: "/demo/stories/luna-sunrise.svg",
        caption: "Sunrise over the ferry dock",
        createdHoursAgo: 2,
        expiresInHours: 22,
      },
      {
        id: "luna-market",
        mediaType: "video",
        mediaUrl: "/demo/stories/demo-clip.mp4",
        thumbnailUrl: "/demo/stories/luna-market.svg",
        caption: "Night market walk-through",
        createdHoursAgo: 5,
        expiresInHours: 19,
      },
      {
        id: "luna-train",
        mediaType: "image",
        mediaUrl: "/demo/stories/luna-train.svg",
        thumbnailUrl: "/demo/stories/luna-train.svg",
        caption: "Window seat, last carriage",
        createdHoursAgo: 8,
        expiresInHours: 16,
      },
    ],
  },
  {
    username: "cafe.neon",
    displayName: "Cafe Neon",
    avatarUrl: "/demo/avatars/cafe.svg",
    bio: "Neighborhood coffee shop. Daily specials, public storefront only.",
    isPublic: true,
    followerLabel: "14k",
    scenario: "stories",
    notes: "Public profile with image-only stories.",
    stories: [
      {
        id: "cafe-pour",
        mediaType: "image",
        mediaUrl: "/demo/stories/cafe-pour.svg",
        thumbnailUrl: "/demo/stories/cafe-pour.svg",
        caption: "Oat cortado, extra foam",
        createdHoursAgo: 1,
        expiresInHours: 23,
      },
      {
        id: "cafe-window",
        mediaType: "image",
        mediaUrl: "/demo/stories/cafe-window.svg",
        thumbnailUrl: "/demo/stories/cafe-window.svg",
        caption: "Rain on the shop window",
        createdHoursAgo: 4,
        expiresInHours: 20,
      },
    ],
  },
  {
    username: "city.lights",
    displayName: "City Lights",
    avatarUrl: "/demo/avatars/city.svg",
    bio: "Public architecture walks after dark.",
    isPublic: true,
    followerLabel: "61k",
    scenario: "stories",
    notes: "Public profile with video-heavy stories.",
    stories: [
      {
        id: "city-bridge",
        mediaType: "video",
        mediaUrl: "/demo/stories/demo-clip.mp4",
        thumbnailUrl: "/demo/stories/city-bridge.svg",
        caption: "Bridge lights at 1am",
        createdHoursAgo: 3,
        expiresInHours: 21,
      },
      {
        id: "city-metro",
        mediaType: "video",
        mediaUrl: "/demo/stories/demo-clip.mp4",
        thumbnailUrl: "/demo/stories/city-metro.svg",
        caption: "Metro line 4, last train",
        createdHoursAgo: 6,
        expiresInHours: 18,
      },
      {
        id: "city-skyline",
        mediaType: "image",
        mediaUrl: "/demo/stories/city-skyline.svg",
        thumbnailUrl: "/demo/stories/city-skyline.svg",
        caption: "Fog on the high-rises",
        createdHoursAgo: 9,
        expiresInHours: 15,
      },
    ],
  },
  {
    username: "quiet.garden",
    displayName: "Quiet Garden",
    avatarUrl: "/demo/avatars/garden.svg",
    bio: "Public botanical notes. Slow plants, no stories today.",
    isPublic: true,
    followerLabel: "3.2k",
    scenario: "no_stories",
    notes: "Public profile with no currently active stories.",
    stories: [],
  },
  {
    username: "private.mode",
    displayName: "Private Mode",
    avatarUrl: "/demo/avatars/private.svg",
    bio: "This account is private. The app must refuse it.",
    isPublic: false,
    followerLabel: "hidden",
    scenario: "private",
    notes: "Private profile. Stories are never returned.",
    stories: [
      {
        id: "private-hidden",
        mediaType: "image",
        mediaUrl: "/demo/stories/private-hidden.svg",
        thumbnailUrl: "/demo/stories/private-hidden.svg",
        caption: "Should never be returned",
        createdHoursAgo: 1,
        expiresInHours: 23,
      },
    ],
  },
  {
    username: "down.stream",
    displayName: "Down Stream",
    avatarUrl: "/demo/avatars/down.svg",
    bio: "Used to simulate provider downtime.",
    isPublic: true,
    followerLabel: "0",
    scenario: "unavailable",
    notes: "Simulates a temporary provider failure.",
    stories: [],
  },
];

export const DEMO_USERNAMES = DEMO_PROFILES.map((profile) => profile.username);

export function findDemoProfile(username: string): DemoProfileSeed | undefined {
  return DEMO_PROFILES.find(
    (profile) => profile.username === username.toLowerCase(),
  );
}

export function toPublicProfile(seed: DemoProfileSeed): PublicProfile {
  return {
    username: seed.username,
    displayName: seed.displayName,
    avatarUrl: seed.avatarUrl,
    bio: seed.bio,
    isPublic: seed.isPublic,
    followerLabel: seed.followerLabel,
  };
}

export function toPublicStories(seed: DemoProfileSeed, now = new Date()): PublicStory[] {
  return seed.stories.map((story) => ({
    providerStoryId: story.id,
    mediaType: story.mediaType,
    mediaUrl: story.mediaUrl,
    thumbnailUrl: story.thumbnailUrl,
    caption: story.caption,
    createdAtRemote: new Date(now.getTime() - story.createdHoursAgo * 60 * 60 * 1000),
    expiresAtRemote: new Date(now.getTime() + story.expiresInHours * 60 * 60 * 1000),
  }));
}
