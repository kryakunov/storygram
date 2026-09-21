import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { getConfig } from "@/lib/config";
import { getAdminSnapshot } from "@/services/health-service";

function authorize(request: NextRequest): boolean {
  const token = getConfig().adminToken;
  if (!token) return true;
  const header = request.headers.get("x-admin-token");
  const query = request.nextUrl.searchParams.get("token");
  return header === token || query === token;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return jsonError("error", "Admin token required.", 401);
  }
  const snapshot = await getAdminSnapshot();
  return jsonOk(snapshot);
}
