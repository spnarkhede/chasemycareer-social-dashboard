// lib/api/rss-parser.ts
import Parser from "rss-parser";
import { ApiError } from "@/lib/api-error";
import { cache } from "@/lib/api/cache";
import { externalApiRateLimiter } from "@/lib/rate-limit";

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  rssUrl: string;
  topic: string;
  active: boolean;
  lastFetched?: Date;
}

export interface RSSItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  link: string;
  source: string;
  sourceUrl: string;
  publishDate: string;
  topic: string;
  imageUrl?: string;
  author?: string;
}

class RSSParserService {
  private parser: Parser;
  private defaultFeeds: RSSFeed[] = [
    {
      id: "hbr",
      name: "Harvard Business Review",
      url: "https://hbr.org",
      rssUrl: "https://hbr.org/feed",
      topic: "research",
      active: true,
    },
    {
      id: "forbes-careers",
      name: "Forbes Careers",
      url: "https://www.forbes.com/careers",
      rssUrl: "https://www.forbes.com/careers/feed/",
      topic: "business",
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
    {
      id: "venturebeat-ai",
      name: "VentureBeat AI",
      url: "https://venturebeat.com/ai",
      rssUrl: "https://venturebeat.com/category/ai/feed/",
      topic: "ai",
      active: true,
    },
    {
      id: "linkedin-news",
      name: "LinkedIn News",
      url: "https://www.linkedin.com/news",
      rssUrl: "https://www.linkedin.com/news/rss",
      topic: "hiring",
      active: true,
    },
  ];

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ["content:encoded", "content"],
          ["dc:creator", "author"],
          ["media:content", "media"],
          ["enclosure", "enclosure"],
        ],
      },
    });
  }

  private async checkRateLimit(feedId: string) {
    const { success } = await externalApiRateLimiter.limit(`rss:${feedId}`);
    if (!success) {
      throw ApiError.tooManyRequests("RSS feed rate limit exceeded");
    }
  }

  async fetchFeed(feed: RSSFeed): Promise<RSSItem[]> {
    await this.checkRateLimit(feed.id);

    const cacheKey = cache.keys.rss(feed.id);

    return cache.cached(
      cacheKey,
      async () => {
        try {
          const feedData = await this.parser.parseURL(feed.rssUrl);
          
          const items: RSSItem[] = feedData.items.map((item) => ({
            id: item.guid || item.link || crypto.randomUUID(),
            title: item.title || "Untitled",
            summary: item.contentSnippet || item.description?.slice(0, 200) || "",
            content: (item as any).content || item.description || "",
            link: item.link || "",
            source: feed.name,
            sourceUrl: feed.url,
            publishDate: item.pubDate || new Date().toISOString(),
            topic: feed.topic,
            imageUrl: (item as any).media?.[0]?.$?.url || 
                      (item as any).enclosure?.[0]?.$.url,
            author: (item as any).author || item.creator,
          }));

          // Update last fetched time
          await this.updateLastFetched(feed.id);

          return items;
        } catch (error) {
          console.error(`Failed to fetch RSS feed ${feed.id}:`, error);
          throw ApiError.externalApi(
            `Failed to fetch RSS feed: ${feed.name}`,
            { feedId: feed.id, error }
          );
        }
      },
      { ttl: 1800 } // Cache for 30 minutes
    );
  }

  async fetchAllFeeds(): Promise<RSSItem[]> {
    const activeFeeds = this.defaultFeeds.filter((f) => f.active);

    const results = await Promise.allSettled(
      activeFeeds.map((feed) => this.fetchFeed(feed))
    );

    const allItems: RSSItem[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      } else {
        console.error(`Failed to fetch feed ${activeFeeds[index].id}:`, result.reason);
      }
    });

    // Sort by publish date (newest first)
    return allItems.sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  async fetchByTopic(topic: string): Promise<RSSItem[]> {
    const feeds = this.defaultFeeds.filter(
      (f) => f.active && f.topic === topic
    );

    const results = await Promise.allSettled(
      feeds.map((feed) => this.fetchFeed(feed))
    );

    const items: RSSItem[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        items.push(...result.value);
      }
    });

    return items.sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  private async updateLastFetched(feedId: string) {
    await cache.set(`rss:lastFetched:${feedId}`, new Date().toISOString(), {
      ttl: 86400,
    });
  }

  async getLastFetched(feedId: string): Promise<Date | null> {
    const lastFetched = await cache.get<string>(`rss:lastFetched:${feedId}`);
    return lastFetched ? new Date(lastFetched) : null;
  }

  getFeeds(): RSSFeed[] {
    return this.defaultFeeds;
  }

  async addFeed(feed: Omit<RSSFeed, "id" | "lastFetched">): Promise<RSSFeed> {
    const newFeed: RSSFeed = {
      ...feed,
      id: crypto.randomUUID(),
      lastFetched: undefined,
    };
    this.defaultFeeds.push(newFeed);
    return newFeed;
  }

  async removeFeed(feedId: string): Promise<void> {
    const index = this.defaultFeeds.findIndex((f) => f.id === feedId);
    if (index !== -1) {
      this.defaultFeeds.splice(index, 1);
      await cache.deleteByPattern(`rss:${feedId}*`);
    }
  }
}

export const rssParser = new RSSParserService();