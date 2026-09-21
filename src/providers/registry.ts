import { getConfig } from "@/lib/config";
import { MockStoryProvider } from "@/providers/mock-story-provider";
import type { StoryProvider } from "@/providers/story-provider";

const providers: Record<string, () => StoryProvider> = {
  mock: () => new MockStoryProvider(),
};

let cached: StoryProvider | null = null;

export function getStoryProvider(): StoryProvider {
  if (cached) return cached;
  const name = getConfig().storyProvider;
  const factory = providers[name];
  if (!factory) {
    throw new Error(
      `Unknown STORY_PROVIDER "${name}". Only "mock" is implemented. See src/providers/TODO.md.`,
    );
  }
  cached = factory();
  return cached;
}

export function listRegisteredProviders(): string[] {
  return Object.keys(providers);
}
