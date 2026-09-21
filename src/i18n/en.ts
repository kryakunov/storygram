import type { Dictionary } from "@/i18n/ru";

export const en: Dictionary = {
  appName: "Anonymous stories",
  nav: {
    search: "Search",
    recent: "Recent",
    admin: "Admin",
    pricing: "Pricing",
  },
  footer: {
    publicOnly:
      "Anonymous Instagram story viewing is limited to public profiles. Private accounts are not supported.",
    noPrivate:
      "This service is not affiliated with Instagram or Meta. No account login or sign-up is required.",
    linksTitle: "Sections",
    watchAnon: "Watch stories anonymously",
    onlineFree: "Online, free, no registration",
  },
  theme: {
    toggle: "Toggle theme",
    light: "Switch to light mode",
    dark: "Switch to dark mode",
  },
  language: {
    label: "Language",
    ru: "Русский",
    en: "English",
  },
  home: {
    badge: "Online · free · no sign-up",
    headline: "Watch Instagram stories anonymously",
    description:
      "Watch Instagram stories anonymously online for free and without registration. You do not log into Instagram. Only public profiles and stories returned by the configured provider are shown.",
    tryDemo: "Try demo: luna.travels",
    recentCta: "Recent searches",
    demoTitle: "Demo accounts",
    featuresTitle: "Watch Instagram stories anonymously online for free",
    features: [
      {
        title: "Anonymous",
        body: "You do not need to log into Instagram. The app never asks for your password or session.",
      },
      {
        title: "Online and free",
        body: "Watch in the browser. No app install and no billing on this MVP.",
      },
      {
        title: "No registration",
        body: "Enter a public username and check for active public stories right away.",
      },
    ],
    howTitle: "How to watch Instagram stories anonymously online",
    howSteps: [
      "Open the service in a browser — no sign-up.",
      "Enter a public username.",
      "If the provider has active public stories, they open in the viewer: photos, videos, next/previous.",
    ],
    limitsTitle: "What you can and cannot watch",
    limitsBody:
      "This product matches the intent “watch Instagram stories anonymously”, but only for public profiles. Private accounts are rejected. If a provider is unavailable or a profile is not found, the app shows that status instead of bypassing Instagram protections.",
    faqTitle: "FAQ",
    faq: [
      {
        question: "Can I watch Instagram stories anonymously?",
        answer:
          "Yes, in the sense that you do not log into your Instagram account. Only public stories available through the configured provider are shown.",
      },
      {
        question: "How do I watch stories anonymously online for free?",
        answer:
          "Open the homepage, enter a public username, and press “View stories”. It runs in the browser with no app and no payment.",
      },
      {
        question: "Do I need to register?",
        answer:
          "No. Anonymous story viewing does not require registration.",
      },
      {
        question: "Can I watch stories from a private account?",
        answer:
          "No. Private profiles are not supported. The app does not bypass privacy or import someone else’s session.",
      },
      {
        question: "Is this official Instagram?",
        answer:
          "No. The service is not affiliated with Instagram or Meta. It is an independent viewer for public stories without account login.",
      },
    ],
  },
  search: {
    title: "Search public stories",
    subtitle:
      "Look up a public username. The mock provider returns seeded demo data through the real server-side search flow.",
    placeholder: "Enter a public username",
    usernameLabel: "Public username",
    submit: "View stories",
    emptyPrompt: "Enter a username to check for currently available public stories.",
    lastChecked: "Last checked",
    provider: "provider",
    profileCache: "profile cache",
    storiesCache: "stories cache",
    cacheHit: "hit",
    cacheMiss: "miss",
    cacheSkipped: "skipped",
    refresh: "Refresh",
    copyLink: "Copy link",
    save: "Save",
    copied: "Results link copied",
    saved: "Saved @{username}",
    saveFailed: "Could not save search",
    searchFailed: "Search failed",
    apiUnreachable: "Could not reach the search API",
    tryDemo: "Try demo username luna.travels",
    loadFailed: "Could not load results for @{username}.",
  },
  disclaimer: {
    title: "Public content only",
    body: "This app supports currently available stories from public profiles. Availability depends on the configured provider or source. There is no guarantee of continuous access, and private accounts are never fetched.",
  },
  profile: {
    public: "public",
    private: "private",
    avatarAlt: "{name} avatar",
    followers: "{count} followers (provider label)",
  },
  stories: {
    empty: "No currently available stories for this public profile.",
    untitled: "Untitled story",
    storyN: "Story {n}",
    posted: "Posted {time}",
    expires: "expires {time}",
    image: "image",
    video: "video",
    previous: "Previous story",
    next: "Next story",
    close: "Close story viewer",
    unavailable: "Media is unavailable for this demo story.",
    viewerTitle: "Story {current} of {total}: {caption}",
  },
  status: {
    success: {
      title: "Active public stories",
      description: "These items are currently available from a public profile.",
      label: "success",
    },
    no_stories: {
      title: "No active stories",
      description: "This public profile has no currently available stories.",
      label: "no stories",
    },
    not_found: {
      title: "Profile not found",
      description: "The provider does not have a public profile for this username.",
      label: "not found",
    },
    private_profile: {
      title: "Private profile",
      description:
        "This app only supports public profiles. Private accounts are never fetched.",
      label: "private",
    },
    provider_unavailable: {
      title: "Provider unavailable",
      description:
        "The configured story source is down or timed out. Try again shortly.",
      label: "unavailable",
    },
    invalid_username: {
      title: "Invalid username",
      description: "Use 1–30 characters: letters, numbers, periods, or underscores.",
      label: "invalid",
    },
    rate_limited: {
      title: "Too many requests",
      description: "Please wait a minute before searching again.",
      label: "rate limited",
    },
  },
  validation: {
    required: "Username is required",
    tooLong: "Username must be 30 characters or fewer",
    invalid:
      "Use letters, numbers, periods, or underscores. No leading, trailing, or double periods.",
  },
  recent: {
    title: "Recent searches",
    subtitle: "Latest lookups, including success, empty, not found, and provider issues.",
    saved: "Saved",
    empty: "No searches yet. Try",
  },
  admin: {
    title: "Admin / debug",
    subtitle: "Local MVP diagnostics. Gate this page with ADMIN_TOKEN before exposing it.",
    loading: "Loading admin snapshot…",
    unavailable: "Admin status unavailable",
    environment: "Environment",
    database: "Database",
    reachable: "reachable",
    unavailableDb: "unavailable",
    cache: "Cache",
    keys: "keys",
    rateLimit: "Rate limit",
    provider: "Provider",
    selected: "Selected",
    registered: "Registered",
    health: "Health",
    ok: "ok",
    down: "down",
    checked: "Checked",
    demoUsernames: "Seeded demo usernames",
    fetchLogs: "Recent fetch logs",
    noLogs: "No fetch logs yet.",
  },
  pricing: {
    title: "Pricing",
    intro:
      "Billing is not implemented. This page is a placeholder so a paid tier can be added later without changing the story-provider architecture.",
    publicTitle: "Public lookup",
    publicSoon: "Coming soon as a free tier.",
    publicNote: "Public profiles only. Rate-limited.",
    teamsTitle: "Teams",
    teamsSoon: "Coming soon.",
    teamsNote: "Higher volume, saved workspaces, audit exports.",
  },
  errors: {
    somethingWrong: "Something went wrong",
    tryAgain: "Try again",
    notFound: "Page not found",
    notFoundBody: "That route does not exist in this MVP.",
    backHome: "Back to home",
  },
  relative: {
    justNow: "just now",
  },
  scenario: {
    stories: "stories",
    no_stories: "no stories",
    private: "private",
    unavailable: "unavailable",
  },
  demo: {
    notes: {
      "luna.travels": "Public profile with mixed image and video stories.",
      "cafe.neon": "Public profile with image-only stories.",
      "city.lights": "Public profile with video-heavy stories.",
      "quiet.garden": "Public profile with no currently active stories.",
      "private.mode": "Private profile. Stories are never returned.",
      "down.stream": "Simulates a temporary provider failure.",
    },
    bios: {
      "luna.travels": "Public travel diary. Coastal light, trains, and late markets.",
      "cafe.neon": "Neighborhood coffee shop. Daily specials, public storefront only.",
      "city.lights": "Public architecture walks after dark.",
      "quiet.garden": "Public botanical notes. Slow plants, no stories today.",
      "private.mode": "This account is private. The app must refuse it.",
      "down.stream": "Used to simulate provider downtime.",
    },
    captions: {
      "luna-sunrise": "Sunrise over the ferry dock",
      "luna-market": "Night market walk-through",
      "luna-train": "Window seat, last carriage",
      "cafe-pour": "Oat cortado, extra foam",
      "cafe-window": "Rain on the shop window",
      "city-bridge": "Bridge lights at 1am",
      "city-metro": "Metro line 4, last train",
      "city-skyline": "Fog on the high-rises",
      "private-hidden": "Should never be returned",
    },
  },
};
