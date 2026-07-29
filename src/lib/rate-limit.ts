interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

/**
 * In-memory sliding window rate limiter for API endpoints.
 * @param identifier Unique key (e.g. IP address or userId + route)
 * @param limit Maximum allowed requests in window
 * @param windowMs Time window in milliseconds (default: 60000ms = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = store[identifier];

  // Clean expired records periodically
  if (Math.random() < 0.05) {
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }

  if (!record || record.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      success: true,
      remaining: limit - 1,
      resetInMs: windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetTime - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetInMs: Math.max(0, record.resetTime - now),
  };
}
