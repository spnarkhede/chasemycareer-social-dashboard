// app/api/posts/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkActionSchema = z.object({
  action: z.enum(["delete", "publish", "schedule", "change-status"]),
  postIds: z.array(z.string()),
  data: z.object({
    status: z.enum(["draft", "scheduled", "published", "backlog"]).optional(),
    scheduledDate: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, postIds, data } = bulkActionSchema.parse(body);

    // Verify all posts belong to user
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        userId: session.user.id,
      },
    });

    if (posts.length !== postIds.length) {
      return NextResponse.json(
        { error: "Some posts not found or unauthorized" },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case "delete":
        result = await prisma.post.deleteMany({
          where: { id: { in: postIds } },
        });
        break;

      case "publish":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            status: "published",
            publishedDate: new Date(),
          },
        });
        break;

      case "schedule":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: {
            status: "scheduled",
            scheduledDate: data?.scheduledDate ? new Date(data.scheduledDate) : null,
          },
        });
        break;

      case "change-status":
        result = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: data?.status || "draft" },
        });
        break;
    }

    // Log activity
    await prisma.activity.createMany({
      data: postIds.map((postId) => ({
        userId: session.user.id,
        action: `post.bulk_${action}`,
        entityType: "Post",
        entityId: postId,
      })),
    });

    return NextResponse.json({
      success: true,
      affected: result.count,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Bulk action failed" },
      { status: 500 }
    );
  }
}