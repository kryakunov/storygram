import type { SearchStatus } from "@/domain/types";
import type { PublicProfile, PublicStory } from "@/domain/types";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export interface Persistence {
  recordSearch(input: {
    username: string;
    status: SearchStatus;
    providerName: string;
    requesterIpHash: string | null;
    errorMessage: string | null;
  }): Promise<void>;
  recordFetchLog(input: {
    username: string;
    providerName: string;
    resultStatus: SearchStatus;
    durationMs: number;
    errorDetails: string | null;
  }): Promise<void>;
  upsertProfileCache(input: {
    username: string;
    providerName: string;
    profile: PublicProfile;
    fetchedAt: Date;
    expiresAt: Date;
  }): Promise<string | null>;
  replaceStoriesCache(input: {
    profileId: string;
    username: string;
    providerName: string;
    stories: PublicStory[];
    fetchedAt: Date;
    expiresAt: Date;
  }): Promise<void>;
  readRecentSearches(limit: number): Promise<
    Array<{
      id: string;
      username: string;
      status: SearchStatus;
      searchedAt: Date;
      providerName: string;
      errorMessage: string | null;
    }>
  >;
  readFetchLogs(limit: number): Promise<
    Array<{
      id: string;
      username: string;
      providerName: string;
      resultStatus: SearchStatus;
      durationMs: number;
      createdAt: Date;
      errorDetails: string | null;
    }>
  >;
  upsertProviderState(input: {
    providerName: string;
    isHealthy: boolean;
    message: string;
    lastCheckedAt: Date;
  }): Promise<void>;
  upsertSetting(key: string, value: string): Promise<void>;
  listSavedSearches(): Promise<Array<{ username: string; createdAt: Date }>>;
  saveSearch(username: string): Promise<void>;
  removeSavedSearch(username: string): Promise<void>;
}

