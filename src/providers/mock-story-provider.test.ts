import { describe, expect, it } from "vitest";
import { MockStoryProvider } from "@/providers/mock-story-provider";
import { MemoryCacheStore } from "@/lib/cache/memory";

describe("MockStoryProvider", () => {
  const provider = new MockStoryProvider();

  it("returns public profile with mixed stories", async () => {
    const profile = await provider.getProfileByUsername("luna.travels");
    const stories = await provider.getActiveStories("luna.travels");
    expect(profile.status).toBe("found");
    expect(stories.status).toBe("found");
    if (stories.status === "found") {
      expect(stories.stories.some((story) => story.mediaType === "image")).toBe(true);
      expect(stories.stories.some((story) => story.mediaType === "video")).toBe(true);
    }
  });

  it("returns no stories for a public empty profile", async () => {
    const stories = await provider.getActiveStories("quiet.garden");
    expect(stories.status).toBe("no_stories");
  });

  it("does not return stories for a private profile", async () => {
    const profile = await provider.getProfileByUsername("private.mode");
    const stories = await provider.getActiveStories("private.mode");
    expect(profile.status).toBe("private_profile");
    expect(stories.status).toBe("private_profile");
    if (stories.status === "private_profile") {
      expect("stories" in stories).toBe(false);
    }
  });

  it("returns not_found for unknown usernames", async () => {
    await expect(provider.getProfileByUsername("no.such.user")).resolves.toEqual({
      status: "not_found",
    });
  });

  it("simulates provider failure", async () => {
    await expect(provider.getProfileByUsername("down.stream")).rejects.toThrow(
      /outage/i,
    );
  });

  it("reports healthy", async () => {
    const health = await provider.healthCheck();
    expect(health.ok).toBe(true);
    expect(health.name).toBe("mock");
  });
});

describe("MemoryCacheStore", () => {
  it("expires keys after ttl", async () => {
    const cache = new MemoryCacheStore();
    await cache.set("k", "v", 1);
    expect(await cache.get("k")).toBe("v");
    await cache.set("gone", "x", 0);
    expect(await cache.get("gone")).toBeNull();
  });
});
