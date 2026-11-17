import {
  LOADER_HOLD_PERCENT,
  LOADER_SAFETY_MS,
  easeProgress,
  nextProgress,
} from "./loader-timing";

const MIN = 2400;

function next(overrides: Partial<Parameters<typeof nextProgress>[0]> = {}) {
  return nextProgress({ elapsed: 0, minMs: MIN, loaded: false, shown: 0, ...overrides });
}

describe("easeProgress", () => {
  it("starts at 0, ends at 1 and rises in between", () => {
    expect(easeProgress(0)).toBe(0);
    expect(easeProgress(1)).toBe(1);
    const half = easeProgress(0.5);
    expect(half).toBeGreaterThan(0.5);
    expect(half).toBeLessThan(1);
  });

  it("clamps values outside 0 to 1", () => {
    expect(easeProgress(-3)).toBe(0);
    expect(easeProgress(9)).toBe(1);
  });
});

describe("nextProgress", () => {
  it("rises while the page is still loading", () => {
    expect(next({ elapsed: 200 })).toBeGreaterThan(0);
    expect(next({ elapsed: 200 })).toBeLessThan(40);
  });

  it("holds at 92% until the page is ready", () => {
    // Well past the minimum time but the page has not finished loading.
    const shown = next({ elapsed: 6000, loaded: false, shown: LOADER_HOLD_PERCENT });
    expect(shown).toBeLessThanOrEqual(LOADER_HOLD_PERCENT);
  });

  it("never reaches 100% before the minimum time even when ready", () => {
    let shown = 0;
    for (let elapsed = 0; elapsed < MIN; elapsed += 16) {
      shown = next({ elapsed, loaded: true, shown });
      expect(shown).toBeLessThan(100);
    }
  });

  it("finishes once ready and the minimum time has passed", () => {
    let shown = 0;
    for (let elapsed = 0; elapsed <= MIN + 400; elapsed += 16) {
      shown = next({ elapsed, loaded: true, shown });
    }
    expect(shown).toBe(100);
  });

  it("finishes at the safety cap even if the page never reports ready", () => {
    const shown = next({
      elapsed: LOADER_SAFETY_MS,
      loaded: false,
      shown: LOADER_HOLD_PERCENT,
    });
    expect(shown).toBeGreaterThan(LOADER_HOLD_PERCENT);
  });

  it("follows the target exactly with reduced motion, no easing", () => {
    const target = easeProgress(500 / MIN) * 100;
    expect(next({ elapsed: 500, loaded: true, reducedMotion: true })).toBeCloseTo(target);
    expect(next({ elapsed: MIN, loaded: true, reducedMotion: true })).toBe(100);
    expect(
      next({ elapsed: 200, loaded: false, reducedMotion: true }),
    ).toBeLessThanOrEqual(LOADER_HOLD_PERCENT);
  });

  it("never goes backwards", () => {
    let shown = 0;
    for (let elapsed = 0; elapsed <= MIN + 800; elapsed += 16) {
      const value = next({ elapsed, loaded: elapsed > 1000, shown });
      expect(value).toBeGreaterThanOrEqual(shown);
      shown = value;
    }
  });
});
