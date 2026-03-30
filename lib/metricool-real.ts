// lib/metricool-real.ts
import axios from "axios";

class MetricoolRealClient {
  private apiKey: string;
  private baseUrl = "https://api.metricool.com/v2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getAnalytics({
    startDate,
    endDate,
    platforms = [],
  }: {
    startDate: Date;
    endDate: Date;
    platforms: string[];
  }) {
    const response = await axios.get(`${this.baseUrl}/analytics`, {
      headers: this.getHeaders(),
      params: {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        platforms: platforms.join(","),
        granularity: "day",
      },
    });
    return response.data;
  }

  async getPosts({
    platform,
    status,
    limit = 50,
  }: {
    platform?: string;
    status?: "scheduled" | "published" | "draft";
    limit?: number;
  }) {
    const response = await axios.get(`${this.baseUrl}/posts`, {
      headers: this.getHeaders(),
      params: { platform, status, limit },
    });
    return response.data;
  }

  async createPost({
    platform,
    content,
    scheduledDate,
    media,
  }: {
    platform: string;
    content: string;
    scheduledDate?: Date;
    media?: string[];
  }) {
    const response = await axios.post(
      `${this.baseUrl}/posts/create`,
      {
        platform,
        content,
        scheduled_date: scheduledDate?.toISOString(),
        media,
      },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getCompetitors({
    platform,
    handles,
  }: {
    platform: string;
    handles: string[];
  }) {
    const response = await axios.get(`${this.baseUrl}/competitors`, {
      headers: this.getHeaders(),
      params: { platform, handles: handles.join(",") },
    });
    return response.data;
  }
}

export const metricoolReal = new MetricoolRealClient(
  process.env.METRICOOL_API_KEY!
);