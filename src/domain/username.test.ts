import { describe, expect, it } from "vitest";
import { parseUsername, usernameSchema } from "@/domain/username";

describe("username validation", () => {
  it("accepts typical public handles and lowercases them", () => {
    expect(parseUsername("Luna.Travels")).toEqual({
      ok: true,
      username: "luna.travels",
    });
    expect(usernameSchema().parse("cafe_neon")).toBe("cafe_neon");
  });

  it("rejects empty, oversized, or malformed usernames", () => {
    expect(parseUsername("")).toMatchObject({ ok: false });
    expect(parseUsername(".leading")).toMatchObject({ ok: false });
    expect(parseUsername("trailing.")).toMatchObject({ ok: false });
    expect(parseUsername("double..dot")).toMatchObject({ ok: false });
    expect(parseUsername("bad name")).toMatchObject({ ok: false });
    expect(parseUsername("a".repeat(31))).toMatchObject({ ok: false });
  });
});
