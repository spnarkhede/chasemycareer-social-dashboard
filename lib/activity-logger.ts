// lib/activity-logger.ts
import { prisma } from "@/lib/prisma";

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  await prisma.activity.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}

// Usage in API routes:
await logActivity({
  userId: session.user.id,
  action: "post.published",
  entityType: "Post",
  entityId: post.id,
  metadata: { platforms: post.platforms, scheduledDate: post.scheduledDate },
});