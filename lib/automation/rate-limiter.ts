// lib/automation/rate-limiter.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Platform-specific rate limits (conservative to avoid bans)
const RATE_LIMITS = {
  linkedin: {
    messagesPerHour: 50,
    messagesPerDay: 200,
    delayBetweenMessages: 60, // seconds
  },
  instagram: {
    messagesPerHour: 40,
    messagesPerDay: 150,
    delayBetweenMessages: 90,
  },
  twitter: {
    messagesPerHour: 100,
    messagesPerDay: 500,
    delayBetweenMessages: 30,
  },
  facebook: {
    messagesPerHour: 80,
    messagesPerDay: 300,
    delayBetweenMessages: 45,
  },
};

export async function checkRateLimit(platform: string, userId: string) {
  const limits = RATE_LIMITS[platform as keyof typeof RATE_LIMITS];
  
  if (!limits) {
    return { allowed: true, retryAfter: 0 };
  }

  const hourKey = `ratelimit:${platform}:${userId}:hour`;
  const dayKey = `ratelimit:${platform}:${userId}:day`;
  const lastMessageKey = `ratelimit:${platform}:${userId}:last`;

  // Check hourly limit
  const hourCount = await redis.get(hourKey) || 0;
  if (hourCount >= limits.messagesPerHour) {
    return { allowed: false, retryAfter: 3600, reason: "Hourly limit reached" };
  }

  // Check daily limit
  const dayCount = await redis.get(dayKey) || 0;
  if (dayCount >= limits.messagesPerDay) {
    return { allowed: false, retryAfter: 86400, reason: "Daily limit reached" };
  }

  // Check delay between messages
  const lastMessage = await redis.get(lastMessageKey);
  if (lastMessage) {
    const timeSinceLast = Math.floor(Date.now() / 1000) - lastMessage;
    if (timeSinceLast < limits.delayBetweenMessages) {
      const retryAfter = limits.delayBetweenMessages - timeSinceLast;
      return { allowed: false, retryAfter, reason: "Rate limit delay" };
    }
  }

  // Increment counters
  await redis.incr(hourKey);
  await redis.expire(hourKey, 3600);
  
  await redis.incr(dayKey);
  await redis.expire(dayKey, 86400);
  
  await redis.set(lastMessageKey, Math.floor(Date.now() / 1000));
  await redis.expire(lastMessageKey, 3600);

  return { allowed: true, retryAfter: 0 };
}

export async function getRateLimitStatus(platform: string, userId: string) {
  const limits = RATE_LIMITS[platform as keyof typeof RATE_LIMITS];
  
  if (!limits) {
    return null;
  }

  const hourKey = `ratelimit:${platform}:${userId}:hour`;
  const dayKey = `ratelimit:${platform}:${userId}:day`;

  const [hourCount, dayCount] = await Promise.all([
    redis.get(hourKey) || 0,
    redis.get(dayKey) || 0,
  ]);

  return {
    platform,
    hourly: {
      used: hourCount,
      limit: limits.messagesPerHour,
      remaining: limits.messagesPerHour - hourCount,
    },
    daily: {
      used: dayCount,
      limit: limits.messagesPerDay,
      remaining: limits.messagesPerDay - dayCount,
    },
  };
}