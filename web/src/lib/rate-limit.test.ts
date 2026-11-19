import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit then blocks", () => {
    const l = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect([1, 2, 3, 4].map(() => l.allow("a", 0))).toEqual([true, true, true, false]);
  });

  it("counts each key separately", () => {
    const l = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(l.allow("a", 0)).toBe(true);
    expect(l.allow("b", 0)).toBe(true);
    expect(l.allow("a", 1)).toBe(false);
  });

  it("allows again after the window passes", () => {
    const l = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(l.allow("a", 0)).toBe(true);
    expect(l.allow("a", 999)).toBe(false);
    expect(l.allow("a", 1000)).toBe(true);
  });

  it("does not count blocked calls against the window", () => {
    const l = createRateLimiter({ limit: 1, windowMs: 1000 });
    l.allow("a", 0);
    l.allow("a", 500);
    expect(l.allow("a", 1000)).toBe(true);
  });

  it("drops idle keys when it grows past maxKeys", () => {
    const l = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    l.allow("a", 0);
    l.allow("b", 0);
    l.allow("c", 5000); // triggers cleanup of a and b
    expect(l.allow("a", 5001)).toBe(true);
  });
});
