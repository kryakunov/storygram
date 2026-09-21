# Public Story Viewer

Local-first MVP for viewing **currently available public stories** from **public** profiles. End users do not log into a social network. Private accounts are rejected. A real third-party provider is not included; a mock provider drives the full server-side flow.

## What this is

- Search a public username
- See profile summary, active image/video stories, last-checked time, and provider status
- Persist recent searches and cache results
- Handle not found, no stories, private profiles, provider downtime, and rate limits

## What this is not

- Not a private-account viewer
- Not Instagram login, cookie import, or session hijacking
- Not a scraper or anti-bot bypass
- Not a guarantee of continuous access to any live social network

Availability always depends on the configured provider. Today that provider is `mock`.

## Architecture

```
UI (App Router pages)
  → API route handlers (Zod contracts)
    → SearchService / HealthService
      → StoryProvider (interface)
          → MockStoryProvider (implemented)
          → future legal provider (see src/providers/TODO.md)
      → CacheStore (Redis, or in-memory fallback)
      → Prisma persistence (Postgres when available)
```

Layers live under `src/`:

| Layer | Path |
| --- | --- |
| UI | `src/app`, `src/components` |
| Application | `src/services` |
| Domain | `src/domain` |
| Providers | `src/providers` |
| Persistence / infra | `src/lib`, `prisma` |

## Язык

Интерфейс по умолчанию на русском. В шапке можно переключить RU / EN; выбор сохраняется в cookie `locale`.

## SEO (Яндекс)

Посадочная заточена под кластер «смотреть сторис Инстаграм анонимно / онлайн / бесплатно / без регистрации».

Чтобы страницы вообще попали в выдачу:

1. Выложите сайт на https-домен.
2. Укажите боевой URL в `NEXT_PUBLIC_APP_URL`.
3. Добавьте сайт в [Яндекс.Вебмастер](https://webmaster.yandex.ru/), вставьте код в `YANDEX_VERIFICATION`.
4. Отправьте `https://ваш-домен/sitemap.xml`.
5. On-page SEO не гарантирует 1-е место: нужны индекс, ссылки и то, что пользователь реально находит сторис.

Закрытые аккаунты и обход Instagram в выдаче не обещаем.

## Local setup

Requires Node 20+ and npm (pnpm works if you have it). Docker is optional for this mock MVP.

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search `luna.travels`.

For durable search history, Postgres cache rows, and Redis:

```bash
docker compose up -d
npx prisma migrate dev
npx prisma db seed
```

If Docker is not running, the app still serves mock public stories. Cache falls back to memory and recent searches stay in-process.

pnpm is declared in `packageManager` if you prefer it:

```bash
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

## Environment variables

| `NEXT_PUBLIC_APP_URL` | Public site URL for canonical, sitemap, Open Graph |
| `YANDEX_VERIFICATION` | Yandex Webmaster verification code |
| `GOOGLE_SITE_VERIFICATION` | Optional Google verification code |

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection |
| `REDIS_URL` | Redis connection; memory cache is used if Redis is unreachable |
| `STORY_PROVIDER` | Provider id. Only `mock` is implemented |
| `IP_HASH_SALT` | Salt for hashing request IPs before storage |
| `RATE_LIMIT_MAX` | Max searches per IP hash in the window |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window |
| `PROVIDER_TIMEOUT_MS` | Provider call timeout |
| `ADMIN_TOKEN` | Optional gate for `/admin` and `/api/admin/status` |
| `APP_ENV` | Shown on the admin page |

## Seeded demo usernames

| Username | Result |
| --- | --- |
| `luna.travels` | Public, mixed image + video stories |
| `cafe.neon` | Public, image stories |
| `city.lights` | Public, video-heavy stories |
| `quiet.garden` | Public, no active stories |
| `private.mode` | Private — rejected, stories never returned |
| `down.stream` | Simulated provider outage |
| anything else | `not_found` |

## Pages

- `/` landing
- `/search?u=luna.travels` results + story viewer
- `/recent` search history and saved searches
- `/admin` provider health, cache, fetch logs, demo usernames
- `/pricing` billing placeholder (coming soon)

## API

- `GET /api/health`
- `GET /api/provider/health`
- `POST /api/search` `{ "username": "luna.travels" }`
- `GET /api/profile/[username]`
- `GET /api/profile/[username]/stories`
- `GET /api/recent-searches`
- `GET /api/admin/status`
- `GET/POST/DELETE /api/saved-searches`

Statuses: `success`, `no_stories`, `not_found`, `private_profile`, `provider_unavailable`, `invalid_username`, `rate_limited`.

## Caching

| Item | TTL |
| --- | --- |
| Profile | 10 minutes |
| Story metadata | 3 minutes |
| Failed lookups | 1 minute |
| Provider health | 30 seconds |

Redis if reachable; otherwise an in-memory store with the same interface.

## Tests

```bash
npm test          # Vitest unit/integration
npx playwright install chromium
npm run test:e2e  # homepage → luna.travels → story viewer
```

Playwright starts `npm run dev` unless a server is already running.

## Known limitations

- Only the mock provider is implemented. A live source needs an official, licensed API — see `src/providers/TODO.md`.
- Admin is open in local MVP unless `ADMIN_TOKEN` is set.
- Billing is not implemented (`src/billing/TODO.md`).
- Demo video uses a tiny generated clip; if it cannot be generated, the viewer shows a media fallback.
- Search history is lost if Postgres is not running.
- Rate limiting is a simple per-IP-hash counter, not a production WAF.

## Next steps for productionization

1. Add authentication and lock down `/admin`
2. Implement a legal provider against the `StoryProvider` interface
3. Add billing without mixing it into the provider layer
4. Tighten rate limiting (edge + Redis token bucket)
5. Add observability (structured logs already exist; add metrics/tracing)
6. Back up Postgres and set cache key prefixes per environment
7. Review robots, terms, and data-retention policy before any public deploy

## Compliance notes

This project is designed so it can run without contacting social networks. Do not add credential collection, private-profile access, or scraping-evasion behavior.
