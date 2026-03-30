// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General API rate limiter
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    parseInt(process.env.API_RATE_LIMIT_REQUESTS) || 500,
    parseInt(process.env.API_RATE_LIMIT_WINDOW) || 3600 // 1 hour
  ),
  analytics: true,
  prefix: "ratelimit:api",
});

// Auth rate limiter (stricter)
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
  prefix: "ratelimit:auth",
});

// Post creation rate limiter
export const postRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"), // 50 posts per hour
  analytics: true,
  prefix: "ratelimit:posts",
});

// External API rate limiter (for Metricool, etc.)
export const externalApiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true,
  prefix: "ratelimit:external",
});

// Helper function for middleware
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = apiRateLimiter
) {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    },
  };
}