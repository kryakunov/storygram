export interface CacheStore {
  readonly backend: "redis" | "memory";
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  ping(): Promise<boolean>;
  stats(): Promise<{ backend: "redis" | "memory"; keys: number | null }>;
}
