// app/dashboard/analytics/lib/mockAnalytics.ts
import { AnalyticsSummary, Platform } from "@/types/analytics";
import { subDays, format } from "date-fns";

// Generate realistic mock data for development
export function generateMockAnalytics(days = 30): AnalyticsSummary {
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  // Generate daily engagement trend
  const engagementTrend = Array.from({ length: days }, (_, i) => {
    const date = subDays(endDate, days - 1 - i);
    // Simulate growth with some randomness
    const baseValue = 150 + (i * 3) + Math.random() * 50;
    // Weekend dip
    const dayOfWeek = date.getDay();
    const weekendModifier = [0, 6].includes(dayOfWeek) ? 0.7 : 1;
    return {
      date: format(date, "yyyy-MM-dd"),
      value: Math.round(baseValue * weekendModifier),
    };
  });

  // Generate daily follower trend
  const followerTrend = Array.from({ length: days }, (_, i) => {
    const date = subDays(endDate, days - 1 - i);
    const baseValue = 12500 + (i * 45) + Math.random() * 30;
    return {
      date: format(date, "yyyy-MM-dd"),
      value: Math.round(baseValue),
    };
  });

  const platforms: Platform[] = [
    "LinkedIn", "Instagram", "TikTok", "YouTube", "Twitter"
  ];

  const platformMetrics = platforms.map((platform, index) => {
    const impressions = Math.floor(8000 + index * 3500 + Math.random() * 2000);
    const engagements = Math.floor(impressions * (0.03 + Math.random() * 0.04));
    
    return {
      platform,
      impressions,
      engagements,
      engagementRate: parseFloat(((engagements / impressions) * 100).toFixed(2)),
      clicks: Math.floor(engagements * 0.4),
      shares: Math.floor(engagements * 0.15),
      comments: Math.floor(engagements * 0.25),
      saves: Math.floor(engagements * 0.2),
      followerGrowth: Math.floor(50 + index * 30 + Math.random() * 40),
      topPost: {
        id: `post-${platform.toLowerCase()}-${index}`,
        title: `${platform} Career Tip: ${["Resume Hacks", "Interview Prep", "Salary Negotiation", "LinkedIn Optimization", "Networking Secrets"][index]}`,
        metric: Math.floor(impressions * 0.3),
        metricType: ["impressions", "engagement", "clicks"][index % 3] as any,
      },
    };
  });

  const topPosts = Array.from({ length: 10 }, (_, i) => {
    const platform = platforms[i % platforms.length];
    const impressions = Math.floor(2000 + Math.random() * 8000);
    const engagements = Math.floor(impressions * (0.04 + Math.random() * 0.05));
    
    return {
      id: `top-${i}`,
      platform,
      caption: [
        "🚀 Stop sending generic resumes! Here's how to tailor your application...",
        "✨ From 0 interviews to 5 offers in 30 days - Maria's success story",
        "🤖 This AI tool just changed my cover letter game forever",
        "⏱️ 60-second career upgrade: Transform your resume bullets",
        "📊 LinkedIn hiring trend alert: Skills-based hiring is up 47%",
        "💡 The #1 mistake job seekers make on LinkedIn (and how to fix it)",
        "🎯 How to answer 'Tell me about yourself' in 90 seconds",
        "🔥 3 phrases that make recruiters instantly interested in your profile",
        "📈 Salary negotiation script that got me a $25K raise",
        "✨ Why your resume isn't getting interviews (and the 5-min fix)",
      ][i],
      publishedDate: format(subDays(endDate, Math.floor(Math.random() * days)), "yyyy-MM-dd"),
      impressions,
      engagements,
      engagementRate: parseFloat(((engagements / impressions) * 100).toFixed(2)),
      clicks: Math.floor(engagements * 0.4),
      type: ["text", "carousel", "image", "reel", "video"][i % 5] as any,
    };
  }).sort((a, b) => b.engagements - a.engagements);

  const totalImpressions = platformMetrics.reduce((sum, p) => sum + p.impressions, 0);
  const totalEngagements = platformMetrics.reduce((sum, p) => sum + p.engagements, 0);
  const totalFollowerGrowth = platformMetrics.reduce((sum, p) => sum + p.followerGrowth, 0);

  return {
    dateRange: { start: startDate, end: endDate },
    totals: {
      impressions: totalImpressions,
      engagements: totalEngagements,
      engagementRate: parseFloat(((totalEngagements / totalImpressions) * 100).toFixed(2)),
      clicks: Math.floor(totalEngagements * 0.4),
      followerGrowth: totalFollowerGrowth,
      postsPublished: 47,
    },
    platforms: platformMetrics,
    engagementTrend,
    followerTrend,
    topPosts,
    comparison: {
      previousPeriod: {
        impressions: Math.floor(totalImpressions * 0.85),
        engagements: Math.floor(totalEngagements * 0.82),
        engagementRate: 3.2,
        followerGrowth: Math.floor(totalFollowerGrowth * 0.75),
      },
      change: {
        impressions: 17.6,
        engagements: 21.9,
        engagementRate: 8.4,
        followerGrowth: 33.3,
      },
    },
  };
}

export const DEFAULT_DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This month", days: -1 }, // special handling
  { label: "Custom", days: -2 }, // opens calendar
];