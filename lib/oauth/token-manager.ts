// lib/oauth/token-manager.ts
import { prisma } from "@/lib/prisma";
import { refreshLinkedInToken } from "./linkedin";
import { refreshInstagramToken } from "./instagram";
import { refreshTwitterToken } from "./twitter";

export async function getValidAccessToken(
  userId: string,
  platform: string
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: platform.toLowerCase() },
  });

  if (!account?.access_token) {
    return null;
  }

  // Check if token is expired
  if (account.expires_at && account.expires_at < Date.now()) {
    // Try to refresh
    if (account.refresh_token) {
      const refreshed = await refreshAccessToken(platform, account.refresh_token);
      
      if (refreshed) {
        await prisma.account.update({
          where: { id: account.id },
           {
            access_token: refreshed.accessToken,
            refresh_token: refreshed.refreshToken,
            expires_at: refreshed.expiresAt,
          },
        });
        return refreshed.accessToken;
      }
    }
    return null;
  }

  return account.access_token;
}

export async function refreshAccessToken(
  platform: string,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string; expiresAt: Date } | null> {
  try {
    switch (platform.toLowerCase()) {
      case "linkedin":
        const linkedin = await refreshLinkedInToken(refreshToken);
        return {
          accessToken: linkedin.accessToken,
          refreshToken: linkedin.refreshToken,
          expiresAt: new Date(Date.now() + linkedin.expiresIn * 1000),
        };
      
      case "instagram":
        return await refreshInstagramToken(refreshToken);
      
      case "twitter":
        return await refreshTwitterToken(refreshToken);
      
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to refresh ${platform} token:`, error);
    return null;
  }
}

export async function storeConnectedAccount( {
  userId,
  platform,
  accessToken,
  refreshToken,
  expiresIn,
  accountId,
  accountName,
  accountEmail,
}: {
  userId: string;
  platform: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountId: string;
  accountName: string;
  accountEmail?: string;
}) {
  return await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: platform.toLowerCase(),
        providerAccountId: accountId,
      },
    },
    update: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
    },
    create: {
      userId,
      provider: platform.toLowerCase(),
      providerAccountId: accountId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
      token_type: "Bearer",
      scope: "read write",
    },
  });
}