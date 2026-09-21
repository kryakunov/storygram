import { logger } from "@/lib/logger";
import { getConfig } from "@/lib/config";
import { MemoryCacheStore } from "@/lib/cache/memory";
import { createRedisClient, RedisCacheStore } from "@/lib/cache/redis";
import type { CacheStore } from "@/lib/cache/types";

const memory = new MemoryCacheStore();
let resolved: CacheStore | null = null;
let resolving: Promise<CacheStore> | null = null;

async function connectRedis(): Promise<CacheStore> {
  const url = getConfig().redisUrl;
  const client = createRedisClient(url);
  try {
    await client.connect();
    const store = new RedisCacheStore(client);
    const ok = await store.ping();
    if (!ok) {
      throw new Error("Redis ping failed");
    }
    logger.info("cache_backend", { backend: "redis" });
    return store;
  } catch (error) {
    client.disconnect();
    logger.warn("cache_fallback_memory", {
      reason: error instanceof Error ? error.message : "redis unavailable",
    });
    return memory;
  }
}

export async function getCacheStore(): Promise<CacheStore> {
  if (resolved) return resolved;
  if (!resolving) {
    resolving = connectRedis().then((store) => {
      resolved = store;
      return store;
    });
  }
  return resolving;
}

export function getMemoryCacheForTests(): MemoryCacheStore {
  return new MemoryCacheStore();
}
