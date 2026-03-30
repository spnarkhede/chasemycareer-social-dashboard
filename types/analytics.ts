// types/analytics.ts
export type Platform = 
  | "LinkedIn" 
  | "Instagram" 
  | "TikTok" 
  | "YouTube" 
  | "Pinterest" 
  | "Medium" 
  | "Facebook" 
  | "Website Blog" 
  | "Twitter";

export interface MetricDataPoint {
  date: string; // ISO date string
  value: number;
  platform?: Platform;
}

export interface PlatformMetrics {
  platform: Platform;
  impressions: number;
  engagements: number;
  engagementRate: number; // percentage
  clicks: number;
  shares: number;
  comments: number;
  saves: number;
  followerGrowth: number;
  topPost: {
    id: string;
    title: string;
    metric: number;
    metricType: "impressions" | "engagement" | "clicks";
  };
}

export interface AnalyticsSummary {
  dateRange: { start: Date; end: Date };
  totals: {
    impressions: number;
    engagements: number;
    engagementRate: number;
    clicks: number;
    followerGrowth: number;
    postsPublished: number;
  };
  platforms: PlatformMetrics[];
  engagementTrend: MetricDataPoint[]; // daily data
  followerTrend: MetricDataPoint[]; // daily data
  topPosts: Array<{
    id: string;
    platform: Platform;
    caption: string;
    publishedDate: string;
    impressions: number;
    engagements: number;
    engagementRate: number;
    clicks: number;
    type: "text" | "carousel" | "image" | "reel" | "video" | "diagram";
  }>;
  comparison?: {
    previousPeriod: {
      impressions: number;
      engagements: number;
      engagementRate: number;
      followerGrowth: number;
    };
    change: {
      impressions: number; // percentage
      engagements: number;
      engagementRate: number;
      followerGrowth: number;
    };
  };
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string; // e.g., "Last 30 days"
}