export class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number, maxRequests: number) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    check(ip: string): boolean {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        let timestamps = this.requests.get(ip) || [];
        timestamps = timestamps.filter((time) => time > windowStart);

        if (timestamps.length >= this.maxRequests) {
            return false;
        }

        timestamps.push(now);
        this.requests.set(ip, timestamps);
        return true;
    }
}

// Global instances for memory persistence across hot reloads (in dev) or lambdas (in prod to some extent)
const globalForRateLimiter = globalThis as unknown as {
    checkoutLimiter: RateLimiter | undefined;
    notifyLimiter: RateLimiter | undefined;
};

export const checkoutLimiter = globalForRateLimiter.checkoutLimiter ?? new RateLimiter(60000, 10); // 10 requests per minute
export const notifyLimiter = globalForRateLimiter.notifyLimiter ?? new RateLimiter(3600000, 3); // 3 requests per hour

if (process.env.NODE_ENV !== 'production') {
    globalForRateLimiter.checkoutLimiter = checkoutLimiter;
    globalForRateLimiter.notifyLimiter = notifyLimiter;
}
