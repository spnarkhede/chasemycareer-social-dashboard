// lib/metricool.ts
import axios from "axios";

const METRICOOL_BASE_URL = process.env.NEXT_PUBLIC_METRICOOL_API_URL || "https://api.metricool.com/v2";
const API_KEY = process.env.METRICOOL_API_KEY;

interface MetricoolConfig {
  apiKey: string;
  baseUrl: string;
}

class MetricoolClient {
  private config: MetricoolConfig;

  constructor(config?: Partial<MetricoolConfig>) {
    this.config = {
      apiKey: config?.apiKey || API_KEY || "",
      baseUrl: config?.baseUrl || METRICOOL_BASE_URL,
    };
  }

  private getHeaders() {
    return {
      "Authorization": `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getAnalytics({
    startDate,
    endDate,
    platforms = [],
    metrics = ["impressions", "engagements", "clicks", "followers"],
  }: {
    startDate: Date;
    endDate: Date;
    platforms?: string[];
    metrics?: string[];
  }) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/analytics`, {
        headers: this.getHeaders(),
        params: {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          platforms: platforms.join(","),
          metrics: metrics.join(","),
          granularity: "day",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Metricool API Error:", error);
      // Return mock data in development or on error
      if (process.env.NODE_ENV === "development") {
        const { generateMockAnalytics } = await import("@/app/dashboard/analytics/lib/mockAnalytics");
        return generateMockAnalytics(30);
      }
      throw error;
    }
  }

  async getTopPosts({
    limit = 10,
    platform,
    sortBy = "engagements",
    startDate,
    endDate,
  }: {
    limit?: number;
    platform?: string;
    sortBy?: "impressions" | "engagements" | "clicks" | "engagement_rate";
    startDate?: Date;
    endDate?: Date;
  }) {
    const response = await axios.get(`${this.config.baseUrl}/posts/top`, {
      headers: this.getHeaders(),
      params: {
        limit,
        platform,
        sort_by: sortBy,
        start_date: startDate?.toISOString().split("T")[0],
        end_date: endDate?.toISOString().split("T")[0],
      },
    });
    return response.data;
  }

  async getFollowerGrowth({
    platform,
    days = 30,
  }: {
    platform: string;
    days?: number;
  }) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await axios.get(`${this.config.baseUrl}/followers/growth`, {
      headers: this.getHeaders(),
      params: {
        platform,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      },
    });
    return response.data;
  }

  // Health check for API connectivity
  async testConnection() {
    try {
      await axios.get(`${this.config.baseUrl}/me`, {
        headers: this.getHeaders(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as any).message };
    }
  }
}

export const metricoolClient = new MetricoolClient();