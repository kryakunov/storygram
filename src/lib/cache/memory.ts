import type { CacheStore } from "@/lib/cache/types";

interface MemoryEntry {
  expiresAt: number;
  value: unknown;
}

export class MemoryCacheStore implements CacheStore {
  readonly backend = "memory" as const;
  private readonly store = new Map<string, MemoryEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async stats(): Promise<{ backend: "memory"; keys: number }> {
    this.evictExpired();
    return { backend: "memory", keys: this.store.size };
  }

  private evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }
}
