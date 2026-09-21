import Redis from "ioredis";
import type { CacheStore } from "@/lib/cache/types";

export class RedisCacheStore implements CacheStore {
  readonly backend = "redis" as const;

  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async ping(): Promise<boolean> {
    const result = await this.redis.ping();
    return result === "PONG";
  }

  async stats(): Promise<{ backend: "redis"; keys: number | null }> {
    try {
      const size = await this.redis.dbsize();
      return { backend: "redis", keys: size };
    } catch {
      return { backend: "redis", keys: null };
    }
  }
}

export function createRedisClient(url: string): Redis {
  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 800,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  client.on("error", () => {
    // Errors are handled by ping/connect; avoid unhandled error crashes.
  });
  return client;
}
