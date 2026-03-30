// lib/rss.ts
import Parser from "rss-parser";

const parser = new Parser();

const nicheFeeds = {
  tools: [
    "https://www.producthunt.com/feed",
    "https://news.ycombinator.com/rss",
  ],
  research: [
    "https://hbr.org/feed",
    "https://www.apa.org/news/press/releases/rss",
  ],
  business: [
    "https://www.forbes.com/careers/feed/",
    "https://www.fastcompany.com/rss",
  ],
};

export async function fetchNews(topic: keyof typeof nicheFeeds = "tools") {
  const feeds = nicheFeeds[topic];
  const items = [];
  
  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const filtered = feed.items
        .slice(0, 5)
        .map(item => ({
          id: item.guid || item.link,
          title: item.title || "Untitled",
          source: feed.title || new URL(feedUrl).hostname,
          publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          summary: item.contentSnippet || item.description?.slice(0, 200) + "...",
          link: item.link || "",
          topic,
        }));
      items.push(...filtered);
    } catch (error) {
      console.error(`Failed to fetch ${feedUrl}:`, error);
    }
  }
  
  return items.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
}