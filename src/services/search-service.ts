import { CACHE_TTL_SECONDS, expiresAtFromTtl } from "@/domain/ttl";
import type {
  PublicProfile,
  PublicStory,
  SearchResult,
  SearchStatus,
} from "@/domain/types";
import { toStoryDto } from "@/domain/types";
import { parseUsername } from "@/domain/username";
import { getCacheStore } from "@/lib/cache";
import type { CacheStore } from "@/lib/cache/types";
import { getConfig } from "@/lib/config";
import { logger } from "@/lib/logger";
import { getPersistence, type Persistence } from "@/lib/persistence";
import { getRateLimiter, type RateLimiter } from "@/lib/rate-limit";
import { getStoryProvider } from "@/providers/registry";
import {
  ProviderTimeoutError,
  ProviderUnavailableError,
  withTimeout,
  type StoryProvider,
} from "@/providers/story-provider";

type CacheFlag = "hit" | "miss" | "skipped";

interface CachedFailure {
  status: Extract<SearchStatus, "not_found" | "private_profile" | "provider_unavailable">;
  profile: PublicProfile | null;
  message: string | null;
}

interface CachedProfile {
  profile: PublicProfile;
}

interface CachedStories {
  stories: PublicStory[];
}

export interface SearchInput {
  username: string;
  ipHash?: string | null;
  skipRateLimit?: boolean;
}

export interface SearchDeps {
  provider: StoryProvider;
  cache: CacheStore;
  db: Persistence;
  rateLimiter: RateLimiter;
  timeoutMs: number;
  now?: () => Date;
}

export async function createDefaultSearchDeps(): Promise<SearchDeps> {
  const config = getConfig();
  return {
    provider: getStoryProvider(),
    cache: await getCacheStore(),
    db: await getPersistence(),
    rateLimiter: await getRateLimiter(),
    timeoutMs: config.providerTimeoutMs,
  };
}

function failureKey(provider: string, username: string) {
  return `fail:${provider}:${username}`;
}

function profileKey(provider: string, username: string) {
  return `profile:${provider}:${username}`;
}

function storiesKey(provider: string, username: string) {
  return `stories:${provider}:${username}`;
}

function reviveStories(stories: PublicStory[]): PublicStory[] {
  return stories.map((story) => ({
    ...story,
    createdAtRemote: new Date(story.createdAtRemote),
    expiresAtRemote: new Date(story.expiresAtRemote),
  }));
}

function result(partial: Omit<SearchResult, "fetchedAt">, fetchedAt: Date): SearchResult {
  return { ...partial, fetchedAt: fetchedAt.toISOString() };
}

export class SearchService {
  constructor(private readonly deps: SearchDeps) {}

  async search(input: SearchInput): Promise<SearchResult> {
    const started = Date.now();
    const now = this.deps.now?.() ?? new Date();
    const parsed = parseUsername(input.username);
    if (!parsed.ok) {
      return this.finish(
        {
          status: "invalid_username",
          username: input.username,
          providerName: this.deps.provider.name,
          cache: { profile: "skipped", stories: "skipped" },
          profile: null,
          stories: [],
          errorMessage: parsed.error,
        },
        now,
        started,
        input.ipHash,
      );
    }

    const username = parsed.username;
    const providerName = this.deps.provider.name;

    if (!input.skipRateLimit) {
      const limited = await this.deps.rateLimiter.consume(input.ipHash ?? "anon");
      if (!limited.allowed) {
        return this.finish(
          {
            status: "rate_limited",
            username,
            providerName,
            cache: { profile: "skipped", stories: "skipped" },
            profile: null,
            stories: [],
            errorMessage: `Retry in ${limited.retryAfterSeconds}s`,
          },
          now,
          started,
          input.ipHash,
        );
      }
    }

    const failed = await this.deps.cache.get<CachedFailure>(
      failureKey(providerName, username),
    );
    if (failed) {
      return this.finish(
        {
          status: failed.status,
          username,
          providerName,
          cache: { profile: "hit", stories: "skipped" },
          profile: failed.profile,
          stories: [],
          errorMessage: failed.message,
        },
        now,
        started,
        input.ipHash,
      );
    }

    const profileLookup = await this.loadProfile(username, now);
    if (profileLookup.status === "done") {
      return this.finish(profileLookup.result, now, started, input.ipHash);
    }

    const profile = profileLookup.profile;
    const profileCache: CacheFlag = profileLookup.cache;
    const storiesLookup = await this.loadStories(username, profile, now);

    return this.finish(
      {
        status: storiesLookup.status,
        username,
        providerName,
        cache: { profile: profileCache, stories: storiesLookup.cache },
        profile,
        stories: storiesLookup.stories.map(toStoryDto),
        errorMessage: storiesLookup.errorMessage,
      },
      now,
      started,
      input.ipHash,
    );
  }

