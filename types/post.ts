// types/post.ts
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

export type PostType = "text" | "carousel" | "image" | "reel" | "video" | "diagram";
export type PostStatus = "draft" | "scheduled" | "published" | "backlog";

export interface Post {
  id: string;
  caption: string;
  platforms: Platform[];
  type: PostType;
  status: PostStatus;
  scheduledDate?: Date;
  publishedDate?: Date;
  mediaUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  // Platform-specific optimizations
  platformVariants?: Partial<Record<Platform, {
    caption?: string;
    hashtags?: string[];
    mediaUrl?: string;
  }>>;
}

export interface PostFilters {
  status?: PostStatus[];
  platforms?: Platform[];
  type?: PostType[];
  search?: string;
  dateRange?: { start: Date; end: Date };
}