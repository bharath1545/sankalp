/**
 * Date formatting for event dates. Port of formatDate/formatRange from the old
 * site. Works on the "YYYY-MM-DD" text only (no Date object), so the output
 * never shifts with the viewer's time zone.
 */
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

interface Ymd {
  y: number;
  m: number;
  d: number;
}

function parseYmd(value: string): Ymd {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) throw new RangeError(`Invalid date: "${value}"`);
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (m < 1 || m > 12 || d < 1 || d > 31)
    throw new RangeError(`Invalid date: "${value}"`);
  return { y, m, d };
}

/** "2026-11-15" -> "15 November 2026". Extra time text after the date is ignored. */
export function formatDate(value: string): string {
  const { y, m, d } = parseYmd(value);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/**
 * "2026-11-27", "2026-11-28" -> "27–28 November 2026".
 * Same month: shared month and year. Same year: shared year. Otherwise both in full.
 */
export function formatRange(start: string, end: string): string {
  const a = parseYmd(start);
  const b = parseYmd(end);
  if (a.y === b.y && a.m === b.m) {
    return a.d === b.d ? formatDate(start) : `${a.d}–${b.d} ${MONTHS[a.m - 1]} ${a.y}`;
  }
  if (a.y === b.y) return `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${a.y}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}
