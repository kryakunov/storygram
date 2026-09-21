# Future real provider — not implemented

This app is intentionally limited to **public** content and a **mock** story provider.

A live social-network source is **not** included because a safe, ToS-respecting, officially supported public-stories API is not available in this project, and this codebase will not:

- log into third-party accounts
- import session cookies
- access private profiles
- scrape or automate around platform protections
- evade rate limits, bot checks, or authentication

## How to add a legal provider later

1. Implement `StoryProvider` in a new file, e.g. `src/providers/licensed-provider.ts`.
2. Register it in `src/providers/registry.ts`.
3. Set `STORY_PROVIDER` to that name.
4. Keep the contract:
   - `getProfileByUsername`
   - `getActiveStories`
   - `healthCheck`
5. Reject private profiles in the provider **and** in `SearchService`.
6. Document the official API, rate limits, and licensing in this file.

Until those conditions are met, keep `STORY_PROVIDER=mock`.
