export const CACHE_TTL_SECONDS = {
  profile: 10 * 60,
  stories: 3 * 60,
  failedLookup: 60,
  providerHealth: 30,
} as const;

export function expiresAtFromTtl(ttlSeconds: number, from = new Date()): Date {
  return new Date(from.getTime() + ttlSeconds * 1000);
}

export function isExpired(expiresAt: Date, now = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}
