/*
 * Single source of truth for event dates.
 * Edit the dates here only. index.html shows them through data-date
 * placeholders and script.js uses eventStart for the countdown.
 *
 * Formats: "YYYY-MM-DD" for plain dates, ISO with +05:30 for eventStart (IST).
 *
 * NOTE: the <meta name="description"> in index.html is plain text because
 * search engines do not run JavaScript. Update it by hand when dates change.
 */
window.SANKALP_DATES = {
  submission: "2026-11-15",   // idea submission closes
  acceptance: "2026-11-20",   // acceptance notifications
  registration: "2026-11-25", // last date of final team registration
  eventStart: "2026-11-27T10:30:00+05:30", // hackathon opening, IST
  eventEnd: "2026-11-28",     // last day of the hackathon
};
