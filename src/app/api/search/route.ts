import { NextRequest } from "next/server";
import { httpStatusFor, jsonError, jsonOk, searchRequestSchema } from "@/lib/api";
import { clientIpFromHeaders, hashIp } from "@/lib/hash";
import { searchPublicStories } from "@/services/search-service";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_username", "JSON body is required.", 400);
  }

  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "invalid_username",
      parsed.error.issues[0]?.message ?? "Invalid username",
      400,
    );
  }

  const result = await searchPublicStories({
    username: parsed.data.username,
    ipHash: hashIp(clientIpFromHeaders(request.headers)),
  });

  return jsonOk(result, httpStatusFor(result.status));
}
