import { formatDate, formatRange } from "./dates";

/**
 * Single source of truth for event facts. Edit values here only.
 * Plain "YYYY-MM-DD" for dates; eventStart carries +05:30 (IST) for the countdown.
 * Dates are carried over from the old site and may change.
 */
export const siteConfig = {
  name: "Sankalp’26",
  edition: "3rd",
  tagline: "National-level 24-hour hackathon",
  organiser: "AJIET IEEE Student Branch",
  venue: {
    name: "A.J. Institute of Engineering and Technology",
    address: "NH-66, Kottara Chowki, Mangaluru",
  },
  email: "hackathon@ajiet.edu.in",
  dates: {
    submission: "2026-11-15", // idea submission closes
    acceptance: "2026-11-20", // acceptance notifications
    registration: "2026-11-25", // last date of final team registration
    eventStart: "2026-11-27T10:30:00+05:30", // hackathon opening, IST
    eventEnd: "2026-11-28", // last day of the hackathon
  },
  teamSize: { min: 1, max: 3 },
  feePerTeamInr: 600,
  prizePoolInr: 75000,
  eligibility: "B.E / B.Tech, MCA and Diploma students",
} as const;

export type SiteConfig = typeof siteConfig;

const { dates } = siteConfig;

/** Ready-to-show date text, in the same keys the old site used for data-date. */
export const dateText = {
  submission: formatDate(dates.submission),
  acceptance: formatDate(dates.acceptance),
  registration: formatDate(dates.registration),
  event: formatRange(dates.eventStart, dates.eventEnd),
} as const;

/** Indian rupee text: 75000 -> "₹75,000". */
export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
