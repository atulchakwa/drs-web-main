import { LRUCache } from "lru-cache";

const cache = new LRUCache({
    max: 500,
    ttl: 60 * 1000
});

const WINDOW_SIZE = 60 * 1000;
const MAX_REQUESTS = 5;

export async function rateLimit(ip) {
    const now = Date.now();
    const windowKey = `rate-limit:${ip}`;
    
    const current = cache.get(windowKey) || { count: 0, reset: now + WINDOW_SIZE };
    
    if (now > current.reset) {
        cache.set(windowKey, { count: 1, reset: now + WINDOW_SIZE });
        return {
            success: true,
            limit: MAX_REQUESTS,
            remaining: MAX_REQUESTS - 1,
            reset: now + WINDOW_SIZE
        };
    }
    
    if (current.count >= MAX_REQUESTS) {
        return {
            success: false,
            limit: MAX_REQUESTS,
            remaining: 0,
            reset: current.reset
        };
    }
    
    cache.set(windowKey, { count: current.count + 1, reset: current.reset });
    
    return {
        success: true,
        limit: MAX_REQUESTS,
        remaining: MAX_REQUESTS - current.count - 1,
        reset: current.reset
    };
}
