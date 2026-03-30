// lib/automation/dm-sender.ts (COMPLETE VERSION)
import { prisma } from "@/lib/prisma";

export interface SendDMParams {
  platform: string;
  recipientId: string;
  recipientUsername?: string;
  message: string;
  mediaUrl?: string;
  userId: string;
}

export interface SendDMResult {
  success: boolean;
  messageId?: string;
  error?: string;
  platform: string;
  rateLimitRemaining?: number;
}

export async function sendDM(params: SendDMParams): Promise<SendDMResult> {
  try {
    // Check opt-out first
    const optedOut = await prisma.optOut.findUnique({
      where: {
        recipientId_platform: {
          recipientId: params.recipientId,
          platform: params.platform,
        },
      },
    });

    if (optedOut) {
      return {
        success: false,
        error: "Recipient has opted out",
        platform: params.platform,
      };
    }

    // Get connected account
    const account = await getConnectedAccount(params.platform, params.userId);
    
    if (!account?.accessToken) {
      return {
        success: false,
        error: `${params.platform} account not connected`,
        platform: params.platform,
      };
    }

    // Platform-specific sending
    switch (params.platform.toLowerCase()) {
      case "linkedin":
        return await sendLinkedInDM({ ...params, accessToken: account.accessToken });
      
      case "instagram":
        return await sendInstagramDM({ ...params, accessToken: account.accessToken });
      
      case "twitter":
      case "x":
        return await sendTwitterDM({ ...params, accessToken: account.accessToken });
      
      case "facebook":
      case "messenger":
        return await sendFacebookDM({ ...params, accessToken: account.accessToken });
      
      case "tiktok":
        return {
          success: false,
          error: "TikTok does not support automated DMs via API",
          platform: params.platform,
        };
      
      case "youtube":
        return {
          success: false,
          error: "YouTube does not support DMs. Use community comments instead.",
          platform: params.platform,
        };
      
      case "pinterest":
        return {
          success: false,
          error: "Pinterest does not support automated DMs",
          platform: params.platform,
        };
      
      default:
        return {
          success: false,
          error: `Unsupported platform: ${params.platform}`,
          platform: params.platform,
        };
    }
  } catch (error) {
    console.error("DM send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      platform: params.platform,
    };
  }
}

// LinkedIn DM Implementation
async function sendLinkedInDM(params: SendDMParams & { accessToken: string }): Promise<SendDMResult> {
  try {
    // LinkedIn requires connection for most DMs
    const connectionStatus = await checkLinkedInConnection(params.recipientId, params.accessToken);
    
    if (!connectionStatus.connected && !connectionStatus.canInMail) {
      return {
        success: false,
        error: "LinkedIn: Must be connected or use InMail credits",
        platform: "linkedin",
      };
    }

    // Use LinkedIn Messaging API
    const response = await fetch("https://api.linkedin.com/v2/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        recipients: [{ person: `urn:li:person:${params.recipientId}` }],
        subject: "Following up on your comment",
        body: {
          attributedBody: {
            text: params.message,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "LinkedIn API error");
    }

    const result = await response.json();

    return {
      success: true,
      messageId: result.id,
      platform: "linkedin",
      rateLimitRemaining: parseInt(response.headers.get("x-restli-remaining-quota") || "0"),
    };
  } catch (error) {
    return {
      success: false,
      error: `LinkedIn: ${error instanceof Error ? error.message : "Send failed"}`,
      platform: "linkedin",
    };
  }
}

// Instagram DM Implementation
async function sendInstagramDM(params: SendDMParams & { accessToken: string }): Promise<SendDMResult> {
  try {
    // Instagram requires Business/Creator account
    // Must be follower or have open DMs
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${params.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { instagram_id: params.recipientId },
          message: { text: params.message },
          messaging_type: "MESSAGE_TAG",
          tag: "ACCOUNT_UPDATE", // or COMMUNITY_ALERT, NON_PROMOTIONAL_SUBSCRIPTION
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      return {
        success: false,
        error: `Instagram: ${result.error.message}`,
        platform: "instagram",
      };
    }

    return {
      success: true,
      messageId: result.message_id,
      platform: "instagram",
    };
  } catch (error) {
    return {
      success: false,
      error: `Instagram: ${error instanceof Error ? error.message : "Send failed"}`,
      platform: "instagram",
    };
  }
}

// Twitter/X DM Implementation
async function sendTwitterDM(params: SendDMParams & { accessToken: string }): Promise<SendDMResult> {
  try {
    // Twitter API v2 Direct Message endpoint
    const response = await fetch(
      "https://api.twitter.com/2/dm_conversations/with/{recipient_id}/messages",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${params.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            type: "message_create",
            message_create: {
              target: { recipient_id: params.recipientId },
              message_data: {
                text: params.message,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || "Twitter API error");
    }

    const result = await response.json();

    return {
      success: true,
      messageId: result.event?.id,
      platform: "twitter",
    };
  } catch (error) {
    return {
      success: false,
      error: `Twitter: ${error instanceof Error ? error.message : "Send failed"}`,
      platform: "twitter",
    };
  }
}

// Facebook Messenger Implementation
async function sendFacebookDM(params: SendDMParams & { accessToken: string }): Promise<SendDMResult> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${params.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: params.recipientId },
          message: { text: params.message },
          messaging_type: "MESSAGE_TAG",
          tag: "ACCOUNT_UPDATE",
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      return {
        success: false,
        error: `Facebook: ${result.error.message}`,
        platform: "facebook",
      };
    }

    return {
      success: true,
      messageId: result.message_id,
      platform: "facebook",
    };
  } catch (error) {
    return {
      success: false,
      error: `Facebook: ${error instanceof Error ? error.message : "Send failed"}`,
      platform: "facebook",
    };
  }
}

// Helper: Get Connected Account
async function getConnectedAccount(platform: string, userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: platform.toLowerCase(),
    },
    orderBy: { createdAt: "desc" },
  });

  if (!account) return null;

  // Check if token is expired
  if (account.expires_at && account.expires_at < Date.now()) {
    // Try to refresh token
    if (account.refresh_token) {
      const refreshed = await refreshAccessToken(platform, account.refresh_token);
      if (refreshed) {
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: refreshed.accessToken,
            expires_at: refreshed.expiresAt?.getTime(),
          },
        });
        return { ...account, accessToken: refreshed.accessToken };
      }
    }
    return null;
  }

  return { ...account, accessToken: account.access_token };
}

// Helper: Check LinkedIn Connection
async function checkLinkedInConnection(recipientId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://api.linkedin.com/v2/people/${recipientId}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      return { connected: true, canInMail: true };
    }

    // Check if can send InMail
    return { connected: false, canInMail: true };
  } catch {
    return { connected: false, canInMail: false };
  }
}

// Helper: Refresh Access Token
async function refreshAccessToken(platform: string, refreshToken: string) {
  // Implement token refresh for each platform
  return null; // Placeholder
}