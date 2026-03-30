// lib/api/cache.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  tags?: string[];
}

export class CacheService {
  private defaultTtl = 300; // 5 minutes default

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTtl;
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache delete by pattern error:", error);
    }
  }

  // Cache with automatic invalidation
  async cached<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    await this.set(key, data, options);

    return data;
  }

  // Cache keys for different data types
  keys = {
    analytics: (userId: string, platform?: string) => 
      `analytics:${userId}:${platform || "all"}`,
    posts: (userId: string, status?: string) => 
      `posts:${userId}:${status || "all"}`,
    post: (postId: string) => `post:${postId}`,
    competitors: (userId: string) => `competitors:${userId}`,
    rss: (sourceId: string) => `rss:${sourceId}`,
    socialAccount: (userId: string, platform: string) => 
      `social:${userId}:${platform}`,
  };
}

export const cache = new CacheService();