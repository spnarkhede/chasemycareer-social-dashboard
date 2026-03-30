// lib/rss-service.ts
import Parser from "rss-parser";
import { Redis } from "@upstash/redis";

const parser = new Parser({
  customFields: {
    item: ["content:encoded", "dc:creator", "media:content"],
  },
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RSSFeed {
  url: string;
  topic: string;
  name: string;
}

const FEEDS: RSSFeed[] = [
  { url: "https://hbr.org/feed", topic: "research", name: "Harvard Business Review" },
  { url: "https://www.forbes.com/careers/feed/", topic: "business", name: "Forbes Careers" },
  { url: "https://techcrunch.com/feed/", topic: "tools", name: "TechCrunch" },
  { url: "https://venturebeat.com/category/ai/feed/", topic: "ai", name: "VentureBeat AI" },
];

export async function fetchAllFeeds() {
  const cacheKey = "rss:feeds:latest";
  
  // Check cache first (30 min TTL)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const results = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        return feedData.items.map((item) => ({
          id: item.guid || item.link,
          title: item.title,
          summary: item.contentSnippet || item.description?.slice(0, 200),
          content: item.content || item.description,
          link: item.link,
          source: feed.name,
          sourceUrl: feed.url,
          publishDate: item.pubDate || new Date().toISOString(),
          topic: feed.topic as any,
          author: item.creator,
          imageUrl: (item as any)["media:content"]?.[0]?.$?.url,
        }));
      } catch (error) {
        console.error(`Failed to fetch ${feed.url}:`, error);
        return [];
      }
    })
  );

  const allItems = results.flat().sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  // Cache for 30 minutes
  await redis.setex(cacheKey, 1800, JSON.stringify(allItems));

  return allItems;
}