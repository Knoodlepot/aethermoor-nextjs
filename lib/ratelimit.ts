import { incrementCounter, redisReady } from './redis';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipRateLimitMap = new Map<string, RateLimitEntry>();
const accountRateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Get IP address from request
 */
export function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Check if IP is rate limited (max 20 requests per minute)
 */
export async function isIpRateLimited(ip: string, maxPerMinute: number = 20): Promise<boolean> {
  const now = Date.now();
  const minuteBucket = Math.floor(now / 60000);
  const key = `ip:${ip}:${minuteBucket}`;

  if (redisReady) {
    try {
      const count = await incrementCounter(key, 65); // 65 seconds to be safe
      return count > maxPerMinute;
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const resetAt = (minuteBucket + 1) * 60000;
  const entry = ipRateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    // New bucket
    ipRateLimitMap.set(key, { count: 1, resetAt });
    return false;
  }

  entry.count++;
  return entry.count > maxPerMinute;
}

/**
 * Check if account is rate limited (max 10 AI calls per minute)
 */
export async function isAccountRateLimited(
  accountId: string,
  maxPerMinute: number = 10
): Promise<boolean> {
  const now = Date.now();
  const minuteBucket = Math.floor(now / 60000);
  const key = `account:${accountId}:${minuteBucket}`;

  if (redisReady) {
    try {
      const count = await incrementCounter(key, 65); // 65 seconds to be safe
      return count > maxPerMinute;
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Fall through to in-memory
    }
  }

  // In-memory fallback
  const resetAt = (minuteBucket + 1) * 60000;
  const entry = accountRateLimitMap.get(key);

  if (!entry || entry.resetAt <= now) {
    // New bucket
    accountRateLimitMap.set(key, { count: 1, resetAt });
    return false;
  }

  entry.count++;
  return entry.count > maxPerMinute;
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
export function cleanupRateLimitBuckets(): void {
  const now = Date.now();

  // Clean IP limits
  for (const [key, entry] of ipRateLimitMap.entries()) {
    if (entry.resetAt <= now) {
      ipRateLimitMap.delete(key);
    }
  }

  // Clean account limits
  for (const [key, entry] of accountRateLimitMap.entries()) {
    if (entry.resetAt <= now) {
      accountRateLimitMap.delete(key);
    }
  }
}

// Clean up rate limit buckets every 2 minutes
setInterval(cleanupRateLimitBuckets, 2 * 60 * 1000);

/**
 * Rate limit response helper
 */
export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded. Max 10 requests per minute.',
    }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Check both IP and account rate limits
 */
export async function checkRateLimits(request: Request, accountId?: string): Promise<boolean> {
  const ip = getIP(request);

  // Check IP limit
  if (await isIpRateLimited(ip)) {
    return false;
  }

  // Check account limit if authenticated
  if (accountId && (await isAccountRateLimited(accountId))) {
    return false;
  }

  return true;
}