  private async loadProfile(
    username: string,
    now: Date,
  ): Promise<
    | { status: "continue"; profile: PublicProfile; cache: CacheFlag }
    | { status: "done"; result: Omit<SearchResult, "fetchedAt"> }
  > {
    const providerName = this.deps.provider.name;
    const cached = await this.deps.cache.get<CachedProfile>(
      profileKey(providerName, username),
    );
    if (cached?.profile) {
      if (!cached.profile.isPublic) {
        return {
          status: "done",
          result: {
            status: "private_profile",
            username,
            providerName,
            cache: { profile: "hit", stories: "skipped" },
            profile: cached.profile,
            stories: [],
            errorMessage: "Private profiles are not supported.",
          },
        };
      }
      return { status: "continue", profile: cached.profile, cache: "hit" };
    }

    try {
      const lookup = await withTimeout(
        this.deps.provider.getProfileByUsername(username),
        this.deps.timeoutMs,
      );

      if (lookup.status === "not_found") {
        await this.cacheFailure(username, "not_found", null, "Profile not found.");
        return {
          status: "done",
          result: {
            status: "not_found",
            username,
            providerName,
            cache: { profile: "miss", stories: "skipped" },
            profile: null,
            stories: [],
            errorMessage: "Profile not found.",
          },
        };
      }

      if (lookup.status === "provider_unavailable") {
        await this.cacheFailure(
          username,
          "provider_unavailable",
          null,
          lookup.message,
        );
        return {
          status: "done",
          result: {
            status: "provider_unavailable",
            username,
            providerName,
            cache: { profile: "miss", stories: "skipped" },
            profile: null,
            stories: [],
            errorMessage: lookup.message,
          },
        };
      }

      if (lookup.status === "private_profile") {
        await this.cacheFailure(
          username,
          "private_profile",
          lookup.profile,
          "Private profiles are not supported.",
        );
        return {
          status: "done",
          result: {
            status: "private_profile",
            username,
            providerName,
            cache: { profile: "miss", stories: "skipped" },
            profile: lookup.profile,
            stories: [],
            errorMessage: "Private profiles are not supported.",
          },
        };
      }

      await this.deps.cache.set(
        profileKey(providerName, username),
        { profile: lookup.profile } satisfies CachedProfile,
        CACHE_TTL_SECONDS.profile,
      );
      await this.deps.db.upsertProfileCache({
        username,
        providerName,
        profile: lookup.profile,
        fetchedAt: now,
        expiresAt: expiresAtFromTtl(CACHE_TTL_SECONDS.profile, now),
      });
      return { status: "continue", profile: lookup.profile, cache: "miss" };
    } catch (error) {
      return {
        status: "done",
        result: await this.unavailableResult(username, error),
      };
    }
  }

