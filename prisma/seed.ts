import { PrismaClient, SearchStatus } from "@prisma/client";
import { DEMO_PROFILES, toPublicProfile, toPublicStories } from "../src/providers/catalog";
import { CACHE_TTL_SECONDS, expiresAtFromTtl } from "../src/domain/ttl";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  await prisma.appSetting.upsert({
    where: { key: "provider" },
    create: { key: "provider", value: "mock" },
    update: { value: "mock" },
  });
  await prisma.providerState.upsert({
    where: { providerName: "mock" },
    create: {
      providerName: "mock",
      isHealthy: true,
      lastCheckedAt: now,
      message: "Seeded mock provider",
    },
    update: {
      isHealthy: true,
      lastCheckedAt: now,
      message: "Seeded mock provider",
    },
  });

  for (const seed of DEMO_PROFILES) {
    const profile = toPublicProfile(seed);
    const cached = await prisma.profileCache.upsert({
      where: {
        username_providerName: { username: seed.username, providerName: "mock" },
      },
      create: {
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        isPublic: profile.isPublic,
        providerName: "mock",
        fetchedAt: now,
        expiresAt: expiresAtFromTtl(CACHE_TTL_SECONDS.profile, now),
      },
      update: {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        isPublic: profile.isPublic,
        fetchedAt: now,
        expiresAt: expiresAtFromTtl(CACHE_TTL_SECONDS.profile, now),
      },
    });

    await prisma.storyCache.deleteMany({
      where: { username: seed.username, providerName: "mock" },
    });
    const stories =
      seed.scenario === "private" || seed.scenario === "unavailable"
        ? []
        : toPublicStories(seed, now);
    if (stories.length) {
      await prisma.storyCache.createMany({
        data: stories.map((story) => ({
          profileId: cached.id,
          username: seed.username,
          providerName: "mock",
          providerStoryId: story.providerStoryId,
          mediaType: story.mediaType,
          mediaUrl: story.mediaUrl,
          thumbnailUrl: story.thumbnailUrl,
          caption: story.caption,
          createdAtRemote: story.createdAtRemote,
          expiresAtRemote: story.expiresAtRemote,
          fetchedAt: now,
          expiresAt: expiresAtFromTtl(CACHE_TTL_SECONDS.stories, now),
        })),
      });
    }

    const status: SearchStatus =
      seed.scenario === "unavailable"
        ? "provider_unavailable"
        : seed.scenario === "private"
          ? "private_profile"
          : stories.length
            ? "success"
            : "no_stories";

    await prisma.searchQuery.create({
      data: {
        username: seed.username,
        status,
        providerName: "mock",
        errorMessage:
          status === "success" || status === "no_stories" ? null : status,
      },
    });
  }

  console.log(`Seeded ${DEMO_PROFILES.length} demo profiles.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
