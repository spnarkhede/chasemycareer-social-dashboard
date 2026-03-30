// app/dashboard/news/lib/rssFeeds.ts
import { NewsSource } from "@/types/news";

export const RSS_FEEDS: NewsSource[] = [
  // Tools & Technology
  {
    id: "product-hunt",
    name: "Product Hunt",
    url: "https://www.producthunt.com",
    rssUrl: "https://www.producthunt.com/feed",
    topic: "tools",
    active: true,
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com",
    rssUrl: "https://techcrunch.com/feed/",
    topic: "tools",
    active: true,
  },
  
  // Research & Studies
  {
    id: "hbr",
    name: "Harvard Business Review",
    url: "https://hbr.org",
    rssUrl: "https://hbr.org/feed",
    topic: "research",
    active: true,
  },
  {
    id: "apa",
    name: "APA Psychology",
    url: "https://www.apa.org",
    rssUrl: "https://www.apa.org/news/press/releases/rss",
    topic: "research",
    active: true,
  },
  
  // Business & Careers
  {
    id: "forbes-careers",
    name: "Forbes Careers",
    url: "https://www.forbes.com/careers",
    rssUrl: "https://www.forbes.com/careers/feed/",
    topic: "business",
    active: true,
  },
  {
    id: "fast-company",
    name: "Fast Company",
    url: "https://www.fastcompany.com",
    rssUrl: "https://www.fastcompany.com/rss",
    topic: "business",
    active: true,
  },
  
  // Hiring & Jobs
  {
    id: "linkedin-news",
    name: "LinkedIn News",
    url: "https://www.linkedin.com/news",
    rssUrl: "https://www.linkedin.com/news/rss",
    topic: "hiring",
    active: true,
  },
  {
    id: "indeed-hiring",
    name: "Indeed Hiring Lab",
    url: "https://www.hiringlab.org",
    rssUrl: "https://www.hiringlab.org/feed/",
    topic: "hiring",
    active: true,
  },
  
  // AI & Career Tech
  {
    id: "ai-careers",
    name: "AI in Careers",
    url: "https://www.aicareers.io",
    rssUrl: "https://www.aicareers.io/feed",
    topic: "ai",
    active: true,
  },
  {
    id: "venturebeat-ai",
    name: "VentureBeat AI",
    url: "https://venturebeat.com/ai",
    rssUrl: "https://venturebeat.com/category/ai/feed/",
    topic: "ai",
    active: true,
  },
];

export const TOPIC_CONFIG: Record<NewsTopic, { label: string; color: string; icon: string }> = {
  all: { label: "All News", color: "bg-primary", icon: "📰" },
  tools: { label: "Tools & Tech", color: "bg-blue-500", icon: "🛠️" },
  research: { label: "Research", color: "bg-purple-500", icon: "📊" },
  business: { label: "Business", color: "bg-green-500", icon: "💼" },
  hiring: { label: "Hiring Trends", color: "bg-orange-500", icon: "👥" },
  ai: { label: "AI & Automation", color: "bg-pink-500", icon: "🤖" },
};