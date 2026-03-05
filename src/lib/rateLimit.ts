const CLEANUP_INTERVAL_MS = 60_000;
const MAX_TRACKED_IPS = 4000;

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  now?: number;
};

export type RateLimitResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      retryAfterSeconds: number;
    };

const buckets = new Map<string, number[]>();
let lastCleanupAt = 0;

const purgeOldEntries = (now: number, windowMs: number): void => {
  const shouldSweep = now - lastCleanupAt >= CLEANUP_INTERVAL_MS || buckets.size > MAX_TRACKED_IPS;
  if (!shouldSweep) return;

  const threshold = now - windowMs;
  for (const [ip, timestamps] of buckets.entries()) {
    const active = timestamps.filter((timestamp) => timestamp > threshold);
    if (active.length === 0) {
      buckets.delete(ip);
      continue;
    }
    buckets.set(ip, active);
  }

  lastCleanupAt = now;
};

export const checkRateLimit = (ip: string, options: RateLimitOptions): RateLimitResult => {
  if (!ip || ip === "unknown") return { ok: true };

  const now = options.now ?? Date.now();
  const { windowMs, maxRequests } = options;
  const threshold = now - windowMs;

  purgeOldEntries(now, windowMs);

  const existing = buckets.get(ip) ?? [];
  const recent = existing.filter((timestamp) => timestamp > threshold);

  if (recent.length >= maxRequests) {
    buckets.set(ip, recent);
    const retryAfterMs = Math.max(0, recent[0] + windowMs - now);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  recent.push(now);
  buckets.set(ip, recent);
  return { ok: true };
};
