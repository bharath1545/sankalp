/**
 * Pure state for the circuit timeline: which milestones have passed and which is next.
 * Date-only values ("2026-11-15") count from midnight IST, full ISO values as given.
 */

export function milestoneTime(value: string): number {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+05:30` : value;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) throw new RangeError(`Invalid milestone date: "${value}"`);
  return t;
}

export interface TimelineState {
  /** passed[i] is true once milestone i has started. */
  passed: boolean[];
  /** Index of the next milestone, or -1 when all have passed. */
  next: number;
  /** Index the lit trace runs up to: the next milestone, or the last one when all passed. */
  litTo: number;
}

export function timelineState(times: number[], now: number): TimelineState {
  const passed = times.map((t) => t <= now);
  const next = passed.findIndex((p) => !p);
  return { passed, next, litTo: next === -1 ? times.length - 1 : next };
}
