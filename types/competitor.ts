// types/competitor.ts
import { Platform } from "./post";

export interface CompetitorMetrics {
  followers: number;
  engagementRate: number; // percentage
  avgPostsPerWeek: number;
  growthRate: number; // percentage (last 30 days)
  totalLikes: number;
  totalComments: number;
}

export interface RecentPost {
  id: string;
  caption: string;
  publishedDate: string;
  likes: number;
  comments: number;
  shares: number;
  url: string;
  type: "text" | "image" | "video" | "carousel";
}

export interface Competitor {
  id: string;
  name: string;
  handle: string; // @username
  platform: Platform;
  niche: string; // e.g., "Resume Tips", "Interview Prep"
  website?: string;
  metrics: CompetitorMetrics;
  growthTrend: number[]; // Last 7 days data for sparkline
  recentPosts: RecentPost[];
  lastUpdated: string;
  tags: string[];
}

export type SortField = "name" | "followers" | "engagementRate" | "growthRate" | "avgPostsPerWeek";
export type SortDirection = "asc" | "desc";