// types/ai-content.ts
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

export type ContentType = 
  | "text" 
  | "image" 
  | "video" 
  | "carousel" 
  | "reel" 
  | "story";

export interface GeneratedContent {
  id: string;
  topic: string;
  platform: Platform;
  contentType: ContentType;
  caption: string;
  hashtags: string[];
  keywords: string[];
  fullText: string;
  callToAction: string;
  estimatedReach: {
    min: number;
    max: number;
    average: number;
  };
  bestPostingTime: string;
  media: {
    type: "image" | "video" | "carousel";
    urls: string[];
    thumbnails: string[];
    alt: string;
  }[];
  carouselSlides?: {
    title: string;
    content: string;
    image?: string;
  }[];
  videoScript?: {
    hook: string;
    mainPoints: string[];
    cta: string;
    duration: number;
  };
  seoMetadata?: {
    title: string;
    description: string;
    tags: string[];
  };
  createdAt: Date;
  status: "draft" | "scheduled" | "published";
}

export interface ContentGenerationRequest {
  topic: string;
  platforms: Platform[];
  tone?: "professional" | "casual" | "inspirational" | "educational" | "promotional";
  targetAudience?: string;
  goal?: "awareness" | "engagement" | "leads" | "sales";
  includeMedia?: boolean;
  includeVideo?: boolean;
  includeCarousel?: boolean;
}

export interface ContentGenerationResponse {
  success: boolean;
  contents: GeneratedContent[];
  totalPlatforms: number;
  estimatedTotalReach: number;
  generationTime: number;
  creditsUsed: number;
}

export interface MediaSearchResult {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  source: "unsplash" | "pexels" | "pixabay";
}