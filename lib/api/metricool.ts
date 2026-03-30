// lib/api/metricool.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "@/lib/api-error";
import { cache } from "@/lib/api/cache";
import { externalApiRateLimiter } from "@/lib/rate-limit";

export interface MetricoolAnalyticsParams {
  startDate: Date;
  endDate: Date;
  platforms?: string[];
  metrics?: string[];
  granularity?: "day" | "week" | "month";
}

export interface MetricoolPost {
  id: string;
  platform: string;
  content: string;
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledDate?: string;
  publishedDate?: string;
  media?: string[];
  metrics?: {
    impressions: number;
    engagements: number;
    clicks: number;
    shares: number;
    comments: number;
  };
}

export interface MetricoolCompetitor {
  id: string;
  platform: string;
  handle: string;
  followers: number;
  engagementRate: number;
  growthRate: number;
  posts: MetricoolPost[];
}

class MetricoolClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.METRICOOL_API_KEY!;
    this.baseUrl = process.env.METRICOOL_API_URL || "https://api.metricool.com/v2";

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw ApiError.unauthorized("Invalid Metricool API key");
        }
        if (error.response?.status === 429) {
          throw ApiError.tooManyRequests("Metricool rate limit exceeded");
        }
        throw ApiError.externalApi(
          "Metricool API error",
          { status: error.response?.status, data: error.response?.data }
        );
      }
    );
  }

  // Check rate limit before making request
  private async checkRateLimit() {
    const { success } = await externalApiRateLimiter.limit("metricool");
    if (!success) {
      throw ApiError.tooManyRequests("External API rate limit exceeded");
    }
  }

  async getAnalytics(params: MetricoolAnalyticsParams) {
    await this.checkRateLimit();

    const cacheKey = cache.keys.analytics("global", params.platforms?.join(","));

    return cache.cached(
      cacheKey,
      async () => {
        const response = await this.client.get("/analytics", {
          params: {
            start_date: params.startDate.toISOString().split("T")[0],
            end_date: params.endDate.toISOString().split("T")[0],
            platforms: params.platforms?.join(","),
            metrics: params.metrics?.join(","),
            granularity: params.granularity || "day",
          },
        });

        return response.data;
      },
      { ttl: 3600 } // Cache for 1 hour
    );
  }

  async getPosts(params?: {
    platform?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) {
    await this.checkRateLimit();

    const cacheKey = cache.keys.posts("global", params?.status);

    return cache.cached(
      cacheKey,
      async () => {
        const response = await this.client.get("/posts", {
          params: {
            platform: params?.platform,
            status: params?.status,
            limit: params?.limit || 50,
            page: params?.page || 1,
          },
        });

        return response.data;
      },
      { ttl: 300 } // Cache for 5 minutes
    );
  }

  async createPost(data: {
    platform: string;
    content: string;
    scheduledDate?: Date;
    media?: string[];
  }) {
    await this.checkRateLimit();

    const response = await this.client.post("/posts/create", {
      platform: data.platform,
      content: data.content,
      scheduled_date: data.scheduledDate?.toISOString(),
      media: data.media,
    });

    // Invalidate posts cache
    await cache.deleteByPattern("posts:*");

    return response.data;
  }

  async updatePost(postId: string, data: Partial<MetricoolPost>) {
    await this.checkRateLimit();

    const response = await this.client.put(`/posts/${postId}`, data);

    // Invalidate post cache
    await cache.delete(cache.keys.post(postId));
    await cache.deleteByPattern("posts:*");

    return response.data;
  }

  async deletePost(postId: string) {
    await this.checkRateLimit();

    const response = await this.client.delete(`/posts/${postId}`);

    // Invalidate caches
    await cache.delete(cache.keys.post(postId));
    await cache.deleteByPattern("posts:*");

    return response.data;
  }

  async publishPost(postId: string) {
    await this.checkRateLimit();

    const response = await this.client.post(`/posts/${postId}/publish`);

    // Invalidate caches
    await cache.delete(cache.keys.post(postId));
    await cache.deleteByPattern("posts:*");

    return response.data;
  }

  async getCompetitors(params: {
    platform: string;
    handles: string[];
  }) {
    await this.checkRateLimit();

    const cacheKey = `competitors:${params.platform}:${params.handles.join(",")}`;

    return cache.cached(
      cacheKey,
      async () => {
        const response = await this.client.get("/competitors", {
          params: {
            platform: params.platform,
            handles: params.handles.join(","),
          },
        });

        return response.data;
      },
      { ttl: 3600 } // Cache for 1 hour
    );
  }

  async addCompetitor(data: {
    platform: string;
    handle: string;
    name: string;
  }) {
    await this.checkRateLimit();

    const response = await this.client.post("/competitors", data);

    // Invalidate competitors cache
    await cache.deleteByPattern("competitors:*");

    return response.data;
  }

  async removeCompetitor(competitorId: string) {
    await this.checkRateLimit();

    const response = await this.client.delete(`/competitors/${competitorId}`);

    // Invalidate competitors cache
    await cache.deleteByPattern("competitors:*");

    return response.data;
  }

  // Health check
  async testConnection() {
    try {
      await this.client.get("/me");
      return { success: true, message: "Connected to Metricool" };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof ApiError ? error.message : "Connection failed" 
      };
    }
  }
}

export const metricool = new MetricoolClient();