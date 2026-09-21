# Billing — not implemented

Pricing is a placeholder (`/pricing`). No Stripe, no subscriptions, no entitlements.

When adding billing later:

- Keep search of **public** stories working without an account for a free tier, or gate volume behind auth.
- Add `User`, `Plan`, and `Subscription` models without mixing them into `StoryProvider`.
- Put payment webhooks under `src/app/api/billing/`.
- Do not store third-party social credentials alongside billing data.
