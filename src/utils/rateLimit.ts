import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedis = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Verify Redis configuration
if (!hasRedis && process.env.NODE_ENV === "production") {
    console.warn(
        "⚠️ [ALERTA DE SEGURIDAD]: UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN no están configurados en producción. Se requiere Upstash Redis para el rate limiting distribuido."
    );
}

// In-Memory sliding window fallback when Redis credentials are not provided (e.g. local dev / build)
class MemoryRatelimit {
    private requests: Map<string, number[]> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number, windowSeconds: number) {
        this.maxRequests = maxRequests;
        this.windowMs = windowSeconds * 1000;
    }

    async limit(identifier: string) {
        const now = Date.now();
        const timestamps = this.requests.get(identifier) || [];
        const validTimestamps = timestamps.filter(t => now - t < this.windowMs);

        if (validTimestamps.length >= this.maxRequests) {
            return { success: false, remaining: 0, reset: validTimestamps[0] + this.windowMs };
        }

        validTimestamps.push(now);
        this.requests.set(identifier, validTimestamps);
        return { success: true, remaining: this.maxRequests - validTimestamps.length, reset: now + this.windowMs };
    }
}

// Initialize Redis client if configured
export const redis = hasRedis ? Redis.fromEnv() : null;

/**
 * Rate Limiter para Checkout: 5 pedidos cada 1 minuto por IP
 */
export const checkoutLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "1 m"),
          analytics: true,
          prefix: "rl:checkout"
      })
    : new MemoryRatelimit(5, 60);

/**
 * Rate Limiter para Contacto: 5 mensajes por hora por IP
 */
export const contactLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "1 h"),
          analytics: true,
          prefix: "rl:contact"
      })
    : new MemoryRatelimit(5, 3600);

/**
 * Rate Limiter para Validación de Carrito: 30 consultas por minuto por IP
 */
export const cartValidateLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(30, "1 m"),
          analytics: true,
          prefix: "rl:cart"
      })
    : new MemoryRatelimit(30, 60);

/**
 * Rate Limiter para Notificaciones / Emails: 3 envíos por hora por IP
 */
export const notifyLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(3, "1 h"),
          analytics: true,
          prefix: "rl:notify"
      })
    : new MemoryRatelimit(3, 3600);

/**
 * Rate Limiter para Rastrear Pedidos: 10 consultas por minuto por IP
 */
export const trackingLimiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(10, "1 m"),
          analytics: true,
          prefix: "rl:track"
      })
    : new MemoryRatelimit(10, 60);
