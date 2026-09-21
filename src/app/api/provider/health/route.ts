import { jsonOk } from "@/lib/api";
import { getProviderHealth } from "@/services/health-service";

export async function GET() {
  const health = await getProviderHealth();
  return jsonOk(
    {
      ...health,
      checkedAt: health.checkedAt.toISOString(),
    },
    health.ok ? 200 : 503,
  );
}
