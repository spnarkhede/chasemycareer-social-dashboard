// app/api/rss/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rssParser } from "@/lib/api/rss-parser";
import { ApiError, handleApiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const feedQuerySchema = z.object({
  topic: z.enum(["all", "tools", "research", "business", "hiring", "ai"]).optional(),
  limit: z.string().transform((s) => parseInt(s) || 20).optional(),
  source: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    const rateLimit = await checkRateLimit(session.user.id);

    const searchParams = request.nextUrl.searchParams;
    const validation = feedQuerySchema.safeParse({
      topic: searchParams.get("topic"),
      limit: searchParams.get("limit"),
      source: searchParams.get("source"),
    });

    if (!validation.success) {
      throw ApiError.badRequest("Invalid query parameters", validation.error.errors);
    }

    let items;
    if (validation.data.topic && validation.data.topic !== "all") {
      items = await rssParser.fetchByTopic(validation.data.topic);
    } else {
      items = await rssParser.fetchAllFeeds();
    }

    // Filter by source if specified
    if (validation.data.source) {
      items = items.filter((item) => 
        item.source.toLowerCase().includes(validation.data.source!.toLowerCase())
      );
    }

    // Apply limit
    items = items.slice(0, validation.data.limit);

    return NextResponse.json({
      items,
      count: items.length,
      sources: rssParser.getFeeds(),
    }, { headers: rateLimit.headers });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}