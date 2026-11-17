import { dateText, formatInr, siteConfig } from "./config";

describe("siteConfig", () => {
  it("matches the poster facts", () => {
    expect(siteConfig.feePerTeamInr).toBe(600);
    expect(siteConfig.prizePoolInr).toBe(75000);
    expect(siteConfig.teamSize.max).toBe(3);
  });

  it("has a valid IST event start", () => {
    const start = new Date(siteConfig.dates.eventStart);
    expect(Number.isNaN(start.getTime())).toBe(false);
    expect(siteConfig.dates.eventStart.endsWith("+05:30")).toBe(true);
  });

  it("orders the milestones", () => {
    const { submission, acceptance, registration, eventStart, eventEnd } =
      siteConfig.dates;
    expect(submission < acceptance).toBe(true);
    expect(acceptance < registration).toBe(true);
    expect(registration < eventStart).toBe(true);
    expect(eventStart.slice(0, 10) <= eventEnd).toBe(true);
  });
});

describe("dateText", () => {
  it("gives the same text as the old site", () => {
    expect(dateText).toEqual({
      submission: "15 November 2026",
      acceptance: "20 November 2026",
      registration: "25 November 2026",
      event: "27–28 November 2026",
    });
  });
});

describe("formatInr", () => {
  it("uses Indian grouping", () => {
    expect(formatInr(75000)).toBe("₹75,000");
    expect(formatInr(600)).toBe("₹600");
    expect(formatInr(125000)).toBe("₹1,25,000");
  });
});