async function swallow(label: string, work: () => Promise<void>): Promise<void> {
  try {
    await work();
  } catch (error) {
    logger.warn("persistence_skipped", {
      label,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

export const prismaPersistence: Persistence = {
  async recordSearch(input) {
    await swallow("recordSearch", async () => {
      await prisma.searchQuery.create({ data: input });
    });
  },
  async recordFetchLog(input) {
    await swallow("recordFetchLog", async () => {
      await prisma.fetchLog.create({ data: input });
    });
  },
  async upsertProfileCache(input) {
    try {
      const row = await prisma.profileCache.upsert({
        where: {
          username_providerName: {
            username: input.username,
            providerName: input.providerName,
          },
        },
        create: {
          username: input.username,
          providerName: input.providerName,
          displayName: input.profile.displayName,
          avatarUrl: input.profile.avatarUrl,
          bio: input.profile.bio,
          isPublic: input.profile.isPublic,
          fetchedAt: input.fetchedAt,
          expiresAt: input.expiresAt,
        },
        update: {
          displayName: input.profile.displayName,
          avatarUrl: input.profile.avatarUrl,
          bio: input.profile.bio,
          isPublic: input.profile.isPublic,
          fetchedAt: input.fetchedAt,
          expiresAt: input.expiresAt,
        },
      });
      return row.id;
    } catch (error) {
      logger.warn("persistence_skipped", {
        label: "upsertProfileCache",
        reason: error instanceof Error ? error.message : "unknown",
      });
      return null;
    }
  },
  async replaceStoriesCache(input) {
    await swallow("replaceStoriesCache", async () => {
      await prisma.storyCache.deleteMany({
        where: {
          username: input.username,
          providerName: input.providerName,
        },
      });
      if (input.stories.length === 0) return;
      await prisma.storyCache.createMany({
        data: input.stories.map((story) => ({
          profileId: input.profileId,
          username: input.username,
          providerName: input.providerName,
          providerStoryId: story.providerStoryId,
          mediaType: story.mediaType,
          mediaUrl: story.mediaUrl,
          thumbnailUrl: story.thumbnailUrl,
          caption: story.caption,
          createdAtRemote: story.createdAtRemote,
          expiresAtRemote: story.expiresAtRemote,
          fetchedAt: input.fetchedAt,
          expiresAt: input.expiresAt,
        })),
      });
    });
  },
  async readRecentSearches(limit) {
    try {
      return await prisma.searchQuery.findMany({
        orderBy: { searchedAt: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.warn("persistence_skipped", {
        label: "readRecentSearches",
        reason: error instanceof Error ? error.message : "unknown",
      });
      return [];
    }
  },
  async readFetchLogs(limit) {
    try {
      return await prisma.fetchLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.warn("persistence_skipped", {
        label: "readFetchLogs",
        reason: error instanceof Error ? error.message : "unknown",
      });
      return [];
    }
  },
  async upsertProviderState(input) {
    await swallow("upsertProviderState", async () => {
      await prisma.providerState.upsert({
        where: { providerName: input.providerName },
        create: input,
        update: {
          isHealthy: input.isHealthy,
          message: input.message,
          lastCheckedAt: input.lastCheckedAt,
        },
      });
    });
  },
  async upsertSetting(key, value) {
    await swallow("upsertSetting", async () => {
      await prisma.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    });
  },
  async listSavedSearches() {
    try {
      return await prisma.savedSearch.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [];
    }
  },
  async saveSearch(username) {
    await swallow("saveSearch", async () => {
      await prisma.savedSearch.upsert({
        where: { username },
        create: { username },
        update: {},
      });
    });
  },
  async removeSavedSearch(username) {
    await swallow("removeSavedSearch", async () => {
      await prisma.savedSearch.deleteMany({ where: { username } });
    });
  },
};

export class MemoryPersistence implements Persistence {
  searches: Array<{
    id: string;
    username: string;
    status: SearchStatus;
    searchedAt: Date;
    providerName: string;
    errorMessage: string | null;
    requesterIpHash: string | null;
  }> = [];
  logs: Array<{
    id: string;
    username: string;
    providerName: string;
    resultStatus: SearchStatus;
    durationMs: number;
    createdAt: Date;
    errorDetails: string | null;
  }> = [];
  saved: Array<{ username: string; createdAt: Date }> = [];

  async recordSearch(input: {
    username: string;
    status: SearchStatus;
    providerName: string;
    requesterIpHash: string | null;
    errorMessage: string | null;
  }) {
    this.searches.unshift({
      id: String(this.searches.length + 1),
      searchedAt: new Date(),
      ...input,
    });
  }

  async recordFetchLog(input: {
    username: string;
    providerName: string;
    resultStatus: SearchStatus;
    durationMs: number;
    errorDetails: string | null;
  }) {
    this.logs.unshift({
      id: String(this.logs.length + 1),
      createdAt: new Date(),
      ...input,
    });
  }

  async upsertProfileCache() {
    return "memory-profile";
  }

  async replaceStoriesCache() {}

  async readRecentSearches(limit: number) {
    return this.searches.slice(0, limit);
  }

  async readFetchLogs(limit: number) {
    return this.logs.slice(0, limit);
  }

  async upsertProviderState() {}

  async upsertSetting() {}

  async listSavedSearches() {
    return this.saved;
  }

  async saveSearch(username: string) {
    if (!this.saved.some((item) => item.username === username)) {
      this.saved.unshift({ username, createdAt: new Date() });
    }
  }

  async removeSavedSearch(username: string) {
    this.saved = this.saved.filter((item) => item.username !== username);
  }
}

const memoryPersistence = new MemoryPersistence();
let resolved: Persistence | null = null;
let checkedAt = 0;

export async function getPersistence(): Promise<Persistence> {
  if (resolved && Date.now() - checkedAt < 15_000) {
    return resolved;
  }
  const { isDatabaseReachable } = await import("@/lib/prisma");
  const ok = await isDatabaseReachable();
  checkedAt = Date.now();
  resolved = ok ? prismaPersistence : memoryPersistence;
  if (!ok) {
    logger.warn("persistence_memory_fallback", {
      reason: "Postgres is unreachable; recent searches stay in-process only.",
    });
  }
  return resolved;
}

