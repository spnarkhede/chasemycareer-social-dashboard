// lib/social/platform-config.ts
import { Platform, ContentType } from "@/types/ai-content";

export interface PlatformSpec {
  name: Platform;
  maxCaptionLength: number;
  maxHashtags: number;
  recommendedHashtags: number;
  imageAspectRatio: string;
  imageDimensions: { width: number; height: number };
  videoMaxLength: number; // seconds
  supportedContentTypes: ContentType[];
  bestPostingTimes: string[];
  audienceType: string;
  toneRecommendation: string;
  hashtagStrategy: "many" | "few" | "none";
  emojiUsage: "high" | "medium" | "low" | "none";
}

export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  LinkedIn: {
    name: "LinkedIn",
    maxCaptionLength: 3000,
    maxHashtags: 30,
    recommendedHashtags: 3-5,
    imageAspectRatio: "1.91:1",
    imageDimensions: { width: 1200, height: 627 },
    videoMaxLength: 600,
    supportedContentTypes: ["text", "image", "video", "carousel"],
    bestPostingTimes: ["8:00 AM", "12:00 PM", "5:00 PM"],
    audienceType: "Professionals, B2B",
    toneRecommendation: "Professional, informative, value-driven",
    hashtagStrategy: "few",
    emojiUsage: "low",
  },
  Instagram: {
    name: "Instagram",
    maxCaptionLength: 2200,
    maxHashtags: 30,
    recommendedHashtags: 10-15,
    imageAspectRatio: "1:1",
    imageDimensions: { width: 1080, height: 1080 },
    videoMaxLength: 90,
    supportedContentTypes: ["image", "video", "carousel", "reel", "story"],
    bestPostingTimes: ["11:00 AM", "1:00 PM", "7:00 PM"],
    audienceType: "Visual, lifestyle, younger professionals",
    toneRecommendation: "Engaging, visual, authentic",
    hashtagStrategy: "many",
    emojiUsage: "high",
  },
  TikTok: {
    name: "TikTok",
    maxCaptionLength: 2200,
    maxHashtags: 30,
    recommendedHashtags: 3-5,
    imageAspectRatio: "9:16",
    imageDimensions: { width: 1080, height: 1920 },
    videoMaxLength: 180,
    supportedContentTypes: ["video", "reel"],
    bestPostingTimes: ["6:00 AM", "10:00 AM", "10:00 PM"],
    audienceType: "Gen Z, Millennials, entertainment-focused",
    toneRecommendation: "Entertaining, trending, authentic",
    hashtagStrategy: "few",
    emojiUsage: "medium",
  },
  YouTube: {
    name: "YouTube",
    maxCaptionLength: 5000,
    maxHashtags: 15,
    recommendedHashtags: 3-5,
    imageAspectRatio: "16:9",
    imageDimensions: { width: 1280, height: 720 },
    videoMaxLength: 43200,
    supportedContentTypes: ["video"],
    bestPostingTimes: ["2:00 PM", "4:00 PM"],
    audienceType: "All ages, search-driven",
    toneRecommendation: "Educational, entertaining, long-form",
    hashtagStrategy: "few",
    emojiUsage: "low",
  },
  Pinterest: {
    name: "Pinterest",
    maxCaptionLength: 500,
    maxHashtags: 20,
    recommendedHashtags: 2-5,
    imageAspectRatio: "2:3",
    imageDimensions: { width: 1000, height: 1500 },
    videoMaxLength: 60,
    supportedContentTypes: ["image", "video", "carousel"],
    bestPostingTimes: ["8:00 PM", "9:00 PM"],
    audienceType: "Visual planners, DIY, lifestyle",
    toneRecommendation: "Inspirational, helpful, visual",
    hashtagStrategy: "few",
    emojiUsage: "low",
  },
  Medium: {
    name: "Medium",
    maxCaptionLength: 50000,
    maxHashtags: 5,
    recommendedHashtags: 3-5,
    imageAspectRatio: "16:9",
    imageDimensions: { width: 1400, height: 788 },
    videoMaxLength: 0,
    supportedContentTypes: ["text", "image"],
    bestPostingTimes: ["7:00 AM", "12:00 PM", "6:00 PM"],
    audienceType: "Readers, thought leaders, professionals",
    toneRecommendation: "In-depth, thoughtful, well-researched",
    hashtagStrategy: "few",
    emojiUsage: "none",
  },
  Facebook: {
    name: "Facebook",
    maxCaptionLength: 63206,
    maxHashtags: 30,
    recommendedHashtags: 1-3,
    imageAspectRatio: "1.91:1",
    imageDimensions: { width: 1200, height: 630 },
    videoMaxLength: 240,
    supportedContentTypes: ["text", "image", "video", "carousel"],
    bestPostingTimes: ["1:00 PM", "3:00 PM", "4:00 PM"],
    audienceType: "All ages, community-focused",
    toneRecommendation: "Friendly, community-oriented, shareable",
    hashtagStrategy: "few",
    emojiUsage: "medium",
  },
  "Website Blog": {
    name: "Website Blog",
    maxCaptionLength: 10000,
    maxHashtags: 10,
    recommendedHashtags: 5-10,
    imageAspectRatio: "16:9",
    imageDimensions: { width: 1200, height: 675 },
    videoMaxLength: 0,
    supportedContentTypes: ["text", "image", "video"],
    bestPostingTimes: ["9:00 AM", "11:00 AM"],
    audienceType: "SEO-driven, information seekers",
    toneRecommendation: "SEO-optimized, comprehensive, authoritative",
    hashtagStrategy: "few",
    emojiUsage: "low",
  },
  Twitter: {
    name: "Twitter",
    maxCaptionLength: 280,
    maxHashtags: 10,
    recommendedHashtags: 1-2,
    imageAspectRatio: "16:9",
    imageDimensions: { width: 1200, height: 675 },
    videoMaxLength: 140,
    supportedContentTypes: ["text", "image", "video"],
    bestPostingTimes: ["8:00 AM", "12:00 PM", "6:00 PM"],
    audienceType: "News-focused, real-time engagement",
    toneRecommendation: "Concise, timely, engaging",
    hashtagStrategy: "few",
    emojiUsage: "medium",
  },
};

export function getPlatformSpec(platform: Platform): PlatformSpec {
  return PLATFORM_SPECS[platform];
}

export function getOptimalDimensions(platform: Platform): { width: number; height: number } {
  return PLATFORM_SPECS[platform].imageDimensions;
}

export function getBestPostingTimes(platform: Platform): string[] {
  return PLATFORM_SPECS[platform].bestPostingTimes;
}