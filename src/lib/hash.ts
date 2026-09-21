import { createHash } from "node:crypto";
import { getConfig } from "@/lib/config";

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const trimmed = ip.trim();
  if (!trimmed) return null;
  return createHash("sha256")
    .update(`${getConfig().ipHashSalt}:${trimmed}`)
    .digest("hex");
}

export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return headers.get("x-real-ip");
}
