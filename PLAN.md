# Public Story Viewer — Implementation Plan

Local-first MVP for viewing currently available **public** stories from **public** profiles. No third-party login, no private-account access, no scraping evasion.

## Constraints (non-negotiable)

- Public profiles only. Private accounts are rejected, never fetched.
- No Instagram OAuth, cookies, session import, or credential collection.
- No anti-bot evasion, rate-limit circumvention, or disguised automation.
- Core architecture uses generic names (`StoryProvider`, public story viewer), not platform-specific coupling.
- A real third-party provider is **not** implemented. The mock provider is the working source. A documented interface is the extension point.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- Redis cache with in-memory fallback
- Zod, React Hook Form
- Vitest (unit/integration) + Playwright (one E2E)
- Docker Compose for Postgres + Redis
- ESLint + Prettier

## Architecture

```
src/
  app/                 UI routes + API route handlers
  components/          Presentation (landing, search, viewer, admin)
  domain/              Types, status codes, username rules
  services/            Search, cache orchestration, logging, rate limit
  providers/           StoryProvider interface, mock impl, registry
  lib/                 config, prisma, cache adapters, hashing, logger
  db/                  seed helpers (if needed)
```

Layers:

1. **UI** — pages, forms, story viewer, empty/error states
2. **Application/services** — search orchestration, TTL cache, fetch logs
3. **Domain** — `PublicProfile`, `PublicStory`, `SearchStatus`
4. **Infrastructure/providers** — `StoryProvider` + `MockStoryProvider`
5. **Persistence** — Prisma models + Redis/memory cache

## Provider contract

```ts
interface StoryProvider {
  readonly name: string;
  getProfileByUsername(username: string): Promise<ProfileLookup>;
  getActiveStories(username: string): Promise<StoriesLookup>;
  healthCheck(): Promise<ProviderHealth>;
}
```

`ProviderRegistry` selects the provider from `STORY_PROVIDER` (default: `mock`).

A future legal/safe provider would implement the same interface. Until then, `src/providers/TODO.md` documents why a live source is not included.

## Mock provider catalog

| Username        | Behavior                                      |
|-----------------|-----------------------------------------------|
| `luna.travels`  | Public, mixed image + video stories           |
| `cafe.neon`     | Public, image stories only                    |
| `city.lights`   | Public, video-heavy stories                   |
| `quiet.garden`  | Public, no active stories                     |
| `private.mode`  | Private profile → `private_profile`           |
| `down.stream`   | Simulated provider outage                     |
| (any other)     | `not_found`                                   |

Seeded media lives in `public/demo/` so the app runs without external CDNs.

## Pages

- `/` landing (search, demo CTA, disclaimer)
- `/search?u=` results (profile, stories, viewer)
- `/recent` recent searches
- `/admin` provider health, cache, fetch logs, seed usernames
- `/pricing` coming soon (billing-ready placeholder only)

## API

- `GET /api/health`
- `GET /api/provider/health`
- `POST /api/search`
- `GET /api/profile/[username]`
- `GET /api/profile/[username]/stories`
- `GET /api/recent-searches`

Statuses: `success`, `no_stories`, `not_found`, `private_profile`, `provider_unavailable`, `invalid_username`, `rate_limited`.

## Data model

Prisma: `SearchQuery`, `ProfileCache`, `StoryCache`, `FetchLog`, `AppSetting`. Optional `SavedSearch` for the nice-to-have.

IP fingerprints stored as SHA-256 hashes, never raw IPs.

## Caching

| Key                    | TTL        |
|------------------------|------------|
| Profile                | 10 minutes |
| Story metadata         | 3 minutes  |
| Failed lookups         | 1 minute   |
| Provider health        | 30 seconds |

Redis if `REDIS_URL` is reachable; otherwise in-memory with the same `CacheStore` interface.

## Security

- Username Zod validation
- Per-IP hashed rate limit (Redis or memory)
- Provider call timeouts
- Env-based secrets; no third-party credentials
- Fetch logs omit sensitive data

## Local run

```bash
docker compose up -d
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

## Tests

- Unit: username validation, mock provider cases, cache TTL helpers
- Integration: search service statuses (mocked Prisma or test DB)
- Playwright: homepage → search `luna.travels` → profile → open story viewer

## Implementation order

1. Scaffold Next.js + tooling + Docker + Prisma
2. Domain + mock provider + cache + services
3. API routes
4. UI pages + story viewer + dark mode
5. Tests + README
6. Verify locally
