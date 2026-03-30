// types/news.ts
export type NewsTopic = "tools" | "research" | "business" | "hiring" | "ai" | "all";

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  topic: NewsTopic;
  logo?: string;
  active: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  link: string;
  source: string;
  sourceUrl: string;
  publishDate: string;
  topic: NewsTopic;
  imageUrl?: string;
  author?: string;
  saved: boolean;
  read: boolean;
}

export interface NewsFilters {
  topic: NewsTopic;
  sources: string[];
  search: string;
  dateRange: "today" | "week" | "month" | "all";
  showSaved: boolean;
}