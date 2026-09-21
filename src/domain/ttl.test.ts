import { describe, expect, it } from "vitest";
import { expiresAtFromTtl, isExpired } from "@/domain/ttl";

describe("ttl helpers", () => {
  it("computes expiry from now", () => {
    const from = new Date("2026-01-01T00:00:00.000Z");
    expect(expiresAtFromTtl(60, from).toISOString()).toBe(
      "2026-01-01T00:01:00.000Z",
    );
  });

  it("detects expired timestamps", () => {
    expect(isExpired(new Date("2020-01-01"), new Date("2021-01-01"))).toBe(true);
    expect(isExpired(new Date("2022-01-01"), new Date("2021-01-01"))).toBe(false);
  });
});
