import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("Rate Limiting Module", () => {
  it("cho phép các request trong giới hạn cho phép", () => {
    const id = `test-user-${Date.now()}`;
    const res1 = checkRateLimit(id, { limit: 3, windowMs: 10000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(id, { limit: 3, windowMs: 10000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(id, { limit: 3, windowMs: 10000 });
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("chặn các request vượt quá giới hạn", () => {
    const id = `test-blocked-${Date.now()}`;
    checkRateLimit(id, { limit: 2, windowMs: 10000 });
    checkRateLimit(id, { limit: 2, windowMs: 10000 });

    const blocked = checkRateLimit(id, { limit: 2, windowMs: 10000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
