// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateCompleteContent } from "@/lib/ai/content-generator";
import { ApiError, handleApiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generationRequestSchema = z.object({
  topic: z.string().min(3).max(200),
  platforms: z.array(z.string()).min(1),
  tone: z.enum(["professional", "casual", "inspirational", "educational", "promotional"]).optional(),
  targetAudience: z.string().optional(),
  goal: z.enum(["awareness", "engagement", "leads", "sales"]).optional(),
  includeMedia: z.boolean().default(true),
  includeVideo: z.boolean().default(false),
  includeCarousel: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      throw ApiError.unauthorized();
    }

    // Check rate limit (stricter for AI generation)
    const rateLimit = await checkRateLimit(session.user.id);
    if (!rateLimit.success) {
      throw ApiError.tooManyRequests("AI generation limit exceeded. Try again in a few minutes.");
    }

    // Parse request body
    const body = await request.json();
    const validation = generationRequestSchema.safeParse(body);

    if (!validation.success) {
      throw ApiError.badRequest("Invalid request", validation.error.errors);
    }

    // Generate content
    const result = await generateCompleteContent(validation.data);

    if (!result.success) {
      throw ApiError.externalApi("Failed to generate content");
    }

    // Store generation history in database
    await prisma.activity.create({
       {
        userId: session.user.id,
        action: "ai.content_generated",
        entityType: "AIContent",
        meta {
          topic: validation.data.topic,
          platforms: validation.data.platforms,
          contentCount: result.contents.length,
          generationTime: result.generationTime,
        },
      },
    });

    // Save generated content to database
    for (const content of result.contents) {
      await prisma.post.create({
         {
          userId: session.user.id,
          caption: content.caption,
          platforms: [content.platform],
          type: content.contentType,
          status: "draft",
          tags: content.hashtags,
          metadata: {
            aiGenerated: true,
            topic: content.topic,
            keywords: content.keywords,
            estimatedReach: content.estimatedReach,
            media: content.media,
            carouselSlides: content.carouselSlides,
            videoScript: content.videoScript,
            seoMetadata: content.seoMetadata,
          },
        },
      });
    }

    return NextResponse.json(result, {
      headers: {
        ...rateLimit.headers,
        "X-Generation-Time": result.generationTime.toString(),
      },
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Content Generation API",
    endpoints: {
      POST: "/api/ai/generate - Generate content for topic",
    },
    limits: {
      requestsPerHour: 50,
      platformsPerRequest: 9,
    },
  });
}