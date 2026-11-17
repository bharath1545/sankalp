/**
 * Loading screen timing. Pure numbers and arithmetic so the behaviour can be
 * tested without a browser. Values come from the old site's loader and D16.
 */

/** Time the bar is held before it may reach 100%, even if the page is ready. */
export const LOADER_MIN_MS = 2400;
export const LOADER_REDUCED_MIN_MS = 400;
/** Fade-out length after the bar reaches 100%. */
export const LOADER_FADE_MS = 700;
/** Small pause at 100% before the fade starts. */
export const LOADER_DONE_DELAY_MS = 250;
/** Never wait longer than this for the page and its fonts. */
export const LOADER_SAFETY_MS = 7000;
/** Where the bar waits while the page is still loading. */
export const LOADER_HOLD_PERCENT = 92;

/**
 * Fast start, soft landing. `t` is 0 to 1, the result is 0 to 1.
 */
export function easeProgress(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - clamped, 2.4);
}

export type ProgressInput = {
  /** Milliseconds since the loader started. */
  elapsed: number;
  /** Minimum time from the start, already chosen for reduced motion. */
  minMs: number;
  /** The page has fired `load` and its fonts are ready. */
  loaded: boolean;
  /** The value painted on the last frame. */
  shown: number;
  reducedMotion?: boolean;
};

/**
 * Next width of the bar, in percent.
 *
 * It eases towards 92% and stops there until the page is really ready, so the
 * bar never sits at 99% waiting. Past LOADER_SAFETY_MS it finishes anyway, so a
 * stalled font or image can never trap the visitor behind the overlay.
 */
export function nextProgress({
  elapsed,
  minMs,
  loaded,
  shown,
  reducedMotion = false,
}: ProgressInput): number {
  const ready = loaded || elapsed >= LOADER_SAFETY_MS;
  let target = easeProgress(elapsed / minMs) * 100;

  if (!ready) target = Math.min(target, LOADER_HOLD_PERCENT);
  else if (elapsed >= minMs) target = 100;

  const next = shown + (target - shown) * (reducedMotion ? 1 : 0.25);

  // Snap the last fraction so the bar really reads 100, not 99.
  return target === 100 && next > 99.5 ? 100 : next;
}
