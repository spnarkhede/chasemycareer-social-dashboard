// lib/utils/opt-out-manager.ts
import { prisma } from "@/lib/prisma";

export async function isOptedOut(recipientId: string, platform: string): Promise<boolean> {
  const optOut = await prisma.optOut.findUnique({
    where: {
      recipientId_platform: {
        recipientId,
        platform,
      },
    },
  });

  return !!optOut;
}

export async function addOptOut(data: {
  recipientId: string;
  recipientEmail?: string;
  platform: string;
  reason?: string;
  userId?: string;
}) {
  return await prisma.optOut.upsert({
    where: {
      recipientId_platform: {
        recipientId: data.recipientId,
        platform: data.platform,
      },
    },
    update: {
      reason: data.reason,
    },
    create: data,
  });
}

export async function removeOptOut(recipientId: string, platform: string) {
  return await prisma.optOut.delete({
    where: {
      recipientId_platform: {
        recipientId,
        platform,
      },
    },
  });
}

export async function getOptOuts(userId?: string) {
  return await prisma.optOut.findMany({
    where: { userId: userId || undefined },
    orderBy: { createdAt: "desc" },
  });
}