import type {
  ProfileLookup,
  ProviderHealth,
  StoriesLookup,
} from "@/domain/types";

export interface StoryProvider {
  readonly name: string;
  getProfileByUsername(username: string): Promise<ProfileLookup>;
  getActiveStories(username: string): Promise<StoriesLookup>;
  healthCheck(): Promise<ProviderHealth>;
}

export class ProviderUnavailableError extends Error {
  constructor(message = "Story provider is temporarily unavailable") {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

export class ProviderTimeoutError extends Error {
  constructor(message = "Story provider timed out") {
    super(message);
    this.name = "ProviderTimeoutError";
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new ProviderTimeoutError(`Timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
