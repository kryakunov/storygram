import { jsonOk } from "@/lib/api";
import { getPersistence } from "@/lib/persistence";

export async function GET() {
  const items = await (await getPersistence()).readRecentSearches(25);
  return jsonOk({
    items: items.map((item) => ({
      id: item.id,
      username: item.username,
      status: item.status,
      searchedAt: item.searchedAt.toISOString(),
      providerName: item.providerName,
      errorMessage: item.errorMessage,
    })),
  });
}
