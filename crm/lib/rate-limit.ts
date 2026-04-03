// Simple in-memory rate limiter — good enough for a single-process Next.js server.
// Keyed by IP, with a sliding window per endpoint.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (bucket.count >= max) return false; // blocked

  bucket.count++;
  return true;
}
