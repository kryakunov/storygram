import { getConfig } from "@/lib/config";
import { isDatabaseReachable } from "@/lib/prisma";
import { getCacheStore } from "@/lib/cache";
import { jsonOk } from "@/lib/api";

export async function GET() {
  const [db, cache] = await Promise.all([
    isDatabaseReachable(),
    getCacheStore().then((store) => store.ping().catch(() => false)),
  ]);
  const healthy = db && cache;
  return jsonOk(
    {
      ok: healthy,
      app: getConfig().appName,
      env: getConfig().appEnv,
      checks: {
        database: db,
        cache,
      },
    },
    healthy ? 200 : 503,
  );
}
