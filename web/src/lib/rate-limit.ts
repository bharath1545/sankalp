/**
 * Small in-memory rate limiter, per key (the caller's IP).
 * Limit: serverless instances do not share memory, so this slows abuse
 * but does not stop it. A stronger limit comes in the security pass (T027).
 */
export interface RateLimiter {
  /** Returns true when the call is allowed, false when over the limit. */
  allow(key: string, now?: number): boolean;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    allow(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);

      // Keep memory bounded: drop keys with no recent hits.
      if (hits.size > maxKeys) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }
      return true;
    },
  };
}
