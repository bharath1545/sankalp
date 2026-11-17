import { formatDate, formatRange } from "./dates";

describe("formatDate", () => {
  it("formats a plain date", () => {
    expect(formatDate("2026-11-15")).toBe("15 November 2026");
  });
  it("drops a leading zero on the day", () => {
    expect(formatDate("2026-01-05")).toBe("5 January 2026");
  });
  it("ignores time text after the date", () => {
    expect(formatDate("2026-11-27T10:30:00+05:30")).toBe("27 November 2026");
  });
  it.each(["", "27/11/2026", "2026-13-01", "2026-00-10", "2026-11-00", "2026-11-32"])(
    "throws on bad input %j",
    (bad) => {
      expect(() => formatDate(bad)).toThrow(RangeError);
    },
  );
});

describe("formatRange", () => {
  it("shares month and year in the same month", () => {
    expect(formatRange("2026-11-27T10:30:00+05:30", "2026-11-28")).toBe(
      "27–28 November 2026",
    );
  });
  it("collapses a one-day range", () => {
    expect(formatRange("2026-11-27", "2026-11-27")).toBe("27 November 2026");
  });
  it("shares the year across months", () => {
    expect(formatRange("2026-11-30", "2026-12-01")).toBe("30 November – 1 December 2026");
  });
  it("shows both years across years", () => {
    expect(formatRange("2026-12-31", "2027-01-01")).toBe(
      "31 December 2026 – 1 January 2027",
    );
  });
});
