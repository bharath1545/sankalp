import { describe, it, expect } from "vitest";
import { decompose, countdownTo, pad2 } from "./countdown";

describe("decompose", () => {
  it("breaks 1 day 2 hours 3 minutes 4 seconds into parts", () => {
    const ms = 1 * 86_400_000 + 2 * 3_600_000 + 3 * 60_000 + 4 * 1_000;
    const result = decompose(ms);
    expect(result).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      remaining: ms,
    });
  });

  it("handles exact boundary (1 day)", () => {
    const result = decompose(86_400_000);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it("clamps negatives to zero", () => {
    const result = decompose(-5000);
    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.remaining).toBe(-5000);
  });

  it("handles zero", () => {
    const result = decompose(0);
    expect(result.remaining).toBe(0);
    expect(result.days).toBe(0);
  });

  it("handles large values (100+ days)", () => {
    const ms = 120 * 86_400_000 + 5 * 3_600_000;
    const result = decompose(ms);
    expect(result.days).toBe(120);
    expect(result.hours).toBe(5);
  });
});

describe("countdownTo", () => {
  it("returns positive values when target is in the future", () => {
    const now = new Date("2026-11-17T10:00:00+05:30");
    const target = new Date("2026-11-27T10:30:00+05:30");
    const result = countdownTo(target, now);
    expect(result.remaining).toBeGreaterThan(0);
    expect(result.days).toBe(10);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(0);
  });

  it("returns negative remaining when target is in the past", () => {
    const now = new Date("2026-11-28T12:00:00+05:30");
    const target = new Date("2026-11-27T10:30:00+05:30");
    const result = countdownTo(target, now);
    expect(result.remaining).toBeLessThan(0);
    expect(result.days).toBe(0);
  });

  it("returns zero when now equals target", () => {
    const t = new Date("2026-11-27T10:30:00+05:30");
    const result = countdownTo(t, t);
    expect(result.remaining).toBe(0);
    expect(result.days).toBe(0);
  });
});

describe("pad2", () => {
  it("pads single digit", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(5)).toBe("05");
    expect(pad2(9)).toBe("09");
  });

  it("does not pad two digits", () => {
    expect(pad2(10)).toBe("10");
    expect(pad2(59)).toBe("59");
  });

  it("does not pad three digits", () => {
    expect(pad2(100)).toBe("100");
  });
});
