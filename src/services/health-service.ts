import { CACHE_TTL_SECONDS } from "@/domain/ttl";
import type { ProviderHealth } from "@/domain/types";
import { getCacheStore } from "@/lib/cache";
import { getConfig } from "@/lib/config";
import { isDatabaseReachable } from "@/lib/prisma";
import { getPersistence } from "@/lib/persistence";
import { getStoryProvider, listRegisteredProviders } from "@/providers/registry";
import { withTimeout } from "@/providers/story-provider";
import { DEMO_PROFILES } from "@/providers/catalog";

export async function getProviderHealth(): Promise<ProviderHealth> {
  const cache = await getCacheStore();
  const provider = getStoryProvider();
  const key = `health:${provider.name}`;
  const cached = await cache.get<ProviderHealth>(key);
  if (cached) {
    return { ...cached, checkedAt: new Date(cached.checkedAt) };
  }
  const db = await getPersistence();
  try {
    const health = await withTimeout(
      provider.healthCheck(),
      getConfig().providerTimeoutMs,
    );
    await cache.set(key, health, CACHE_TTL_SECONDS.providerHealth);
    await db.upsertProviderState({
      providerName: health.name,
      isHealthy: health.ok,
      message: health.message,
      lastCheckedAt: health.checkedAt,
    });
    return health;
  } catch (error) {
    const health: ProviderHealth = {
      name: provider.name,
      ok: false,
      message: error instanceof Error ? error.message : "Health check failed",
      checkedAt: new Date(),
    };
    await cache.set(key, health, CACHE_TTL_SECONDS.providerHealth);
    return health;
  }
}

export async function getAdminSnapshot() {
  const cache = await getCacheStore();
  const config = getConfig();
  const db = await getPersistence();
  const [providerHealth, cacheStats, dbOk, logs, recent] = await Promise.all([
    getProviderHealth(),
    cache.stats(),
    isDatabaseReachable(),
    db.readFetchLogs(20),
    db.readRecentSearches(10),
  ]);

  return {
    appEnv: config.appEnv,
    nodeEnv: config.nodeEnv,
    provider: {
      selected: config.storyProvider,
      registered: listRegisteredProviders(),
      health: {
        ...providerHealth,
        checkedAt: providerHealth.checkedAt.toISOString(),
      },
    },
    cache: cacheStats,
    database: { ok: dbOk },
    rateLimit: {
      max: config.rateLimitMax,
      windowMs: config.rateLimitWindowMs,
    },
    demoUsernames: DEMO_PROFILES.map((profile) => ({
      username: profile.username,
      scenario: profile.scenario,
      notes: profile.notes,
    })),
    recentSearches: recent.map((item) => ({
      ...item,
      searchedAt: item.searchedAt.toISOString(),
    })),
    fetchLogs: logs.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}
