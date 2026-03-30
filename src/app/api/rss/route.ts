// app/api/rss/route.ts
import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get("url");
  
  if (!feedUrl) {
    return NextResponse.json({ error: "Feed URL required" }, { status: 400 });
  }

  try {
    const feed = await parser.parseURL(feedUrl);
    return NextResponse.json({
      title: feed.title,
      items: feed.items.map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content,
        contentSnippet: item.contentSnippet,
        creator: item.creator,
      })),
    });
  } catch (error) {
    console.error("RSS fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}