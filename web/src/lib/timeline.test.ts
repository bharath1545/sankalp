import { milestoneTime, timelineState } from "./timeline";

const times = [
  milestoneTime("2026-11-15"),
  milestoneTime("2026-11-20"),
  milestoneTime("2026-11-25"),
  milestoneTime("2026-11-27T10:30:00+05:30"),
];

describe("milestoneTime", () => {
  it("reads a plain date as midnight IST", () => {
    expect(milestoneTime("2026-11-15")).toBe(Date.parse("2026-11-15T00:00:00+05:30"));
  });
  it("keeps a full ISO value as given", () => {
    expect(milestoneTime("2026-11-27T10:30:00+05:30")).toBe(
      Date.parse("2026-11-27T10:30:00+05:30"),
    );
  });
  it("throws on bad input", () => {
    expect(() => milestoneTime("soon")).toThrow(RangeError);
  });
});

describe("timelineState", () => {
  it("before everything: nothing passed, first is next", () => {
    const s = timelineState(times, Date.parse("2026-11-01T00:00:00+05:30"));
    expect(s.passed).toEqual([false, false, false, false]);
    expect(s.next).toBe(0);
    expect(s.litTo).toBe(0);
  });
  it("18 Nov: first passed, second is next", () => {
    const s = timelineState(times, Date.parse("2026-11-18T09:00:00+05:30"));
    expect(s.passed).toEqual([true, false, false, false]);
    expect(s.next).toBe(1);
    expect(s.litTo).toBe(1);
  });
  it("milestone counts as passed at its own start", () => {
    const s = timelineState(times, Date.parse("2026-11-20T00:00:00+05:30"));
    expect(s.passed).toEqual([true, true, false, false]);
  });
  it("after the event: all passed, no next, lit to the end", () => {
    const s = timelineState(times, Date.parse("2026-11-28T12:00:00+05:30"));
    expect(s.passed.every(Boolean)).toBe(true);
    expect(s.next).toBe(-1);
    expect(s.litTo).toBe(3);
  });
});
