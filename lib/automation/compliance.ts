// lib/automation/compliance.ts
import { prisma } from "@/lib/prisma";

export interface ComplianceCheck {
  platform: string;
  recipientId: string;
  messageType: string;
}

export async function checkCompliance(check: ComplianceCheck): Promise<{ allowed: boolean; reason?: string }> {
  // Check opt-out list
  const optOut = await prisma.optOut.findUnique({
    where: {
      recipientId_platform: {
        recipientId: check.recipientId,
        platform: check.platform,
      },
    },
  });

  if (optOut) {
    return { allowed: false, reason: "User has opted out" };
  }

  // Platform-specific compliance
  switch (check.platform.toLowerCase()) {
    case "linkedin":
      return checkLinkedInCompliance(check);
    case "instagram":
      return checkInstagramCompliance(check);
    case "twitter":
      return checkTwitterCompliance(check);
    case "facebook":
      return checkFacebookCompliance(check);
    default:
      return { allowed: true };
  }
}

async function checkLinkedInCompliance(check: ComplianceCheck): Promise<{ allowed: boolean; reason?: string }> {
  // LinkedIn requires existing connection for most DMs
  // Check if connected
  const isConnected = await checkLinkedInConnection(check.recipientId);
  
  if (!isConnected) {
    // Allow only InMail or if user has open profile
    return { allowed: false, reason: "LinkedIn: No connection. Use InMail or connection request first." };
  }

  // Check message frequency
  const recentMessages = await countRecentMessages(check.platform, check.recipientId, 24);
  if (recentMessages >= 3) {
    return { allowed: false, reason: "LinkedIn: Too many messages to this user recently" };
  }

  return { allowed: true };
}

async function checkInstagramCompliance(check: ComplianceCheck): Promise<{ allowed: boolean; reason?: string }> {
  // Instagram allows DMs to followers and people you follow
  // Check if follower
  const isFollower = await checkInstagramFollower(check.recipientId);
  
  if (!isFollower) {
    return { allowed: false, reason: "Instagram: User is not a follower" };
  }

  return { allowed: true };
}

async function checkTwitterCompliance(check: ComplianceCheck): Promise<{ allowed: boolean; reason?: string }> {
  // Twitter allows DMs if user follows you or has open DMs
  const canDM = await checkTwitterDMPermission(check.recipientId);
  
  if (!canDM) {
    return { allowed: false, reason: "Twitter: Cannot DM this user" };
  }

  return { allowed: true };
}

async function checkFacebookCompliance(check: ComplianceCheck): Promise<{ allowed: boolean; reason?: string }> {
  // Facebook Messenger requires 24-hour window or specific tags
  const isInWindow = await checkFacebook24HourWindow(check.recipientId);
  
  if (!isInWindow) {
    // Can only send with specific tags (ACCOUNT_UPDATE, etc.)
    if (check.messageType !== "ACCOUNT_UPDATE") {
      return { allowed: false, reason: "Facebook: Outside 24-hour window" };
    }
  }

  return { allowed: true };
}

// Helper functions (implement with platform APIs)
async function checkLinkedInConnection(recipientId: string): Promise<boolean> {
  // Implement with LinkedIn API
  return true; // Placeholder
}

async function checkInstagramFollower(recipientId: string): Promise<boolean> {
  // Implement with Instagram API
  return true; // Placeholder
}

async function checkTwitterDMPermission(recipientId: string): Promise<boolean> {
  // Implement with Twitter API
  return true; // Placeholder
}

async function checkFacebook24HourWindow(recipientId: string): Promise<boolean> {
  // Implement with Facebook API
  return true; // Placeholder
}

async function countRecentMessages(platform: string, recipientId: string, hours: number): Promise<number> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const count = await prisma.automationExecution.count({
    where: {
      recipientId,
      platform,
      status: "SENT",
      sentAt: { gte: cutoff },
    },
  });

  return count;
}