  private async loadStories(
    username: string,
    profile: PublicProfile,
    now: Date,
  ): Promise<{
    status: SearchStatus;
    stories: PublicStory[];
    cache: CacheFlag;
    errorMessage: string | null;
  }> {
    const providerName = this.deps.provider.name;
    const cached = await this.deps.cache.get<CachedStories>(
      storiesKey(providerName, username),
    );
    if (cached) {
      const stories = reviveStories(cached.stories).filter(
        (story) => story.expiresAtRemote.getTime() > now.getTime(),
      );
      return {
        status: stories.length ? "success" : "no_stories",
        stories,
        cache: "hit",
        errorMessage: stories.length ? null : "No active stories.",
      };
    }

    try {
      const lookup = await withTimeout(
        this.deps.provider.getActiveStories(username),
        this.deps.timeoutMs,
      );

      if (lookup.status === "private_profile") {
        return {
          status: "private_profile",
          stories: [],
          cache: "miss",
          errorMessage: "Private profiles are not supported.",
        };
      }
      if (lookup.status === "not_found") {
        return {
          status: "not_found",
          stories: [],
          cache: "miss",
          errorMessage: "Profile not found.",
        };
      }
      if (lookup.status === "provider_unavailable") {
        return {
          status: "provider_unavailable",
          stories: [],
          cache: "miss",
          errorMessage: lookup.message,
        };
      }

      const stories =
        lookup.status === "found"
          ? lookup.stories.filter(
              (story) => story.expiresAtRemote.getTime() > now.getTime(),
            )
          : [];

      await this.deps.cache.set(
        storiesKey(providerName, username),
        { stories } satisfies CachedStories,
        CACHE_TTL_SECONDS.stories,
      );

      const profileId = await this.deps.db.upsertProfileCache({
        username,
        providerName,
        profile,
        fetchedAt: now,
        expiresAt: expiresAtFromTtl(CACHE_TTL_SECONDS.profile, now),
      });
      if (profileId) {
        await this.deps.db.replaceStoriesCache({
          profileId,
          username,
          providerName,
          stories,
          fetchedAt: now,
          expiresAt: expiresAtFromTtl(CACHE_TTL_SECONDS.stories, now),
        });
      }

      return {
        status: stories.length ? "success" : "no_stories",
        stories,
        cache: "miss",
        errorMessage: stories.length ? null : "No active stories.",
      };
    } catch (error) {
      const unavailable = await this.unavailableResult(username, error);
      return {
        status: "provider_unavailable",
        stories: [],
        cache: "miss",
        errorMessage: unavailable.errorMessage,
      };
    }
  }

  private async cacheFailure(
    username: string,
    status: CachedFailure["status"],
    profile: PublicProfile | null,
    message: string | null,
  ) {
    await this.deps.cache.set(
      failureKey(this.deps.provider.name, username),
      { status, profile, message } satisfies CachedFailure,
      CACHE_TTL_SECONDS.failedLookup,
    );
  }

  private async unavailableResult(
    username: string,
    error: unknown,
  ): Promise<Omit<SearchResult, "fetchedAt">> {
    const message =
      error instanceof ProviderTimeoutError ||
      error instanceof ProviderUnavailableError
        ? error.message
        : "Story provider is temporarily unavailable.";
    logger.warn("provider_unavailable", {
      username,
      provider: this.deps.provider.name,
      reason: message,
    });
    await this.cacheFailure(username, "provider_unavailable", null, message);
    return {
      status: "provider_unavailable",
      username,
      providerName: this.deps.provider.name,
      cache: { profile: "miss", stories: "skipped" },
      profile: null,
      stories: [],
      errorMessage: message,
    };
  }

  private async finish(
    payload: Omit<SearchResult, "fetchedAt">,
    now: Date,
    started: number,
    ipHash: string | null | undefined,
  ): Promise<SearchResult> {
    const durationMs = Date.now() - started;
    logger.info("search_complete", {
      username: payload.username,
      status: payload.status,
      provider: payload.providerName,
      durationMs,
      profileCache: payload.cache.profile,
      storiesCache: payload.cache.stories,
    });
    await this.deps.db.recordSearch({
      username: payload.username,
      status: payload.status,
      providerName: payload.providerName,
      requesterIpHash: ipHash ?? null,
      errorMessage: payload.errorMessage,
    });
    await this.deps.db.recordFetchLog({
      username: payload.username,
      providerName: payload.providerName,
      resultStatus: payload.status,
      durationMs,
      errorDetails: payload.errorMessage,
    });
    return result(payload, now);
  }
}

export async function searchPublicStories(
  input: SearchInput,
  deps?: SearchDeps,
): Promise<SearchResult> {
  const service = new SearchService(deps ?? (await createDefaultSearchDeps()));
  return service.search(input);
}
