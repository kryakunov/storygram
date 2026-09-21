import type { CacheStore } from "@/lib/cache/types";
import { getCacheStore } from "@/lib/cache";
import { getConfig } from "@/lib/config";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class RateLimiter {
  constructor(
    private readonly cache: CacheStore,
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  async consume(key: string): Promise<RateLimitResult> {
    const cacheKey = `rl:${key}`;
    const windowSeconds = Math.ceil(this.windowMs / 1000);
    const current = (await this.cache.get<number>(cacheKey)) ?? 0;
    if (current >= this.max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: windowSeconds,
      };
    }
    await this.cache.set(cacheKey, current + 1, windowSeconds);
    return {
      allowed: true,
      remaining: Math.max(this.max - current - 1, 0),
      retryAfterSeconds: windowSeconds,
    };
  }
}

export async function getRateLimiter(): Promise<RateLimiter> {
  const config = getConfig();
  const cache = await getCacheStore();
  return new RateLimiter(cache, config.rateLimitMax, config.rateLimitWindowMs);
}
