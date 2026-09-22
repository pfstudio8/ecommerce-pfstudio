import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Allow fallback to a dummy rate limiter or memory if env vars are missing during build/local
const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis ? Redis.fromEnv() : null;

// Dummy limiter para desarrollo o fallback si no hay Redis configurado aún
const dummyLimiter = {
    limit: async (identifier: string) => ({ success: true })
};

// Checkout limit: 10 requests per minute
export const checkoutLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, "1 m"),
      })
    : dummyLimiter;

// Contact limit: 5 requests per hour
export const contactLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "1 h"),
      })
    : dummyLimiter;

// Notify limit: 3 requests per hour
export const notifyLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(3, "1 h"),
      })
    : dummyLimiter;
