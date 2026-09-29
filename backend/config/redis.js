import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient = null;

try {
  redisClient = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  });
} catch (error) {
  console.warn("Redis initialization failed:", error.message);
}

export const redis = redisClient;

export const cacheMiddleware = async (key, ttl, fn) => {
  if (!redisClient) {
    return fn();
  }

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fn();
    if (data) {
      await redisClient.setex(key, ttl, JSON.stringify(data));
    }
    return data;
  } catch (error) {
    console.error("Redis cache error:", error);
    return fn();
  }
};