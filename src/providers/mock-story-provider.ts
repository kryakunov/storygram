import type {
  ProfileLookup,
  ProviderHealth,
  StoriesLookup,
} from "@/domain/types";
import {
  findDemoProfile,
  toPublicProfile,
  toPublicStories,
} from "@/providers/catalog";
import {
  ProviderUnavailableError,
  type StoryProvider,
} from "@/providers/story-provider";

const LATENCY_MS = 80;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockStoryProvider implements StoryProvider {
  readonly name = "mock";

  async getProfileByUsername(username: string): Promise<ProfileLookup> {
    await wait(LATENCY_MS);
    const seed = findDemoProfile(username);
    if (!seed) {
      return { status: "not_found" };
    }
    if (seed.scenario === "unavailable") {
      throw new ProviderUnavailableError(
        "Mock provider simulated an upstream outage for down.stream",
      );
    }
    if (seed.scenario === "private" || !seed.isPublic) {
      return { status: "private_profile", profile: toPublicProfile(seed) };
    }
    return { status: "found", profile: toPublicProfile(seed) };
  }

  async getActiveStories(username: string): Promise<StoriesLookup> {
    await wait(LATENCY_MS);
    const seed = findDemoProfile(username);
    if (!seed) {
      return { status: "not_found" };
    }
    if (seed.scenario === "unavailable") {
      return {
        status: "provider_unavailable",
        message: "Mock provider simulated an upstream outage for down.stream",
      };
    }
    if (seed.scenario === "private" || !seed.isPublic) {
      return { status: "private_profile" };
    }
    const stories = toPublicStories(seed).filter(
      (story) => story.expiresAtRemote.getTime() > Date.now(),
    );
    if (stories.length === 0) {
      return { status: "no_stories" };
    }
    return { status: "found", stories };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      name: this.name,
      ok: true,
      message: "Mock provider is local and always healthy.",
      checkedAt: new Date(),
    };
  }
}
