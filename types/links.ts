// types/links.ts
export type Platform = 
  | "linkedin"
  | "instagram"
  | "twitter"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "medium"
  | "website"
  | "email"
  | "phone"
  | "custom";

export interface SocialProfile {
  id: string;
  platform: Platform;
  username: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  type: "external" | "email" | "phone" | "text" | "video" | "image" | "file" | "form";
  category?: string;
  order: number;
  isActive: boolean;
  clickCount: number;
  startDate?: Date;
  endDate?: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface LinkPage {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  banner?: string;
  theme: string;
  backgroundColor?: string;
  textColor?: string;
  font: string;
  isActive: boolean;
  isVerified: boolean;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  viewCount: number;
  clickCount: number;
  links: Link[];
  socialProfiles: SocialProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkAnalytics {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  clickThroughRate: number;
  topLinks: Array<{
    linkId: string;
    title: string;
    clicks: number;
  }>;
  topCountries: Array<{
    country: string;
    visitors: number;
  }>;
  topDevices: Array<{
    device: string;
    visitors: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    visitors: number;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

export interface LinkTheme {
  id: string;
  name: string;
  preview: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  buttonStyle: "rounded" | "square" | "pill";
  animation: "none" | "fade" | "slide" | "bounce";
}

export const AVAILABLE_THEMES: LinkTheme[] = [
  {
    id: "default",
    name: "Default",
    preview: "/link-themes/default.png",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    accentColor: "#3b82f6",
    buttonStyle: "rounded",
    animation: "fade",
  },
  {
    id: "gradient",
    name: "Gradient",
    preview: "/link-themes/gradient.png",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    buttonStyle: "pill",
    animation: "slide",
  },
  {
    id: "dark",
    name: "Dark Mode",
    preview: "/link-themes/dark.png",
    backgroundColor: "#1a1a2e",
    textColor: "#eaeaea",
    accentColor: "#0f3460",
    buttonStyle: "rounded",
    animation: "fade",
  },
  {
    id: "light",
    name: "Light Mode",
    preview: "/link-themes/light.png",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    accentColor: "#3b82f6",
    buttonStyle: "square",
    animation: "none",
  },
  {
    id: "minimal",
    name: "Minimal",
    preview: "/link-themes/minimal.png",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    accentColor: "#000000",
    buttonStyle: "pill",
    animation: "fade",
  },
  {
    id: "professional",
    name: "Professional",
    preview: "/link-themes/professional.png",
    backgroundColor: "#1e40af",
    textColor: "#ffffff",
    accentColor: "#60a5fa",
    buttonStyle: "rounded",
    animation: "slide",
  },
];

export const PLATFORM_ICONS: Record<Platform, string> = {
  linkedin: "💼",
  instagram: "📸",
  twitter: "🐦",
  facebook: "📘",
  tiktok: "🎵",
  youtube: "📺",
  pinterest: "📌",
  medium: "📝",
  website: "🌐",
  email: "📧",
  phone: "📱",
  custom: "🔗",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  linkedin: "#0A66C2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  facebook: "#1877F2",
  tiktok: "#000000",
  youtube: "#FF0000",
  pinterest: "#E60023",
  medium: "#000000",
  website: "#3b82f6",
  email: "#ea4335",
  phone: "#34a853",
  custom: "#6b7280",
};