// lib/oauth/oauth-manager.ts
import { prisma } from "@/lib/prisma";
import { linkedinOAuth } from "./linkedin";
import { instagramOAuth } from "./instagram";
import { twitterOAuth } from "./twitter";
import { facebookOAuth } from "./facebook";
import { tiktokOAuth } from "./tiktok";
import { youtubeOAuth } from "./youtube";
import { pinterestOAuth } from "./pinterest";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: Date;
}

export interface OAuthProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
}

export class OAuthManager {
  private static platforms: Record<string, any> = {
    linkedin: linkedinOAuth,
    instagram: instagramOAuth,
    twitter: twitterOAuth,
    facebook: facebookOAuth,
    tiktok: tiktokOAuth,
    youtube: youtubeOAuth,
    pinterest: pinterestOAuth,
  };

  static getAuthUrl(platform: string, state: string): string {
    const provider = this.platforms[platform];
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return provider.getAuthUrl(state);
  }

  static async exchangeCode(platform: string, code: string): Promise<{
    token: OAuthToken;
    profile: OAuthProfile;
  }> {
    const provider = this.platforms[platform];
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const tokenData = await provider.exchangeCode(code);
    const profile = await provider.getProfile(tokenData.accessToken);

    return {
      token: {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
        expiresAt: new Date(Date.now() + tokenData.expiresIn * 1000),
      },
      profile,
    };
  }

  static async refreshToken(platform: string, refreshToken: string): Promise<OAuthToken> {
    const provider = this.platforms[platform];
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const tokenData = await provider.refreshToken(refreshToken);

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || refreshToken,
      expiresIn: tokenData.expiresIn,
      expiresAt: new Date(Date.now() + tokenData.expiresIn * 1000),
    };
  }

  static async getValidToken(userId: string, platform: string): Promise<string | null> {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: platform.toLowerCase(),
      },
    });

    if (!account?.access_token) {
      return null;
    }

    // Check if token is expired or expires in less than 5 minutes
    if (account.expires_at && account.expires_at < Date.now() + 5 * 60 * 1000) {
      if (account.refresh_token) {
        try {
          const newToken = await this.refreshToken(platform, account.refresh_token);
          
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: newToken.accessToken,
              refresh_token: newToken.refreshToken,
              expires_at: newToken.expiresAt,
            },
          });

          return newToken.accessToken;
        } catch (error) {
          console.error(`Failed to refresh ${platform} token:`, error);
          return null;
        }
      }
      return null;
    }

    return account.access_token;
  }

  static async disconnectAccount(userId: string, platform: string): Promise<void> {
    await prisma.account.deleteMany({
      where: {
        userId,
        provider: platform.toLowerCase(),
      },
    });
  }

  static async getConnectedAccounts(userId: string) {
    return await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        createdAt: true,
        expires_at: true,
      },
    });
  }
}

export const oauthManager = OAuthManager;