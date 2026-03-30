// app/api/metricool/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { metricool } from "@/lib/api/metricool";
import { ApiError, handleApiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const analyticsSchema = z.object({
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  platforms: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  granularity: z.enum(["day", "week", "month"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(session.user.id);
    const headers = rateLimit.headers;

    if (!rateLimit.success) {
      throw ApiError.tooManyRequests();
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const validation = analyticsSchema.safeParse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      platforms: searchParams.get("platforms")?.split(",") || [],
      metrics: searchParams.get("metrics")?.split(",") || [],
      granularity: searchParams.get("granularity"),
    });

    if (!validation.success) {
      throw ApiError.badRequest("Invalid parameters", validation.error.errors);
    }

    // Fetch analytics from Metricool
    const analytics = await metricool.getAnalytics(validation.data);

    // Also store in local database for historical tracking
    await prisma.activity.create({
       {
        userId: session.user.id,
        action: "api.analytics_fetched",
        entityType: "Analytics",
        metadata: {
          startDate: validation.data.startDate,
          endDate: validation.data.endDate,
          platforms: validation.data.platforms,
        },
      },
    });

    return NextResponse.json(analytics, { headers });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}