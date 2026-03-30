// app/api/metricool/route.ts
import { NextRequest, NextResponse } from "next/server";
import { metricoolReal } from "@/lib/metricool-real";
import { ratelimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  // Rate limiting
  const { success, limit, reset, remaining } = await ratelimit.limit(
    request.headers.get("x-user-id") || "anonymous"
  );

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const params = Object.fromEntries(searchParams.entries());

    let data;
    switch (endpoint) {
      case "analytics":
        data = await metricoolReal.getAnalytics({
          startDate: new Date(params.startDate),
          endDate: new Date(params.endDate),
          platforms: params.platforms?.split(",") || [],
        });
        break;
      case "posts":
        data = await metricoolReal.getPosts({
          platform: params.platform,
          status: params.status as any,
          limit: parseInt(params.limit) || 50,
        });
        break;
      case "competitors":
        data = await metricoolReal.getCompetitors({
          platform: params.platform!,
          handles: params.handles?.split(",") || [],
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Metricool API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}