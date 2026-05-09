interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 10;

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First request from this identifier
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (now > entry.resetTime) {
    // Reset window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

export function getRateLimitResetTime(identifier: string): number {
  const entry = rateLimitStore.get(identifier);
  return entry ? entry.resetTime : Date.now() + RATE_LIMIT_WINDOW;
}