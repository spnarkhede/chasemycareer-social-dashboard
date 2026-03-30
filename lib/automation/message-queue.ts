// lib/automation/message-queue.ts
import { prisma } from "@/lib/prisma";
import { QueueStatus } from "@prisma/client";
import { sendDM } from "./dm-sender";
import { checkRateLimit } from "./rate-limiter";

export interface QueueMessage {
  userId: string;
  platform: string;
  recipientId: string;
  recipientName: string;
  messageContent: string;
  templateId?: string;
  ruleId?: string;
  priority?: number;
  scheduledAt?: Date;
}

export async function addToQueue(message: QueueMessage) {
  const queueItem = await prisma.messageQueue.create({
     {
      userId: message.userId,
      platform: message.platform,
      recipientId: message.recipientId,
      recipientName: message.recipientName,
      messageContent: message.messageContent,
      templateId: message.templateId,
      ruleId: message.ruleId,
      priority: message.priority || 0,
      scheduledAt: message.scheduledAt,
      status: message.scheduledAt ? "DELAYED" : "PENDING",
    },
  });

  return queueItem;
}

export async function processQueue(platform?: string, limit = 50) {
  const now = new Date();

  // Get pending messages
  const messages = await prisma.messageQueue.findMany({
    where: {
      status: "PENDING",
      platform: platform ? platform : undefined,
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: now } },
      ],
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
    take: limit,
  });

  const results = {
    total: messages.length,
    success: 0,
    failed: 0,
    skipped: 0,
  };

  for (const message of messages) {
    try {
      // Update status to processing
      await prisma.messageQueue.update({
        where: { id: message.id },
         { status: "PROCESSING" },
      });

      // Check rate limit
      const rateLimit = await checkRateLimit(message.platform, message.userId);
      
      if (!rateLimit.allowed) {
        await prisma.messageQueue.update({
          where: { id: message.id },
           {
            status: "DELAYED",
            scheduledAt: new Date(Date.now() + rateLimit.retryAfter * 1000),
          },
        });
        results.skipped++;
        continue;
      }

      // Send DM
      const sendResult = await sendDM({
        platform: message.platform,
        recipientId: message.recipientId,
        message: message.messageContent,
      });

      if (sendResult.success) {
        await prisma.messageQueue.update({
          where: { id: message.id },
           {
            status: "SENT",
            sentAt: new Date(),
          },
        });

        // Update execution log
        if (message.ruleId) {
          await prisma.automationExecution.updateMany({
            where: { ruleId: message.ruleId, recipientId: message.recipientId },
             {
              status: "SENT",
              sentAt: new Date(),
            },
          });
        }

        // Update template usage
        if (message.templateId) {
          await prisma.dmTemplate.update({
            where: { id: message.templateId },
             { usageCount: { increment: 1 } },
          });
        }

        results.success++;
      } else {
        throw new Error(sendResult.error || "Send failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Check if should retry
      if (message.retryCount < message.maxRetries) {
        await prisma.messageQueue.update({
          where: { id: message.id },
           {
            status: "PENDING",
            retryCount: { increment: 1 },
            errorMessage,
            scheduledAt: new Date(Date.now() + Math.pow(2, message.retryCount) * 60 * 1000), // Exponential backoff
          },
        });
      } else {
        await prisma.messageQueue.update({
          where: { id: message.id },
           {
            status: "FAILED",
            errorMessage,
          },
        });

        // Update execution log
        if (message.ruleId) {
          await prisma.automationExecution.updateMany({
            where: { ruleId: message.ruleId, recipientId: message.recipientId },
             {
              status: "FAILED",
              errorMessage,
            },
          });
        }
      }

      results.failed++;
      console.error("Queue processing error:", errorMessage);
    }
  }

  return results;
}

export async function getQueueStats(userId: string) {
  const stats = await prisma.messageQueue.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sentToday = await prisma.messageQueue.count({
    where: {
      userId,
      status: "SENT",
      sentAt: { gte: today },
    },
  });

  return {
    byStatus: stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>),
    sentToday,
  };
}