// app/api/cron/process-posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { metricool } from "@/lib/api/metricool";
import { socialClient } from "@/lib/api/social";
import { verifyCronSignature } from "@/lib/cron";

export async function POST(request: NextRequest) {
  const isValid = await verifyCronSignature(request);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all scheduled posts that should be published now
    const duePosts = await prisma.post.findMany({
      where: {
        status: "scheduled",
        scheduledDate: {
          lte: new Date(),
        },
      },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    const results = {
      total: duePosts.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const post of duePosts) {
      try {
        // Publish to each platform
        for (const platform of post.platforms) {
          // Check if user has connected account for this platform
          const account = post.user.accounts.find(
            (a) => a.provider.toLowerCase() === platform.toLowerCase()
          );

          if (!account?.access_token) {
            // Try Metricool as fallback
            await metricool.createPost({
              platform,
              content: post.caption,
              media: post.mediaUrl ? [post.mediaUrl] : undefined,
            });
          } else {
            // Publish directly via platform API
            await socialClient.publish(platform, {
              id: account.id,
              platform,
              accountId: account.providerAccountId,
              accountName: "",
              accessToken: account.access_token,
              refreshToken: account.refresh_token || undefined,
              expiresAt: account.expires_at ? new Date(account.expires_at) : undefined,
              userId: post.userId,
            }, {
              content: post.caption,
              media: post.mediaUrl ? [post.mediaUrl] : undefined,
            });
          }
        }

        // Update post status
        await prisma.post.update({
          where: { id: post.id },
           {
            status: "published",
            publishedDate: new Date(),
          },
        });

        // Log activity
        await prisma.activity.create({
           {
            userId: post.userId,
            action: "post.auto_published",
            entityType: "Post",
            entityId: post.id,
            metadata: { platforms: post.platforms },
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Post ${post.id}: ${(error as Error).message}`);

        // Mark post as failed
        await prisma.post.update({
          where: { id: post.id },
           { status: "failed" },
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}