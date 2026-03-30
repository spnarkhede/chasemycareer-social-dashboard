// types/optimizer.ts
export type SocialPlatform = 
  | "instagram"
  | "linkedin"
  | "twitter"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "pinterest"
  | "medium"
  | "threads";

export interface PlatformSpec {
  name: SocialPlatform;
  displayName: string;
  icon: string;
  color: string;
  bioMaxLength: number;
  headlineMaxLength: number;
  linkAllowed: boolean;
  linkLimit: number;
  bestPostingTimes: string[];
  contentTypes: string[];
  audienceType: string;
  toneRecommendation: string;
  monetizationOptions: MonetizationOption[];
  growthStrategies: GrowthStrategy[];
}

export interface MonetizationOption {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  earningPotential: string;
  difficulty: "easy" | "medium" | "hard";
  timeToRevenue: string;
}

export interface GrowthStrategy {
  id: string;
  name: string;
  description: string;
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  timeToResult: string;
}

export interface OptimizedProfile {
  platform: SocialPlatform;
  headline: string;
  bio: string;
  profilePictureTips: string[];
  bannerTips: string[];
  linkStrategy: string;
  recommendedLinks: string[];
  contentPillars: string[];
  postingFrequency: string;
  bestPostingTimes: string[];
  hashtagStrategy: string;
  engagementTips: string[];
  growthTips: string[];
  monetizationTips: MonetizationOption[];
  optimizationScore: number;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: "profile" | "content" | "engagement" | "growth" | "monetization";
  priority: "high" | "medium" | "low";
  completed: boolean;
  points: number;
}

export interface BrandInfo {
  businessName: string;
  tagline: string;
  description: string;
  targetAudience: string;
  niche: string;
  valueProposition: string;
  brandVoice: "professional" | "casual" | "inspirational" | "educational" | "entertaining";
  primaryGoal: "awareness" | "engagement" | "leads" | "sales" | "community";
  website: string;
  email: string;
  location: string;
  establishedYear?: number;
  teamSize?: string;
  uniqueSellingPoints: string[];
  competitorAccounts: string[];
  currentFollowers: Record<SocialPlatform, number>;
}

export interface OptimizationResult {
  overallScore: number;
  profiles: OptimizedProfile[];
  totalChecklistItems: number;
  completedItems: number;
  estimatedGrowthPotential: string;
  estimatedRevenuePotential: string;
  priorityActions: string[];
}