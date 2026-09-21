import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { parseUsername } from "@/domain/username";
import { getPersistence } from "@/lib/persistence";

export async function GET() {
  const items = await (await getPersistence()).listSavedSearches();
  return jsonOk({
    items: items.map((item) => ({
      username: item.username,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { username?: string } | null;
  const parsed = parseUsername(body?.username ?? "");
  if (!parsed.ok) {
    return jsonError("invalid_username", parsed.error, 400);
  }
  await (await getPersistence()).saveSearch(parsed.username);
  return jsonOk({ ok: true, username: parsed.username });
}

export async function DELETE(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username") ?? "";
  const parsed = parseUsername(username);
  if (!parsed.ok) {
    return jsonError("invalid_username", parsed.error, 400);
  }
  await (await getPersistence()).removeSavedSearch(parsed.username);
  return jsonOk({ ok: true, username: parsed.username });
}
