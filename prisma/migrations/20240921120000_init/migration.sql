-- CreateEnum
CREATE TYPE "SearchStatus" AS ENUM (
  'success',
  'no_stories',
  'not_found',
  'private_profile',
  'provider_unavailable',
  'invalid_username',
  'rate_limited'
);

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "status" "SearchStatus" NOT NULL,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requesterIpHash" TEXT,
    "providerName" TEXT NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileCache" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "isPublic" BOOLEAN NOT NULL,
    "providerName" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryCache" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerStoryId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "caption" TEXT,
    "createdAtRemote" TIMESTAMP(3) NOT NULL,
    "expiresAtRemote" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FetchLog" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "resultStatus" "SearchStatus" NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorDetails" TEXT,

    CONSTRAINT "FetchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderState" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "isHealthy" BOOLEAN NOT NULL,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT,

    CONSTRAINT "ProviderState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileCache_username_providerName_key" ON "ProfileCache"("username", "providerName");
CREATE INDEX "ProfileCache_expiresAt_idx" ON "ProfileCache"("expiresAt");
CREATE INDEX "SearchQuery_searchedAt_idx" ON "SearchQuery"("searchedAt");
CREATE INDEX "SearchQuery_username_idx" ON "SearchQuery"("username");
CREATE UNIQUE INDEX "StoryCache_providerName_providerStoryId_key" ON "StoryCache"("providerName", "providerStoryId");
CREATE INDEX "StoryCache_username_idx" ON "StoryCache"("username");
CREATE INDEX "StoryCache_expiresAt_idx" ON "StoryCache"("expiresAt");
CREATE INDEX "FetchLog_createdAt_idx" ON "FetchLog"("createdAt");
CREATE INDEX "FetchLog_username_idx" ON "FetchLog"("username");
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");
CREATE UNIQUE INDEX "ProviderState_providerName_key" ON "ProviderState"("providerName");
CREATE UNIQUE INDEX "SavedSearch_username_key" ON "SavedSearch"("username");

ALTER TABLE "StoryCache" ADD CONSTRAINT "StoryCache_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProfileCache"("id") ON DELETE CASCADE ON UPDATE CASCADE;
