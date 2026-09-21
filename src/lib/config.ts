import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.string().default("development"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  STORY_PROVIDER: z.string().default("mock"),
  IP_HASH_SALT: z.string().default("change-me-in-local-dev"),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
  ADMIN_TOKEN: z.string().optional().default(""),
  NEXT_PUBLIC_APP_NAME: z.string().default("Public Story Viewer"),
});

export type AppConfig = {
  appEnv: string;
  nodeEnv: string;
  databaseUrl: string | undefined;
  redisUrl: string;
  storyProvider: string;
  ipHashSalt: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  providerTimeoutMs: number;
  adminToken: string;
  appName: string;
};

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;
  const parsed = envSchema.parse({
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    STORY_PROVIDER: process.env.STORY_PROVIDER,
    IP_HASH_SALT: process.env.IP_HASH_SALT,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    PROVIDER_TIMEOUT_MS: process.env.PROVIDER_TIMEOUT_MS,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });
  cached = {
    appEnv: parsed.APP_ENV,
    nodeEnv: parsed.NODE_ENV ?? "development",
    databaseUrl: parsed.DATABASE_URL,
    redisUrl: parsed.REDIS_URL,
    storyProvider: parsed.STORY_PROVIDER,
    ipHashSalt: parsed.IP_HASH_SALT,
    rateLimitMax: parsed.RATE_LIMIT_MAX,
    rateLimitWindowMs: parsed.RATE_LIMIT_WINDOW_MS,
    providerTimeoutMs: parsed.PROVIDER_TIMEOUT_MS,
    adminToken: parsed.ADMIN_TOKEN,
    appName: parsed.NEXT_PUBLIC_APP_NAME,
  };
  return cached;
}

export function resetConfigCache(): void {
  cached = null;
}
