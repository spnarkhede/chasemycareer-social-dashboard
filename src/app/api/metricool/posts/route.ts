// app/api/metricool/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { metricool } from "@/lib/api/metricool";
import { ApiError, handleApiError } from "@/lib/api-error";
import { checkRateLimit, postRateLimiter } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPostSchema = z.object({
  caption: z.string().min(1).max(2200),
  platforms: z.array(z.string()).min(1),
  type: z.enum(["text", "carousel", "image", "reel", "video", "diagram"]),
  status: z.enum(["draft", "scheduled", "backlog"]),
  scheduledDate: z.string().transform((s) => s ? new Date(s) : undefined).optional(),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

// GET - List posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    const rateLimit = await checkRateLimit(session.user.id);

    const searchParams = request.nextUrl.searchParams;
    const posts = await metricool.getPosts({
      platform: searchParams.get("platform") || undefined,
      status: searchParams.get("status") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      page: parseInt(searchParams.get("page") || "1"),
    });

    // Also fetch from local database
    const localPosts = await prisma.post.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      metricool: posts,
      local: localPosts,
    }, { headers: rateLimit.headers });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// POST - Create post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    // Check post creation rate limit
    const rateLimit = await postRateLimiter.limit(session.user.id);
    if (!rateLimit.success) {
      throw ApiError.tooManyRequests("Post creation limit exceeded");
    }

    const body = await request.json();
    const validation = createPostSchema.safeParse(body);

    if (!validation.success) {
      throw ApiError.badRequest("Invalid post data", validation.error.errors);
    }

    // Create in local database first
    const localPost = await prisma.post.create({
       {
        userId: session.user.id,
        caption: validation.data.caption,
        platforms: validation.data.platforms,
        type: validation.data.type,
        status: validation.data.status,
        scheduledDate: validation.data.scheduledDate,
        mediaUrl: validation.data.mediaUrl,
        tags: validation.data.tags,
      },
    });

    // If status is scheduled, also create in Metricool
    let metricoolPost = null;
    if (validation.data.status === "scheduled" && validation.data.scheduledDate) {
      metricoolPost = await Promise.all(
        validation.data.platforms.map((platform) =>
          metricool.createPost({
            platform,
            content: validation.data.caption,
            scheduledDate: validation.data.scheduledDate,
            media: validation.data.mediaUrl ? [validation.data.mediaUrl] : undefined,
          }).catch((error) => {
            console.error(`Failed to create post on ${platform}:`, error);
            return null;
          })
        )
      );
    }

    // Log activity
    await prisma.activity.create({
       {
        userId: session.user.id,
        action: "post.created",
        entityType: "Post",
        entityId: localPost.id,
        metadata: { platforms: validation.data.platforms },
      },
    });

    return NextResponse.json({
      local: localPost,
      metricool: metricoolPost,
    }, { 
      status: 201,
      headers: {
        "X-RateLimit-Limit": rateLimit.limit.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.reset.toString(),
      }
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}