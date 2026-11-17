/**
 * Pure countdown arithmetic. No DOM, no intervals — components own the timer.
 * Target comes from siteConfig.dates.eventStart (IST string).
 */

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Total milliseconds remaining. Negative means the event has started. */
  remaining: number;
}

/** Break a millisecond delta into d/h/m/s. Clamps negatives to zero. */
export function decompose(ms: number): CountdownValues {
  const remaining = ms;
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, remaining };
  const days = Math.floor(ms / 86_400_000);
  ms %= 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms %= 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  ms %= 60_000;
  const seconds = Math.floor(ms / 1_000);
  return { days, hours, minutes, seconds, remaining };
}

/** Countdown from `now` to `target`. */
export function countdownTo(target: Date, now: Date = new Date()): CountdownValues {
  return decompose(target.getTime() - now.getTime());
}

/** Zero-pad to 2 digits. Days are not padded (can be >99). */
export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
