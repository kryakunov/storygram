import { NextRequest } from "next/server";
import { httpStatusFor, jsonError, jsonOk } from "@/lib/api";
import { parseUsername } from "@/domain/username";
import { clientIpFromHeaders, hashIp } from "@/lib/hash";
import { searchPublicStories } from "@/services/search-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  const { username: raw } = await context.params;
  const parsed = parseUsername(raw);
  if (!parsed.ok) {
    return jsonError("invalid_username", parsed.error, 400);
  }

  const result = await searchPublicStories({
    username: parsed.username,
    ipHash: hashIp(clientIpFromHeaders(request.headers)),
  });

  return jsonOk(
    {
      status: result.status,
      username: result.username,
      providerName: result.providerName,
      fetchedAt: result.fetchedAt,
      cache: result.cache,
      stories: result.stories,
      errorMessage: result.errorMessage,
    },
    httpStatusFor(result.status),
  );
}
