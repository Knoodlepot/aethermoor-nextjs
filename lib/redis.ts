import { createClient, RedisClientType } from 'redis';

let redis: RedisClientType | null = null;
export let redisReady = false;
const inMemoryCache = new Map<string, { value: string; expiresAt: number }>();

/**
 * Initialize Redis connection (optional)
 */
export async function initRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('⚠ REDIS_URL not set, using in-memory cache fallback');
    redisReady = false;
    return;
  }

  try {
    redis = createClient({ url: redisUrl });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
      redisReady = false;
    });

    redis.on('connect', () => {
      console.log('✓ Redis connected');
      redisReady = true;
    });

    await redis.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    redisReady = false;
    redis = null;
  }
}

/**
 * Get cached JSON value
 */
export async function cacheGetJson<T>(key: string): Promise<T | null> {
  try {
    if (redisReady && redis) {
      const value = await redis.get(`cache:${key}`);
      return value ? JSON.parse(value) : null;
    } else {
      // In-memory fallback
      const cached = inMemoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return JSON.parse(cached.value);
      }
      inMemoryCache.delete(key);
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached JSON value with TTL
 */
export async function cacheSetJson(key: string, value: any, ttlSec: number = 3600): Promise<void> {
  try {
    const jsonStr = JSON.stringify(value);
    if (redisReady && redis) {
      await redis.setEx(`cache:${key}`, ttlSec, jsonStr);
    } else {
      // In-memory fallback
      inMemoryCache.set(key, {
        value: jsonStr,
        expiresAt: Date.now() + ttlSec * 1000,
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete a cached key
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    if (redisReady && redis) {
      await redis.del(`cache:${key}`);
    } else {
      // In-memory fallback
      inMemoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Block a token from being used (logout)
 */
export async function blockToken(token: string, ttlSec: number = 604800): Promise<void> {
  try {
    if (redisReady && redis) {
      await redis.setEx(`blocked:${token}`, ttlSec, '1');
    } else {
      // In-memory fallback
      inMemoryCache.set(`blocked:${token}`, {
        value: '1',
        expiresAt: Date.now() + ttlSec * 1000,
      });
    }
  } catch (error) {
    console.error('Block token error:', error);
  }
}

/**
 * Check if token is blocked
 */
export async function isTokenBlocked(token: string): Promise<boolean> {
  try {
    if (redisReady && redis) {
      const blocked = await redis.get(`blocked:${token}`);
      return !!blocked;
    } else {
      // In-memory fallback
      const cached = inMemoryCache.get(`blocked:${token}`);
      if (cached && cached.expiresAt > Date.now()) {
        return true;
      }
      inMemoryCache.delete(`blocked:${token}`);
      return false;
    }
  } catch (error) {
    console.error('Check blocked error:', error);
    return false;
  }
}

/**
 * Increment a counter in Redis (for rate limiting)
 */
export async function incrementCounter(key: string, expirySeconds: number = 60): Promise<number> {
  try {
    if (redisReady && redis) {
      const count = await redis.incr(`counter:${key}`);
      await redis.expire(`counter:${key}`, expirySeconds);
      return count;
    } else {
      // In-memory fallback - simple bucket approach
      const bucketKey = `counter:${key}`;
      const cached = inMemoryCache.get(bucketKey);
      let count = 1;
      if (cached && cached.expiresAt > Date.now()) {
        count = parseInt(cached.value) + 1;
      }
      inMemoryCache.set(bucketKey, {
        value: count.toString(),
        expiresAt: Date.now() + expirySeconds * 1000,
      });
      return count;
    }
  } catch (error) {
    console.error('Increment counter error:', error);
    return 0;
  }
}

/**
 * Clean up expired in-memory cache entries
 */
export function cleanupMemoryCache(): void {
  const now = Date.now();
  for (const [key, value] of inMemoryCache.entries()) {
    if (value.expiresAt <= now) {
      inMemoryCache.delete(key);
    }
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    redisReady = false;
    console.log('✓ Redis connection closed');
  }
}

// Clean up in-memory cache periodically (every 5 minutes)
setInterval(cleanupMemoryCache, 5 * 60 * 1000);
