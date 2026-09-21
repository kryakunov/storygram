import { describe, expect, it } from "vitest";
import { MemoryCacheStore } from "@/lib/cache/memory";
import { MemoryPersistence } from "@/lib/persistence";
import { RateLimiter } from "@/lib/rate-limit";
import { MockStoryProvider } from "@/providers/mock-story-provider";
import { SearchService, type SearchDeps } from "@/services/search-service";

function deps(overrides?: Partial<SearchDeps>): SearchDeps {
  const cache = overrides?.cache ?? new MemoryCacheStore();
  return {
    provider: overrides?.provider ?? new MockStoryProvider(),
    cache,
    db: overrides?.db ?? new MemoryPersistence(),
    rateLimiter:
      overrides?.rateLimiter ?? new RateLimiter(cache, 20, 60_000),
    timeoutMs: overrides?.timeoutMs ?? 1000,
  };
}

describe("SearchService", () => {
  it("returns success with stories for a seeded public profile", async () => {
    const service = new SearchService(deps());
    const result = await service.search({ username: "luna.travels", skipRateLimit: true });
    expect(result.status).toBe("success");
    expect(result.profile?.username).toBe("luna.travels");
    expect(result.stories.length).toBeGreaterThan(0);
  });

  it("returns no_stories for a public profile without active stories", async () => {
    const service = new SearchService(deps());
    const result = await service.search({ username: "quiet.garden", skipRateLimit: true });
    expect(result.status).toBe("no_stories");
    expect(result.profile?.isPublic).toBe(true);
    expect(result.stories).toEqual([]);
  });

  it("rejects private profiles without returning stories", async () => {
    const service = new SearchService(deps());
    const result = await service.search({ username: "private.mode", skipRateLimit: true });
    expect(result.status).toBe("private_profile");
    expect(result.stories).toEqual([]);
  });

  it("returns not_found for unknown users", async () => {
    const service = new SearchService(deps());
    const result = await service.search({ username: "missing.user", skipRateLimit: true });
    expect(result.status).toBe("not_found");
  });

  it("maps mock outages to provider_unavailable", async () => {
    const service = new SearchService(deps());
    const result = await service.search({ username: "down.stream", skipRateLimit: true });
    expect(result.status).toBe("provider_unavailable");
  });

  it("validates usernames before calling the provider", async () => {
    const service = new SearchService(deps());
    const result = await service.search({ username: "no spaces allowed", skipRateLimit: true });
    expect(result.status).toBe("invalid_username");
  });

  it("rate limits repeated searches from the same fingerprint", async () => {
    const cache = new MemoryCacheStore();
    const service = new SearchService(
      deps({ cache, rateLimiter: new RateLimiter(cache, 1, 60_000) }),
    );
    const first = await service.search({ username: "cafe.neon", ipHash: "abc" });
    const second = await service.search({ username: "cafe.neon", ipHash: "abc" });
    expect(first.status).toBe("success");
    expect(second.status).toBe("rate_limited");
  });

  it("serves a cached profile on the second lookup", async () => {
    const service = new SearchService(deps());
    const first = await service.search({ username: "city.lights", skipRateLimit: true });
    const second = await service.search({ username: "city.lights", skipRateLimit: true });
    expect(first.cache.profile).toBe("miss");
    expect(second.cache.profile).toBe("hit");
    expect(second.cache.stories).toBe("hit");
  });
});
